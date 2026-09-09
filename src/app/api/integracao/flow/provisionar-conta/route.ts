import { NextRequest, NextResponse } from "next/server";
import { randomUUID, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { gerarChaveIntegracao, hashChave } from "@/lib/integracao-flow";

function chaveMestraConfere(recebida: string) {
  const esperada = process.env.INTEGRACAO_FLOW_MASTER_KEY;
  if (!esperada) return false;
  const a = Buffer.from(recebida);
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

function gerarSlugUnicoBase(base: string) {
  return (
    base
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "loja"
  );
}

/**
 * Provisiona automaticamente a conta-espelho da barbearia no NewPerks quando
 * ela contrata o pacote combinado no Flow. Chamada servidor-a-servidor,
 * autenticada com a chave MESTRA do parceiro (não a chave por loja — essa é
 * gerada aqui e devolvida). Idempotente: repetir a chamada com o mesmo
 * flowBarberProfileId rotaciona a chave da mesma conta em vez de duplicar.
 */
export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, { max: 15, windowSec: 60 });
  if (blocked) return blocked;

  const auth = req.headers.get("authorization");
  const chaveRecebida = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!chaveRecebida || !chaveMestraConfere(chaveRecebida)) {
    return NextResponse.json({ error: "Chave mestra inválida." }, { status: 401 });
  }

  const { nomeNegocio, email, flowBarberProfileId } = await req.json().catch(() => ({}));
  if (!nomeNegocio?.trim() || !flowBarberProfileId?.trim()) {
    return NextResponse.json({ error: "nomeNegocio e flowBarberProfileId são obrigatórios." }, { status: 400 });
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }
  const emailNorm = email.trim().toLowerCase();
  const flowId = flowBarberProfileId.trim();

  const chave = gerarChaveIntegracao();
  const chaveHash = hashChave(chave);

  // Já provisionada antes (retry do Flow) — rotaciona a chave da mesma conta.
  const existente = await prisma.lojista.findUnique({ where: { flowBarberProfileId: flowId } });
  if (existente) {
    await prisma.lojista.update({
      where: { id: existente.id },
      data: { integracaoFlowChaveHash: chaveHash, integracaoFlowAtiva: true },
    });
    return NextResponse.json({ fidelixApiKey: chave, slug: existente.slug, novo: false });
  }

  // Email já tem conta (dono cadastrou direto no NewPerks antes) — conecta em vez de duplicar.
  const porEmail = await prisma.lojista.findUnique({ where: { email: emailNorm } });
  if (porEmail) {
    await prisma.lojista.update({
      where: { id: porEmail.id },
      data: { flowBarberProfileId: flowId, integracaoFlowChaveHash: chaveHash, integracaoFlowAtiva: true },
    });
    return NextResponse.json({ fidelixApiKey: chave, slug: porEmail.slug, novo: false });
  }

  const base = gerarSlugUnicoBase(nomeNegocio);
  let slug = base;
  while (await prisma.lojista.findUnique({ where: { slug } })) {
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  // Sem senha própria utilizável — dono entra por Google (mesmo email) ou "esqueci minha senha".
  const senhaAleatoria = await bcrypt.hash(randomUUID(), 10);

  const lojista = await prisma.lojista.create({
    data: {
      nome: nomeNegocio.trim(),
      nomeNegocio: nomeNegocio.trim(),
      email: emailNorm,
      senha: senhaAleatoria,
      slug,
      // Toda conta provisionada pelo Flow é barbearia — sem isso caía no
      // tema "generico" (⭐) em vez do visual certo (💈) pro cliente final.
      tema: "barbearia",
      flowBarberProfileId: flowId,
      integracaoFlowChaveHash: chaveHash,
      integracaoFlowAtiva: true,
    },
  });

  return NextResponse.json({ fidelixApiKey: chave, slug: lojista.slug, novo: true });
}
