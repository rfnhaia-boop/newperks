import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { hashChave } from "@/lib/integracao-flow";
import { novoCodigoIndicacao } from "@/lib/acesso-carteira";

/**
 * Dá um selo quando um agendamento é concluído no Flow. Idempotente por
 * appointmentId — repetir a chamada (retry, restart, clique duplo em
 * "concluído") nunca soma um segundo selo, só devolve o estado atual.
 */
export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, { max: 30, windowSec: 60 });
  if (blocked) return blocked;

  const auth = req.headers.get("authorization");
  const chave = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!chave) return NextResponse.json({ error: "Chave de integração ausente." }, { status: 401 });

  const lojista = await prisma.lojista.findUnique({
    where: { integracaoFlowChaveHash: hashChave(chave) },
    select: { id: true, nomeNegocio: true, ativo: true, integracaoFlowAtiva: true, selosParaGanhar: true, recompensa: true, ofertaPrimeiraVisitaAtiva: true, ofertaPrimeiraVisita: true },
  });
  if (!lojista || !lojista.ativo || !lojista.integracaoFlowAtiva) {
    return NextResponse.json({ error: "Integração inválida ou desativada." }, { status: 401 });
  }

  const { telefone, email, appointmentId } = await req.json().catch(() => ({}));
  const telefoneNorm = typeof telefone === "string" ? telefone.replace(/\D/g, "") : "";
  const emailNorm = typeof email === "string" && email.trim() ? email.trim().toLowerCase() : null;
  const appointmentIdNorm = typeof appointmentId === "string" ? appointmentId.trim() : "";
  if (telefoneNorm.length < 10 && !emailNorm) {
    return NextResponse.json({ error: "Envie telefone ou email do cliente." }, { status: 400 });
  }
  if (!appointmentIdNorm) {
    return NextResponse.json({ error: "appointmentId é obrigatório." }, { status: 400 });
  }

  const base = process.env.NEXTAUTH_URL || "http://localhost:3001";
  const resposta = (cartao: { token: string; selos: number }) => ({
    nomeNegocio: lojista.nomeNegocio,
    selos: cartao.selos,
    selosParaGanhar: lojista.selosParaGanhar,
    recompensa: lojista.recompensa,
    cartaoEmbedUrl: `${base}/cartao/${cartao.token}?embed=1`,
  });

  // Retry/duplicata: já carimbado por esse agendamento — devolve o estado atual sem repetir.
  const carimboExistente = await prisma.carimbo.findUnique({
    where: { flowAppointmentId: appointmentIdNorm },
    include: { cartao: { select: { token: true, selos: true } } },
  });
  if (carimboExistente) {
    return NextResponse.json(resposta(carimboExistente.cartao));
  }

  const cliente = telefoneNorm
    ? await prisma.cliente.findUnique({ where: { telefone: telefoneNorm } })
    : await prisma.cliente.findUnique({ where: { email: emailNorm! } });
  if (!cliente) {
    return NextResponse.json({ error: "Cliente não encontrado. Chame /api/integracao/flow/cliente primeiro." }, { status: 404 });
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

  // Cartão já completo, aguardando resgate no balcão — não estoura o limite nem dá erro.
  if (cartao.selos >= lojista.selosParaGanhar) {
    return NextResponse.json(resposta(cartao));
  }

  const novosSelos = cartao.selos + 1;
  const [atualizado] = await prisma.$transaction([
    prisma.cartao.update({
      where: { id: cartao.id },
      data: {
        selos: novosSelos,
        totalCarimbos: cartao.totalCarimbos + 1,
        ...(cartao.totalCarimbos === 0 && cartao.ofertaPrimeiraVisita ? { ofertaPrimeiraVisitaUsada: true } : {}),
      },
    }),
    prisma.carimbo.create({
      data: { cartaoId: cartao.id, descricao: "Agendamento concluído (Flow)", flowAppointmentId: appointmentIdNorm },
    }),
  ]);

  if (cartao.campanhaOrigemId) {
    const metrica = cartao.totalCarimbos === 0 ? "primeirasVisitas" : cartao.totalCarimbos === 1 ? "retornos" : null;
    if (metrica) await prisma.campanha.update({ where: { id: cartao.campanhaOrigemId }, data: { [metrica]: { increment: 1 } } });
  }

  if (cartao.totalCarimbos === 0 && cartao.indicadorId && !cartao.indicacaoRecompensada) {
    const indicador = await prisma.cartao.findUnique({ where: { id: cartao.indicadorId } });
    if (indicador && indicador.selos < lojista.selosParaGanhar) {
      await prisma.$transaction([
        prisma.cartao.update({ where: { id: cartao.id }, data: { indicacaoRecompensada: true } }),
        prisma.cartao.update({ where: { id: indicador.id }, data: { selos: indicador.selos + 1, totalCarimbos: indicador.totalCarimbos + 1 } }),
        prisma.carimbo.create({ data: { cartaoId: indicador.id, descricao: "Selo bônus por indicação" } }),
      ]);
    }
  }

  return NextResponse.json(resposta(atualizado));
}
