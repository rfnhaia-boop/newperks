import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cartão pessoal do cliente (acesso pelo token único, sem login)
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const cartao = await prisma.cartao.findUnique({
    where: { token },
    include: {
      cliente: { select: { nome: true } },
      lojista: {
        select: { nomeNegocio: true, tema: true, selosParaGanhar: true, recompensa: true, slug: true, whatsapp: true },
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
    slug: cartao.lojista.slug,
    whatsapp: cartao.lojista.whatsapp,
  });
}
