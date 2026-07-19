import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function PUT(req: NextRequest) {
  const blocked = rateLimit(req, { max: 20, windowSec: 60 });
  if (blocked) return blocked;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const recompensa = typeof body.recompensa === "string" ? body.recompensa.trim().slice(0, 140) : "";
  const regras = typeof body.regras === "string" ? body.regras.trim().slice(0, 420) || null : null;
  const controlaEstoque = body.controlaEstoque === true;
  const estoque = Number(body.estoque);
  const validade = typeof body.validaAte === "string" && body.validaAte ? new Date(`${body.validaAte}T23:59:59.999`) : null;

  if (!recompensa) return NextResponse.json({ error: "Informe o que o cliente recebe ao completar o cartão." }, { status: 400 });
  if (controlaEstoque && (!Number.isInteger(estoque) || estoque < 0 || estoque > 1_000_000)) {
    return NextResponse.json({ error: "O estoque deve ser um número inteiro entre 0 e 1.000.000." }, { status: 400 });
  }
  if (validade && Number.isNaN(validade.getTime())) return NextResponse.json({ error: "Data de validade inválida." }, { status: 400 });

  const lojista = await prisma.lojista.update({
    where: { id: session.user.id },
    data: { recompensa, recompensaRegras: regras, recompensaEstoque: controlaEstoque ? estoque : null, recompensaValidaAte: validade },
    select: { recompensa: true, recompensaRegras: true, recompensaEstoque: true, recompensaValidaAte: true },
  });

  return NextResponse.json({ ok: true, recompensa: lojista });
}
