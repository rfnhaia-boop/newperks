import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { novoCodigoIndicacao } from "@/lib/acesso-carteira";
import { cookieCarteira, criarTokenCarteira } from "@/lib/carteira-session";

const TRINTA_DIAS = 30 * 24 * 60 * 60 * 1000;

// Dados públicos do lojista (tela inicial do QR)
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lojista = await prisma.lojista.findUnique({
    where: { slug },
    select: { id: true, nomeNegocio: true, tema: true, selosParaGanhar: true, recompensa: true, cidade: true, whatsapp: true, ofertaPrimeiraVisita: true, ofertaPrimeiraVisitaAtiva: true, ofertaPrimeiraVisitaRegras: true },
  });
  if (!lojista) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  const campanhaId = req.nextUrl.searchParams.get("campanha");
  if (campanhaId) await prisma.campanha.updateMany({ where: { id: campanhaId, lojistaId: lojista.id, ativa: true }, data: { visualizacoes: { increment: 1 } } });
  return NextResponse.json(lojista);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const blocked = rateLimit(req, { max: 10, windowSec: 60 });
  if (blocked) return blocked;

  const { slug } = await params;
  const { nome, telefone, senha, email, modo, aniversario, indicadoPorCodigo, campanhaId, origem, aceitaComunicacoes } = await req.json();

  const telefoneNorm = typeof telefone === "string" ? telefone.replace(/\D/g, "") : "";
  if (telefoneNorm.length < 10 || telefoneNorm.length > 11) {
    return NextResponse.json({ error: "Digite um telefone válido, com DDD." }, { status: 400 });
  }
  if (typeof senha !== "string" || senha.length < 6) {
    return NextResponse.json({ error: "A senha precisa ter ao menos 6 caracteres." }, { status: 400 });
  }

  // Aniversário opcional no formato DD/MM
  const nivValido =
    typeof aniversario === "string" && /^([0-2]\d|3[01])\/(0\d|1[0-2])$/.test(aniversario.trim())
      ? aniversario.trim()
      : null;
  const emailNorm = typeof email === "string" && email.trim() ? email.trim().toLowerCase() : null;
  const origemCadastro = typeof origem === "string"
    ? origem.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40) || null
    : null;

  const lojista = await prisma.lojista.findUnique({ where: { slug } });
  if (!lojista) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  let cliente = await prisma.cliente.findUnique({ where: { telefone: telefoneNorm } });

  if (modo === "entrar") {
    if (!cliente?.senha || !(await bcrypt.compare(senha, cliente.senha))) {
      return NextResponse.json({ error: "Telefone ou senha incorretos." }, { status: 401 });
    }
  } else {
    if (!nome?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }
    if (cliente?.senha) {
      return NextResponse.json({ error: "Esse telefone já tem cadastro. Toque em \"Já tenho cartão\" para entrar." }, { status: 409 });
    }
    const senhaHash = await bcrypt.hash(senha, 10);
    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          nome: nome.trim(),
          telefone: telefoneNorm,
          senha: senhaHash,
          email: emailNorm,
          aniversario: nivValido,
          aceitaComunicacoes: aceitaComunicacoes === true,
          aceitouComunicacoesEm: aceitaComunicacoes === true ? new Date() : null,
        },
      });
    } else {
      cliente = await prisma.cliente.update({
        where: { id: cliente.id },
        data: {
          senha: senhaHash,
          ...(nivValido && !cliente.aniversario ? { aniversario: nivValido } : {}),
          ...(emailNorm && !cliente.email ? { email: emailNorm } : {}),
          ...(aceitaComunicacoes === true && !cliente.aceitaComunicacoes ? { aceitaComunicacoes: true, aceitouComunicacoesEm: new Date() } : {}),
        },
      });
    }
  }

  // Acha ou cria o cartão deste cliente neste lojista
  let cartao = await prisma.cartao.findUnique({
    where: { lojistaId_clienteId: { lojistaId: lojista.id, clienteId: cliente.id } },
  });
  let novo = false;
  if (!cartao) {
    novo = true;
    cartao = await prisma.cartao.create({
      data: {
        lojistaId: lojista.id,
        clienteId: cliente.id,
        token: randomBytes(12).toString("hex"),
        codigoIndicacao: novoCodigoIndicacao(),
        campanhaOrigemId: typeof campanhaId === "string" ? campanhaId : null,
        origemCadastro,
        ofertaPrimeiraVisita: lojista.ofertaPrimeiraVisitaAtiva ? lojista.ofertaPrimeiraVisita : null,
      },
    });
  }

  // Indicação é registrada somente no primeiro cartão, sempre dentro da mesma empresa.
  if (novo && typeof indicadoPorCodigo === "string") {
    const indicador = await prisma.cartao.findFirst({
      where: { codigoIndicacao: indicadoPorCodigo, lojistaId: lojista.id },
      select: { id: true, clienteId: true },
    });
    if (indicador && indicador.id !== cartao.id && indicador.clienteId !== cliente.id) {
      cartao = await prisma.cartao.update({ where: { id: cartao.id }, data: { indicadorId: indicador.id } });
    }
  }
  if (novo && typeof campanhaId === "string") {
    await prisma.campanha.updateMany({ where: { id: campanhaId, lojistaId: lojista.id, ativa: true }, data: { adesoes: { increment: 1 } } });
  }

  const resposta = NextResponse.json({ link: `/cartao/${cartao.token}` });
  resposta.cookies.set(cookieCarteira, criarTokenCarteira(cliente.id, TRINTA_DIAS), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: TRINTA_DIAS / 1000,
  });
  return resposta;
}
