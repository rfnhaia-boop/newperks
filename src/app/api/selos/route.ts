import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Carimba (+1) ou resgata o cartão do cliente.
// body: { clienteId, acao: "carimbar" | "resgatar" }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { clienteId, acao = "carimbar" } = await req.json();
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

  // acao === "carimbar"
  if (cartao.selos >= lojista.selosParaGanhar) {
    return NextResponse.json({ error: "Cartão completo — resgate antes de continuar" }, { status: 400 });
  }

  const novosSelos = cartao.selos + 1;
  const completou = novosSelos >= lojista.selosParaGanhar;

  const atualizado = await prisma.cartao.update({
    where: { id: cartao.id },
    data: { selos: novosSelos, totalCarimbos: cartao.totalCarimbos + 1 },
    include: { cliente: true },
  });

  return NextResponse.json({ cartao: atualizado, completou, recompensa: lojista.recompensa });
}
