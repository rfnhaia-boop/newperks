import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { enviarEmailReset } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, { max: 3, windowSec: 60 });
  if (blocked) return blocked;
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email obrigatório" }, { status: 400 });

  const lojista = await prisma.lojista.findUnique({ where: { email } });

  // Sempre retorna ok — não revela se o email existe
  if (!lojista) return NextResponse.json({ ok: true });

  const token = randomBytes(24).toString("hex");
  const expira = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

  await prisma.lojista.update({
    where: { email },
    data: { resetToken: token, resetTokenExp: expira },
  });

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3001";
  const link = `${base}/redefinir/${token}`;

  await enviarEmailReset({ para: email, nome: lojista.nome, link });

  return NextResponse.json({ ok: true });
}

// PUT /api/lojista/reset-senha — redefine a senha com o token
export async function PUT(req: NextRequest) {
  const blocked = rateLimit(req, { max: 5, windowSec: 60 });
  if (blocked) return blocked;

  const { token, senha } = await req.json();
  if (!token || !senha) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  if (senha.length < 6) return NextResponse.json({ error: "Senha deve ter ao menos 6 caracteres" }, { status: 400 });

  const lojista = await prisma.lojista.findFirst({
    where: { resetToken: token, resetTokenExp: { gt: new Date() } },
  });

  if (!lojista) return NextResponse.json({ error: "Link inválido ou expirado" }, { status: 400 });

  const bcrypt = await import("bcryptjs");
  const hash = await bcrypt.hash(senha, 12);

  await prisma.lojista.update({
    where: { id: lojista.id },
    data: { senha: hash, resetToken: null, resetTokenExp: null },
  });

  return NextResponse.json({ ok: true });
}
