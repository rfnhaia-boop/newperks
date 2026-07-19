import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TEMAS } from "@/lib/themes";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { tema, selosParaGanhar, recompensa, nomeNegocio, ticketMedio, whatsapp, instagram, site, linksExtra, regras, horario, endereco, cidade, beneficioVipOuro, beneficioVipDiamante } =
    await req.json();

  const data: Record<string, unknown> = {};
  if (typeof whatsapp === "string") {
    // Guarda só dígitos; vazio limpa o campo
    const digitos = whatsapp.replace(/\D/g, "").slice(0, 15);
    data.whatsapp = digitos || null;
  }
  if (typeof instagram === "string") {
    data.instagram = instagram.replace(/^@/, "").trim().slice(0, 50) || null;
  }
  if (typeof site === "string") {
    data.site = site.trim().slice(0, 150) || null;
  }
  if (Array.isArray(linksExtra)) {
    // Filtra apenas links válidos (com título e url preenchidos) e armazena como JSON
    data.linksExtra = linksExtra
      .map(l => ({ titulo: String(l?.titulo || "").trim().slice(0, 50), url: String(l?.url || "").trim().slice(0, 150) }))
      .filter(l => l.titulo && l.url);
  }
  // Textos livres opcionais — vazio limpa
  if (typeof regras === "string") data.regras = regras.trim().slice(0, 600) || null;
  if (typeof horario === "string") data.horario = horario.trim().slice(0, 120) || null;
  if (typeof endereco === "string") data.endereco = endereco.trim().slice(0, 200) || null;
  if (typeof cidade === "string") data.cidade = cidade.trim().slice(0, 80) || null;
  if (typeof beneficioVipOuro === "string") data.beneficioVipOuro = beneficioVipOuro.trim().slice(0, 160) || null;
  if (typeof beneficioVipDiamante === "string") data.beneficioVipDiamante = beneficioVipDiamante.trim().slice(0, 160) || null;
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
