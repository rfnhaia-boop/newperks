import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { hashIp } from "@/lib/acesso-carteira";
import { cookieCarteira, criarTokenCarteira } from "@/lib/carteira-session";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const TRINTA_DIAS = 30 * 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, { max: 8, windowSec: 60 });
  if (blocked) return blocked;

  const { telefone, senha } = await req.json().catch(() => ({}));
  const telefoneNorm = typeof telefone === "string" ? telefone.replace(/\D/g, "") : "";
  if (telefoneNorm.length < 10 || typeof senha !== "string" || !senha) {
    return NextResponse.json({ error: "Digite seu telefone e senha." }, { status: 400 });
  }

  const cliente = await prisma.cliente.findUnique({ where: { telefone: telefoneNorm } });
  if (!cliente?.senha || !(await bcrypt.compare(senha, cliente.senha))) {
    return NextResponse.json({ error: "Telefone ou senha incorretos." }, { status: 401 });
  }

  await prisma.eventoSeguranca.create({ data: { clienteId: cliente.id, tipo: "carteira_autenticada_senha", ipHash: hashIp(req) } });

  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(cookieCarteira, criarTokenCarteira(cliente.id, TRINTA_DIAS), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: TRINTA_DIAS / 1000,
  });
  return resposta;
}
