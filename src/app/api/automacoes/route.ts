import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PADROES, TIPOS_AUTOMACAO, type TipoAutomacao } from "@/lib/automacoes";
import { rateLimit } from "@/lib/rate-limit";

export async function PUT(req: NextRequest) {
  const blocked = rateLimit(req, { max: 20, windowSec: 60 }); if (blocked) return blocked;
  const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { tipo, ativa, assunto, mensagem, diasInativo } = await req.json();
  if (!TIPOS_AUTOMACAO.includes(tipo as TipoAutomacao)) return NextResponse.json({ error: "Automação inválida" }, { status: 400 });
  const padrao = PADROES[tipo as TipoAutomacao];
  const assuntoLimpo = typeof assunto === "string" ? assunto.trim().slice(0, 120) : padrao.assunto;
  const mensagemLimpa = typeof mensagem === "string" ? mensagem.trim().slice(0, 700) : padrao.mensagem;
  if (!assuntoLimpo || !mensagemLimpa) return NextResponse.json({ error: "Preencha assunto e mensagem." }, { status: 400 });
  const dias = Number.isInteger(diasInativo) && diasInativo >= 7 && diasInativo <= 365 ? diasInativo : 30;
  const atual = await prisma.automacao.findUnique({ where: { lojistaId_tipo: { lojistaId: session.user.id, tipo } } });
  await prisma.automacao.upsert({ where: { lojistaId_tipo: { lojistaId: session.user.id, tipo } }, create: { lojistaId: session.user.id, tipo, ativa: ativa === true, assunto: assuntoLimpo, mensagem: mensagemLimpa, diasInativo: dias, iniciaEm: ativa === true ? new Date() : null }, update: { ativa: ativa === true, assunto: assuntoLimpo, mensagem: mensagemLimpa, diasInativo: dias, ...(ativa === true && !atual?.ativa ? { iniciaEm: new Date() } : {}) } });
  return NextResponse.json({ ok: true });
}
