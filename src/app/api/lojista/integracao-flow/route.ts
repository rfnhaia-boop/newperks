import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { gerarChaveIntegracao, hashChave } from "@/lib/integracao-flow";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const lojista = await prisma.lojista.findUnique({
    where: { id: session.user.id },
    select: { integracaoFlowAtiva: true },
  });
  return NextResponse.json({ conectado: !!lojista?.integracaoFlowAtiva });
}

/** Gera (ou renova) a chave. Só é mostrada nesta resposta — não fica salva em texto puro. */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const blocked = rateLimit(req, { max: 5, windowSec: 60 });
  if (blocked) return blocked;

  const chave = gerarChaveIntegracao();
  await prisma.lojista.update({
    where: { id: session.user.id },
    data: { integracaoFlowChaveHash: hashChave(chave), integracaoFlowAtiva: true },
  });
  return NextResponse.json({ chave });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  await prisma.lojista.update({
    where: { id: session.user.id },
    data: { integracaoFlowChaveHash: null, integracaoFlowAtiva: false },
  });
  return NextResponse.json({ ok: true });
}
