import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { TEMAS } from "@/lib/themes";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, { max: 5, windowSec: 60 });
  if (blocked) return blocked;
  const { nome, email, senha, nomeNegocio, tema } = await req.json();

  if (!nome || !email || !senha || !nomeNegocio) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  if (typeof senha !== "string" || senha.length < 10) {
    return NextResponse.json({ error: "Senha deve ter ao menos 10 caracteres" }, { status: 400 });
  }

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const emailNorm = email.trim().toLowerCase();
  const temaValido = tema && tema in TEMAS ? tema : "generico";

  const existe = await prisma.lojista.findUnique({ where: { email: emailNorm } });
  if (existe) {
    return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
  }

  const base =
    nomeNegocio
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "loja";

  // Garante slug único
  let slug = base;
  while (await prisma.lojista.findUnique({ where: { slug } })) {
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const hash = await bcrypt.hash(senha, 10);

  const lojista = await prisma.lojista.create({
    data: { nome, email: emailNorm, senha: hash, nomeNegocio, slug, tema: temaValido },
  });

  return NextResponse.json({ id: lojista.id, slug: lojista.slug }, { status: 201 });
}
