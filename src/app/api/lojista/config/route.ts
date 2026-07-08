import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TEMAS } from "@/lib/themes";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { tema, selosParaGanhar, recompensa, nomeNegocio, ticketMedio, whatsapp, regras, horario, endereco } =
    await req.json();

  const data: Record<string, unknown> = {};
  if (typeof whatsapp === "string") {
    // Guarda só dígitos; vazio limpa o campo
    const digitos = whatsapp.replace(/\D/g, "").slice(0, 15);
    data.whatsapp = digitos || null;
  }
  // Textos livres opcionais — vazio limpa
  if (typeof regras === "string") data.regras = regras.trim().slice(0, 600) || null;
  if (typeof horario === "string") data.horario = horario.trim().slice(0, 120) || null;
  if (typeof endereco === "string") data.endereco = endereco.trim().slice(0, 200) || null;
  if (tema && tema in TEMAS) data.tema = tema;
  if (typeof selosParaGanhar === "number" && selosParaGanhar >= 1 && selosParaGanhar <= 20)
    data.selosParaGanhar = selosParaGanhar;
  if (typeof recompensa === "string" && recompensa.trim()) data.recompensa = recompensa.trim();
  if (typeof nomeNegocio === "string" && nomeNegocio.trim()) data.nomeNegocio = nomeNegocio.trim();
  if (typeof ticketMedio === "number" && ticketMedio >= 0) data.ticketMedio = ticketMedio;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const lojista = await prisma.lojista.update({
    where: { id: session.user.id },
    data,
  });

  return NextResponse.json({ ok: true, lojista: { tema: lojista.tema, selosParaGanhar: lojista.selosParaGanhar, recompensa: lojista.recompensa } });
}
