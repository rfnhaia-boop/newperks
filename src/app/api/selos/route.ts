import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, { max: 30, windowSec: 60 });
  if (blocked) return blocked;

  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { clienteId, acao = "carimbar", descricao, valor } = await req.json();
  if (!clienteId) return NextResponse.json({ error: "clienteId obrigatório" }, { status: 400 });

  const lojista = await prisma.lojista.findUnique({ where: { id: session.user.id } });
  if (!lojista) return NextResponse.json({ error: "Lojista não encontrado" }, { status: 404 });

  let cartao = await prisma.cartao.findUnique({
    where: { lojistaId_clienteId: { lojistaId: lojista.id, clienteId } },
  });

  if (!cartao) {
    cartao = await prisma.cartao.create({
      data: { lojistaId: lojista.id, clienteId, selos: 0, token: randomBytes(12).toString("hex") },
    });
  }

  if (acao === "resgatar") {
    if (cartao.selos < lojista.selosParaGanhar) {
      return NextResponse.json({ error: "Cartão ainda não está completo" }, { status: 400 });
    }
    const atualizado = await prisma.cartao.update({
      where: { id: cartao.id },
      data: { selos: 0, resgates: cartao.resgates + 1 },
      include: { cliente: true },
    });
    return NextResponse.json({ cartao: atualizado, resgatou: true, recompensa: lojista.recompensa });
  }

  // Desfaz o último carimbo (erro de operação no balcão)
  if (acao === "desfazer") {
    if (cartao.selos === 0) {
      return NextResponse.json({ error: "Nada para desfazer" }, { status: 400 });
    }
    const ultimo = await prisma.carimbo.findFirst({
      where: { cartaoId: cartao.id },
      orderBy: { createdAt: "desc" },
    });
    const [atualizado] = await prisma.$transaction([
      prisma.cartao.update({
        where: { id: cartao.id },
        data: {
          selos: cartao.selos - 1,
          totalCarimbos: Math.max(0, cartao.totalCarimbos - 1),
        },
        include: { cliente: true },
      }),
      ...(ultimo ? [prisma.carimbo.delete({ where: { id: ultimo.id } })] : []),
    ]);
    return NextResponse.json({ cartao: atualizado, desfez: true });
  }

  // acao === "carimbar"
  if (cartao.selos >= lojista.selosParaGanhar) {
    return NextResponse.json({ error: "Cartão completo — resgate antes de continuar" }, { status: 400 });
  }

  const novosSelos = cartao.selos + 1;
  const completou = novosSelos >= lojista.selosParaGanhar;

  const [atualizado] = await prisma.$transaction([
    prisma.cartao.update({
      where: { id: cartao.id },
      data: { selos: novosSelos, totalCarimbos: cartao.totalCarimbos + 1 },
      include: { cliente: true },
    }),
    prisma.carimbo.create({
      data: {
        cartaoId: cartao.id,
        descricao: descricao?.trim() || null,
        valor: valor ? parseFloat(valor) : null,
      },
    }),
  ]);

  return NextResponse.json({ cartao: atualizado, completou, recompensa: lojista.recompensa });
}
