import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { googleReviewUrl, seloPorFeedback } = await req.json().catch(() => ({}));
  const url = typeof googleReviewUrl === "string" ? googleReviewUrl.trim().slice(0, 500) : "";
  if (url && !/^https:\/\//i.test(url)) return NextResponse.json({ error: "Use um link seguro iniciado por https://" }, { status: 400 });
  await prisma.lojista.update({ where: { id: session.user.id }, data: { googleReviewUrl: url || null, seloPorFeedback: seloPorFeedback === true } });
  return NextResponse.json({ ok: true });
}
