import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { enviarCodigoCarteira } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { criarCodigoAcesso, hashCodigoAcesso, hashIp, novoCodigoIndicacao } from "@/lib/acesso-carteira";

const DEZ_MINUTOS = 10 * 60 * 1000;

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
  const { nome, email, telefone, modo, aniversario, indicadoPorCodigo, campanhaId, origem, aceitaComunicacoes } = await req.json();

  // Aniversário opcional no formato DD/MM
  const nivValido =
    typeof aniversario === "string" && /^([0-2]\d|3[01])\/(0\d|1[0-2])$/.test(aniversario.trim())
      ? aniversario.trim()
      : null;

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
  }
  const emailNorm = email.trim().toLowerCase();
  const origemCadastro = typeof origem === "string"
    ? origem.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40) || null
    : null;

  const lojista = await prisma.lojista.findUnique({ where: { slug } });
  if (!lojista) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  // Um e-mail não é prova de identidade: acesso de cliente sempre passa pela carteira e OTP.
  if (modo === "entrar") {
    return NextResponse.json({ acessarCarteira: true });
  }

  if (!nome?.trim()) {
    return NextResponse.json({ error: "Nome e email são obrigatórios" }, { status: 400 });
  }

  // Upsert cliente por email
  let cliente = await prisma.cliente.findUnique({ where: { email: emailNorm } });
  if (!cliente) {
    cliente = await prisma.cliente.create({
      data: {
        nome: nome.trim(),
        email: emailNorm,
        telefone: telefone?.trim() || null,
        aniversario: nivValido,
        aceitaComunicacoes: aceitaComunicacoes === true,
        aceitouComunicacoesEm: aceitaComunicacoes === true ? new Date() : null,
      },
    });
  } else if ((nivValido && !cliente.aniversario) || (aceitaComunicacoes === true && !cliente.aceitaComunicacoes)) {
    // Cliente antigo informou o aniversário agora — aproveita e guarda
    cliente = await prisma.cliente.update({
      where: { id: cliente.id },
      data: { ...(nivValido && !cliente.aniversario ? { aniversario: nivValido } : {}), ...(aceitaComunicacoes === true && !cliente.aceitaComunicacoes ? { aceitaComunicacoes: true, aceitouComunicacoesEm: new Date() } : {}) },
    });
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

  // O primeiro acesso também usa código descartável: não retornamos a chave do cartão.
  const codigo = criarCodigoAcesso();
  await prisma.$transaction([
    prisma.codigoAcessoCarteira.upsert({
      where: { clienteId: cliente.id },
      create: { clienteId: cliente.id, codigoHash: hashCodigoAcesso(codigo), expiraEm: new Date(Date.now() + DEZ_MINUTOS) },
      update: { codigoHash: hashCodigoAcesso(codigo), expiraEm: new Date(Date.now() + DEZ_MINUTOS), tentativas: 0, createdAt: new Date() },
    }),
    prisma.eventoSeguranca.create({ data: { clienteId: cliente.id, tipo: novo ? "cartao_criado_codigo_solicitado" : "codigo_carteira_solicitado", ipHash: hashIp(req) } }),
  ]);
  let emailEnviado = false;
  const r = await enviarCodigoCarteira({ para: emailNorm, nome: cliente.nome, codigo });
  emailEnviado = r.enviado;
  return NextResponse.json({ acessarCarteira: true, emailEnviado, codigoTeste: process.env.NODE_ENV === "production" ? undefined : codigo });
}
