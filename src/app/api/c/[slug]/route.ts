import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { enviarLinkCartao } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

// Dados públicos do lojista (tela inicial do QR)
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lojista = await prisma.lojista.findUnique({
    where: { slug },
    select: { id: true, nomeNegocio: true, tema: true, selosParaGanhar: true, recompensa: true },
  });
  if (!lojista) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(lojista);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const blocked = rateLimit(req, { max: 10, windowSec: 60 });
  if (blocked) return blocked;

  const { slug } = await params;
  const { nome, email, telefone, modo } = await req.json();

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
  }
  const emailNorm = email.trim().toLowerCase();

  const lojista = await prisma.lojista.findUnique({ where: { slug } });
  if (!lojista) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  // Modo "entrar": cliente já tem cartão nesta loja — recupera pelo email
  if (modo === "entrar") {
    const cliente = await prisma.cliente.findUnique({ where: { email: emailNorm } });
    const cartao = cliente
      ? await prisma.cartao.findUnique({
          where: { lojistaId_clienteId: { lojistaId: lojista.id, clienteId: cliente.id } },
        })
      : null;

    if (!cartao) {
      return NextResponse.json(
        { error: "Não achamos cartão com esse email aqui. Faça seu cadastro." },
        { status: 404 }
      );
    }

    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3001";
    return NextResponse.json({ token: cartao.token, link: `${base}/cartao/${cartao.token}` });
  }

  if (!nome?.trim()) {
    return NextResponse.json({ error: "Nome e email são obrigatórios" }, { status: 400 });
  }

  // Upsert cliente por email
  let cliente = await prisma.cliente.findUnique({ where: { email: emailNorm } });
  if (!cliente) {
    cliente = await prisma.cliente.create({
      data: { nome: nome.trim(), email: emailNorm, telefone: telefone?.trim() || null },
    });
  }

  // Acha ou cria o cartão deste cliente neste lojista
  let cartao = await prisma.cartao.findUnique({
    where: { lojistaId_clienteId: { lojistaId: lojista.id, clienteId: cliente.id } },
  });
  let novo = false;
  if (!cartao) {
    novo = true;
    cartao = await prisma.cartao.create({
      data: {
        lojistaId: lojista.id,
        clienteId: cliente.id,
        token: randomBytes(12).toString("hex"),
      },
    });
  }

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3001";
  const link = `${base}/cartao/${cartao.token}`;

  // Envia o email só na primeira vez (cartão novo)
  let emailEnviado = false;
  if (novo) {
    const r = await enviarLinkCartao({
      para: emailNorm,
      nomeCliente: cliente.nome,
      nomeNegocio: lojista.nomeNegocio,
      link,
      recompensa: lojista.recompensa,
    });
    emailEnviado = r.enviado;
  }

  return NextResponse.json({ token: cartao.token, link, emailEnviado });
}
