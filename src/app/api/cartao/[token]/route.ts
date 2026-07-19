import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cartão pessoal do cliente (acesso pelo token único, sem login)
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const cartao = await prisma.cartao.findUnique({
    where: { token },
    include: {
      cliente: { select: { nome: true } },
      feedback: { select: { id: true } },
      lojista: {
        select: {
          nomeNegocio: true,
          tema: true,
          selosParaGanhar: true,
          recompensa: true,
          recompensaEstoque: true,
          recompensaValidaAte: true,
          recompensaRegras: true,
          slug: true,
          whatsapp: true,
          instagram: true,
          site: true,
          linksExtra: true,
          regras: true,
          horario: true,
          endereco: true,
        },
      },
    },
  });

  if (!cartao) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  return NextResponse.json({
    nomeCliente: cartao.cliente.nome,
    selos: cartao.selos,
    resgates: cartao.resgates,
    nomeNegocio: cartao.lojista.nomeNegocio,
    tema: cartao.lojista.tema,
    selosParaGanhar: cartao.lojista.selosParaGanhar,
    recompensa: cartao.lojista.recompensa,
    ofertaPrimeiraVisita: cartao.ofertaPrimeiraVisitaUsada ? null : cartao.ofertaPrimeiraVisita,
    recompensaEstoque: cartao.lojista.recompensaEstoque,
    recompensaValidaAte: cartao.lojista.recompensaValidaAte,
    recompensaRegras: cartao.lojista.recompensaRegras,
    slug: cartao.lojista.slug,
    whatsapp: cartao.lojista.whatsapp,
    instagram: cartao.lojista.instagram,
    site: cartao.lojista.site,
    linksExtra: cartao.lojista.linksExtra,
    regras: cartao.lojista.regras,
    horario: cartao.lojista.horario,
    endereco: cartao.lojista.endereco,
    feedbackEnviado: Boolean(cartao.feedback),
    linkIndicacao: `${req.nextUrl.origin}/c/${cartao.lojista.slug}?ref=${cartao.codigoIndicacao}`,
  });
}
