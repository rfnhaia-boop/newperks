import { NextRequest, NextResponse } from "next/server";
import { validarTokenCarteira, cookieCarteira } from "@/lib/carteira-session";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, { max: 5, windowSec: 60 });
  if (blocked) return blocked;
  const sessao = validarTokenCarteira(req.cookies.get(cookieCarteira)?.value);
  if (!sessao) return NextResponse.json({ error: "Abra sua carteira para enviar uma opinião." }, { status: 401 });

  const { token, nota, comentario } = await req.json().catch(() => ({}));
  if (typeof token !== "string" || !Number.isInteger(nota) || nota < 1 || nota > 5) {
    return NextResponse.json({ error: "Escolha uma nota de 1 a 5." }, { status: 400 });
  }
  const cartao = await prisma.cartao.findFirst({
    where: { token, clienteId: sessao.clienteId },
    include: { lojista: { select: { googleReviewUrl: true, seloPorFeedback: true, selosParaGanhar: true } } },
  });
  if (!cartao) return NextResponse.json({ error: "Esse cartão não pertence à sua carteira." }, { status: 403 });
  if (await prisma.feedback.findUnique({ where: { cartaoId: cartao.id } })) {
    return NextResponse.json({ error: "Você já enviou sua opinião sobre esta experiência." }, { status: 409 });
  }

  const texto = typeof comentario === "string" ? comentario.trim().slice(0, 600) || null : null;
  const darSelo = cartao.lojista.seloPorFeedback && cartao.selos < cartao.lojista.selosParaGanhar;
  await prisma.$transaction([
    prisma.feedback.create({ data: { lojistaId: cartao.lojistaId, cartaoId: cartao.id, nota, comentario: texto, seloBonusConcedido: darSelo } }),
    ...(darSelo ? [
      prisma.cartao.update({ where: { id: cartao.id }, data: { selos: { increment: 1 }, totalCarimbos: { increment: 1 } } }),
      prisma.carimbo.create({ data: { cartaoId: cartao.id, descricao: "Selo bônus por feedback" } }),
    ] : []),
  ]);
  return NextResponse.json({ ok: true, seloBonus: darSelo, googleReviewUrl: nota >= 4 ? cartao.lojista.googleReviewUrl : null });
}
