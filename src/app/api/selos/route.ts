import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { novoCodigoIndicacao } from "@/lib/acesso-carteira";

export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, { max: 30, windowSec: 60 });
  if (blocked) return blocked;

  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { clienteId, acao = "carimbar", descricao, valor } = await req.json();
  if (!clienteId) return NextResponse.json({ error: "clienteId obrigatório" }, { status: 400 });

  const lojista = await prisma.lojista.findUnique({ where: { id: session.user.id } });
  if (!lojista) return NextResponse.json({ error: "Lojista não encontrado" }, { status: 404 });

  let cartao = await prisma.cartao.findUnique({
    where: { lojistaId_clienteId: { lojistaId: lojista.id, clienteId } },
  });

  if (!cartao) {
    cartao = await prisma.cartao.create({
      data: { lojistaId: lojista.id, clienteId, selos: 0, token: randomBytes(12).toString("hex"), codigoIndicacao: novoCodigoIndicacao() },
    });
  }

  if (acao === "resgatar") {
    const agora = new Date();
    if (lojista.recompensaValidaAte && lojista.recompensaValidaAte < agora) {
      return NextResponse.json({ error: "Esta recompensa expirou. Atualize a campanha antes de resgatar." }, { status: 400 });
    }

    try {
      const resgate = await prisma.$transaction(async (tx) => {
        const cartaoAtual = await tx.cartao.findUnique({ where: { id: cartao.id } });
        const lojaAtual = await tx.lojista.findUnique({ where: { id: lojista.id } });
        if (!cartaoAtual || !lojaAtual) throw new Error("DADOS_NAO_ENCONTRADOS");
        if (cartaoAtual.selos < lojaAtual.selosParaGanhar) throw new Error("CARTAO_INCOMPLETO");
        if (lojaAtual.recompensaValidaAte && lojaAtual.recompensaValidaAte < agora) throw new Error("RECOMPENSA_EXPIRADA");

        const estoqueAntes = lojaAtual.recompensaEstoque;
        if (estoqueAntes !== null) {
          const baixouEstoque = await tx.lojista.updateMany({
            where: { id: lojaAtual.id, recompensaEstoque: { gt: 0 } },
            data: { recompensaEstoque: { decrement: 1 } },
          });
          if (baixouEstoque.count !== 1) throw new Error("ESTOQUE_ESGOTADO");
        }

        const baixouCartao = await tx.cartao.updateMany({
          where: { id: cartaoAtual.id, selos: { gte: lojaAtual.selosParaGanhar } },
          data: { selos: 0, resgates: { increment: 1 } },
        });
        if (baixouCartao.count !== 1) throw new Error("CARTAO_INCOMPLETO");

        return tx.resgate.create({
          data: {
            lojistaId: lojaAtual.id,
            cartaoId: cartaoAtual.id,
            recompensa: lojaAtual.recompensa,
            estoqueAntes,
            estoqueDepois: estoqueAntes === null ? null : estoqueAntes - 1,
          },
        });
      });
      const atualizado = await prisma.cartao.findUnique({ where: { id: cartao.id }, include: { cliente: true } });
      return NextResponse.json({ cartao: atualizado, resgatou: true, recompensa: resgate.recompensa });
    } catch (error) {
      const codigo = error instanceof Error ? error.message : "";
      const mensagens: Record<string, string> = {
        CARTAO_INCOMPLETO: "Cartão ainda não está completo",
        RECOMPENSA_EXPIRADA: "Esta recompensa expirou. Atualize a campanha antes de resgatar.",
        ESTOQUE_ESGOTADO: "O estoque desta recompensa acabou.",
      };
      return NextResponse.json({ error: mensagens[codigo] ?? "Não foi possível concluir o resgate" }, { status: 400 });
    }
  }

  // Desfaz o último carimbo (erro de operação no balcão)
  if (acao === "desfazer") {
    if (cartao.selos === 0) {
      return NextResponse.json({ error: "Nada para desfazer" }, { status: 400 });
    }
    const ultimo = await prisma.carimbo.findFirst({
      where: { cartaoId: cartao.id },
      orderBy: { createdAt: "desc" },
    });
    const [atualizado] = await prisma.$transaction([
      prisma.cartao.update({
        where: { id: cartao.id },
        data: {
          selos: cartao.selos - 1,
          totalCarimbos: Math.max(0, cartao.totalCarimbos - 1),
        },
        include: { cliente: true },
      }),
      ...(ultimo ? [prisma.carimbo.delete({ where: { id: ultimo.id } })] : []),
    ]);
    return NextResponse.json({ cartao: atualizado, desfez: true });
  }

  // acao === "carimbar"
  if (cartao.selos >= lojista.selosParaGanhar) {
    return NextResponse.json({ error: "Cartão completo — resgate antes de continuar" }, { status: 400 });
  }

  const novosSelos = cartao.selos + 1;
  const completou = novosSelos >= lojista.selosParaGanhar;

  const [atualizado] = await prisma.$transaction([
    prisma.cartao.update({
      where: { id: cartao.id },
      data: { selos: novosSelos, totalCarimbos: cartao.totalCarimbos + 1, ...(cartao.totalCarimbos === 0 && cartao.ofertaPrimeiraVisita ? { ofertaPrimeiraVisitaUsada: true } : {}) },
      include: { cliente: true },
    }),
    prisma.carimbo.create({
      data: {
        cartaoId: cartao.id,
        descricao: descricao?.trim() || null,
        valor: valor ? parseFloat(valor) : null,
      },
    }),
  ]);

  if (cartao.campanhaOrigemId) {
    const metrica = cartao.totalCarimbos === 0 ? "primeirasVisitas" : cartao.totalCarimbos === 1 ? "retornos" : null;
    if (metrica) await prisma.campanha.update({ where: { id: cartao.campanhaOrigemId }, data: { [metrica]: { increment: 1 } } });
  }

  let seloIndicacao = false;
  if (cartao.totalCarimbos === 0 && cartao.indicadorId && !cartao.indicacaoRecompensada) {
    const indicador = await prisma.cartao.findUnique({ where: { id: cartao.indicadorId } });
    if (indicador && indicador.selos < lojista.selosParaGanhar) {
      await prisma.$transaction([
        prisma.cartao.update({ where: { id: cartao.id }, data: { indicacaoRecompensada: true } }),
        prisma.cartao.update({ where: { id: indicador.id }, data: { selos: indicador.selos + 1, totalCarimbos: indicador.totalCarimbos + 1 } }),
        prisma.carimbo.create({ data: { cartaoId: indicador.id, descricao: "Selo bônus por indicação" } }),
      ]);
      seloIndicacao = true;
    }
  }

  return NextResponse.json({ cartao: atualizado, completou, recompensa: lojista.recompensa, seloIndicacao });
}
