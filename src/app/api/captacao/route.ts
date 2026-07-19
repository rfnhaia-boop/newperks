import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function PUT(req: NextRequest) {
  const blocked = rateLimit(req, { max: 20, windowSec: 60 });
  if (blocked) return blocked;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { ativa, oferta, regras } = await req.json();
  const ofertaLimpa = typeof oferta === "string" ? oferta.trim().slice(0, 140) : "";
  const regrasLimpas = typeof regras === "string" ? regras.trim().slice(0, 300) || null : null;
  if (ativa === true && !ofertaLimpa) return NextResponse.json({ error: "Escreva a vantagem de primeira visita antes de ativá-la." }, { status: 400 });

  await prisma.lojista.update({
    where: { id: session.user.id },
    data: { ofertaPrimeiraVisitaAtiva: ativa === true, ofertaPrimeiraVisita: ofertaLimpa || null, ofertaPrimeiraVisitaRegras: regrasLimpas },
  });
  return NextResponse.json({ ok: true });
}
