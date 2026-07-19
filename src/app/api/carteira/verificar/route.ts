import { NextRequest, NextResponse } from "next/server";
import { codigoConfere, hashIp } from "@/lib/acesso-carteira";
import { cookieCarteira, criarTokenCarteira } from "@/lib/carteira-session";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const TRINTA_DIAS = 30 * 24 * 60 * 60 * 1000;
const MAX_TENTATIVAS = 5;

export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, { max: 8, windowSec: 60 });
  if (blocked) return blocked;

  const { email, codigo } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || typeof codigo !== "string" || !/^\d{6}$/.test(codigo)) {
    return NextResponse.json({ error: "Digite o e-mail e o código de 6 dígitos." }, { status: 400 });
  }
  const cliente = await prisma.cliente.findUnique({ where: { email: email.trim().toLowerCase() }, select: { id: true } });
  const acesso = cliente ? await prisma.codigoAcessoCarteira.findUnique({ where: { clienteId: cliente.id } }) : null;
  const invalido = !cliente || !acesso || acesso.expiraEm <= new Date() || acesso.tentativas >= MAX_TENTATIVAS || !codigoConfere(codigo, acesso.codigoHash);

  if (invalido) {
    if (cliente && acesso) {
      const bloqueado = acesso.tentativas + 1 >= MAX_TENTATIVAS;
      await prisma.$transaction([
        prisma.codigoAcessoCarteira.update({ where: { id: acesso.id }, data: { tentativas: { increment: 1 } } }),
        prisma.eventoSeguranca.create({ data: { clienteId: cliente.id, tipo: bloqueado ? "codigo_carteira_bloqueado" : "codigo_carteira_invalido", ipHash: hashIp(req) } }),
      ]);
    }
    return NextResponse.json({ error: "Código inválido, expirado ou já usado." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.codigoAcessoCarteira.delete({ where: { id: acesso.id } }),
    prisma.eventoSeguranca.create({ data: { clienteId: cliente.id, tipo: "carteira_autenticada", ipHash: hashIp(req) } }),
  ]);
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(cookieCarteira, criarTokenCarteira(cliente.id, TRINTA_DIAS), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: TRINTA_DIAS / 1000,
  });
  return resposta;
}
