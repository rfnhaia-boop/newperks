import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function texto(valor: unknown, limite: number) {
  return typeof valor === "string" ? valor.trim().slice(0, limite) : "";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const corpo = await req.json().catch(() => ({}));
  const titulo = texto(corpo.titulo, 70);
  const beneficio = texto(corpo.beneficio, 120);
  const descricao = texto(corpo.descricao, 280);
  if (!titulo || !beneficio) return NextResponse.json({ error: "Informe o título e o benefício da campanha." }, { status: 400 });

  const campanha = await prisma.campanha.create({
    data: { lojistaId: session.user.id, titulo, beneficio, descricao: descricao || null, destaque: Boolean(corpo.destaque) },
  });
  return NextResponse.json({ campanha });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id, ativa } = await req.json().catch(() => ({}));
  if (typeof id !== "string" || typeof ativa !== "boolean") return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const campanha = await prisma.campanha.updateMany({ where: { id, lojistaId: session.user.id }, data: { ativa } });
  if (!campanha.count) return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
