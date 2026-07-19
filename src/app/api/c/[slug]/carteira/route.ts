import { randomBytes } from "crypto";
import { novoCodigoIndicacao } from "@/lib/acesso-carteira";
import { NextRequest, NextResponse } from "next/server";
import { cookieCarteira, validarTokenCarteira } from "@/lib/carteira-session";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

async function contexto(req: NextRequest, slug: string) {
  const sessao = validarTokenCarteira(req.cookies.get(cookieCarteira)?.value);
  if (!sessao) return null;

  const [cliente, lojista] = await Promise.all([
    prisma.cliente.findUnique({ where: { id: sessao.clienteId }, select: { id: true, nome: true } }),
    prisma.lojista.findUnique({ where: { slug }, select: { id: true, nomeNegocio: true } }),
  ]);
  if (!cliente || !lojista) return null;
  return { cliente, lojista };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dados = await contexto(req, slug);
  if (!dados) return NextResponse.json({ autenticado: false });

  const cartao = await prisma.cartao.findUnique({
    where: { lojistaId_clienteId: { lojistaId: dados.lojista.id, clienteId: dados.cliente.id } },
    select: { token: true },
  });
  const campanhaId = req.nextUrl.searchParams.get("campanha");
  const campanha = campanhaId
    ? await prisma.campanha.findFirst({ where: { id: campanhaId, lojistaId: dados.lojista.id, ativa: true }, select: { titulo: true, beneficio: true } })
    : null;
  return NextResponse.json({ autenticado: true, nome: dados.cliente.nome, nomeNegocio: dados.lojista.nomeNegocio, link: cartao ? `/cartao/${cartao.token}` : null, campanha });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const blocked = rateLimit(req, { max: 10, windowSec: 60 });
  if (blocked) return blocked;

  const { slug } = await params;
  const dados = await contexto(req, slug);
  if (!dados) return NextResponse.json({ error: "Abra sua carteira novamente para continuar." }, { status: 401 });

  const existente = await prisma.cartao.findUnique({
    where: { lojistaId_clienteId: { lojistaId: dados.lojista.id, clienteId: dados.cliente.id } },
    select: { token: true },
  });
  if (existente) return NextResponse.json({ link: `/cartao/${existente.token}` });

  const codigoIndicacao = req.nextUrl.searchParams.get("ref");
  let indicadorId: string | undefined;
  if (codigoIndicacao) {
    const indicador = await prisma.cartao.findFirst({ where: { codigoIndicacao, lojistaId: dados.lojista.id }, select: { id: true, clienteId: true } });
    if (indicador && indicador.clienteId !== dados.cliente.id) indicadorId = indicador.id;
  }
  const campanhaId = req.nextUrl.searchParams.get("campanha");
  const campanha = campanhaId ? await prisma.campanha.findFirst({ where: { id: campanhaId, lojistaId: dados.lojista.id, ativa: true }, select: { id: true } }) : null;
  const origemRaw = req.nextUrl.searchParams.get("origem");
  const origemCadastro = origemRaw ? origemRaw.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40) || null : null;
  const lojaComOferta = await prisma.lojista.findUnique({ where: { id: dados.lojista.id }, select: { ofertaPrimeiraVisita: true, ofertaPrimeiraVisitaAtiva: true } });
  const cartao = await prisma.cartao.create({ data: { lojistaId: dados.lojista.id, clienteId: dados.cliente.id, token: randomBytes(12).toString("hex"), codigoIndicacao: novoCodigoIndicacao(), indicadorId, campanhaOrigemId: campanha?.id, origemCadastro, ofertaPrimeiraVisita: lojaComOferta?.ofertaPrimeiraVisitaAtiva ? lojaComOferta.ofertaPrimeiraVisita : null }, select: { token: true } });
  if (campanha) await prisma.campanha.update({ where: { id: campanha.id }, data: { adesoes: { increment: 1 } } });
  return NextResponse.json({ link: `/cartao/${cartao.token}` });
}
