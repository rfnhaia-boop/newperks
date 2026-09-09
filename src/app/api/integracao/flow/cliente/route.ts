import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { hashChave } from "@/lib/integracao-flow";
import { novoCodigoIndicacao } from "@/lib/acesso-carteira";

/**
 * Integração servidor-a-servidor com o Flow (agendamento).
 * O Flow chama isso quando um cliente se cadastra/loga na página dele —
 * nunca o navegador do cliente. Acha ou cria o Cliente pelo telefone
 * (ou email), emite/reaproveita o cartão deste lojista, e devolve uma
 * URL embutível pro Flow mostrar como aba "Fidelidade" sem redirecionar
 * o cliente pra fora do próprio site.
 */
export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, { max: 30, windowSec: 60 });
  if (blocked) return blocked;

  const auth = req.headers.get("authorization");
  const chave = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!chave) return NextResponse.json({ error: "Chave de integração ausente." }, { status: 401 });

  const lojista = await prisma.lojista.findUnique({
    where: { integracaoFlowChaveHash: hashChave(chave) },
    select: { id: true, nomeNegocio: true, ativo: true, integracaoFlowAtiva: true, selosParaGanhar: true, recompensa: true, ofertaPrimeiraVisita: true, ofertaPrimeiraVisitaAtiva: true },
  });
  if (!lojista || !lojista.ativo || !lojista.integracaoFlowAtiva) {
    return NextResponse.json({ error: "Integração inválida ou desativada." }, { status: 401 });
  }

  const { nome, email, telefone, aniversario } = await req.json().catch(() => ({}));
  const telefoneNorm = typeof telefone === "string" ? telefone.replace(/\D/g, "") : "";
  const emailNorm = typeof email === "string" && email.trim() ? email.trim().toLowerCase() : null;
  if (telefoneNorm.length < 10 && !emailNorm) {
    return NextResponse.json({ error: "Envie telefone ou email do cliente." }, { status: 400 });
  }
  if (!nome?.trim()) {
    return NextResponse.json({ error: "Nome do cliente é obrigatório." }, { status: 400 });
  }
  const nivValido =
    typeof aniversario === "string" && /^([0-2]\d|3[01])\/(0\d|1[0-2])$/.test(aniversario.trim())
      ? aniversario.trim()
      : null;

  // Acha por telefone primeiro (identificador mais confiável entre os dois sistemas), cai pro email.
  let cliente = telefoneNorm ? await prisma.cliente.findUnique({ where: { telefone: telefoneNorm } }) : null;
  if (!cliente && emailNorm) cliente = await prisma.cliente.findUnique({ where: { email: emailNorm } });

  if (!cliente) {
    cliente = await prisma.cliente.create({
      data: {
        nome: nome.trim(),
        telefone: telefoneNorm || null,
        email: emailNorm,
        aniversario: nivValido,
      },
    });
  } else if ((telefoneNorm && !cliente.telefone) || (emailNorm && !cliente.email) || (nivValido && !cliente.aniversario)) {
    cliente = await prisma.cliente.update({
      where: { id: cliente.id },
      data: {
        ...(telefoneNorm && !cliente.telefone ? { telefone: telefoneNorm } : {}),
        ...(emailNorm && !cliente.email ? { email: emailNorm } : {}),
        ...(nivValido && !cliente.aniversario ? { aniversario: nivValido } : {}),
      },
    });
  }

  let cartao = await prisma.cartao.findUnique({
    where: { lojistaId_clienteId: { lojistaId: lojista.id, clienteId: cliente.id } },
  });
  if (!cartao) {
    cartao = await prisma.cartao.create({
      data: {
        lojistaId: lojista.id,
        clienteId: cliente.id,
        token: randomBytes(12).toString("hex"),
        codigoIndicacao: novoCodigoIndicacao(),
        origemCadastro: "flow",
        ofertaPrimeiraVisita: lojista.ofertaPrimeiraVisitaAtiva ? lojista.ofertaPrimeiraVisita : null,
      },
    });
  }

  const base = process.env.NEXTAUTH_URL || "http://localhost:3001";
  return NextResponse.json({
    nomeNegocio: lojista.nomeNegocio,
    selos: cartao.selos,
    selosParaGanhar: lojista.selosParaGanhar,
    recompensa: lojista.recompensa,
    faltamCampos: cliente.aniversario ? [] : ["aniversario"],
    cartaoEmbedUrl: `${base}/cartao/${cartao.token}?embed=1`,
  });
}
