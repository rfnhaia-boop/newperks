import { prisma } from "@/lib/prisma";
import { enviarEmailAutomacao } from "@/lib/email";

export const TIPOS_AUTOMACAO = ["BOAS_VINDAS", "ANIVERSARIO", "INATIVO", "QUASE_LA"] as const;
export type TipoAutomacao = typeof TIPOS_AUTOMACAO[number];

export const PADROES: Record<TipoAutomacao, { titulo: string; assunto: string; mensagem: string }> = {
  BOAS_VINDAS: { titulo: "Boas-vindas", assunto: "Seu cartão está pronto, {nome}!", mensagem: "Olá, {nome}! Seu cartão da {negocio} está pronto. Faça sua primeira visita e comece a juntar selos para ganhar {recompensa}." },
  ANIVERSARIO: { titulo: "Aniversário", assunto: "Feliz aniversário, {nome}!", mensagem: "Feliz aniversário, {nome}! A equipe da {negocio} separou um carinho especial para você. Vem comemorar com a gente!" },
  INATIVO: { titulo: "Cliente parado", assunto: "Sentimos sua falta, {nome}", mensagem: "Oi, {nome}! Sentimos sua falta na {negocio}. Volte nos próximos dias e aproveite seu cartão de fidelidade." },
  QUASE_LA: { titulo: "Quase recompensa", assunto: "Falta pouco para sua recompensa!", mensagem: "Oi, {nome}! Faltam só {selos_faltando} selo(s) para você ganhar {recompensa} na {negocio}." },
};

function preencher(texto: string, dados: { nome: string; negocio: string; recompensa: string; faltam: number }) {
  return texto.replaceAll("{nome}", dados.nome).replaceAll("{negocio}", dados.negocio).replaceAll("{recompensa}", dados.recompensa).replaceAll("{selos_faltando}", String(dados.faltam));
}

function aniversarioHoje(valor: string | null, agora: Date) {
  if (!valor || !/^\d{2}\/\d{2}$/.test(valor)) return false;
  const [dia, mes] = valor.split("/").map(Number);
  return dia === agora.getDate() && mes === agora.getMonth() + 1;
}

export async function processarAutomacoes(lojistaFiltro?: string) {
  const agora = new Date();
  const automacoes = await prisma.automacao.findMany({ where: { ativa: true, ...(lojistaFiltro ? { lojistaId: lojistaFiltro } : {}) }, include: { lojista: { select: { id: true, nomeNegocio: true, recompensa: true, selosParaGanhar: true } } } });
  let enviados = 0; let ignorados = 0; let falhas = 0;
  for (const automacao of automacoes) {
    const cartoes = await prisma.cartao.findMany({ where: { lojistaId: automacao.lojistaId }, include: { cliente: true } });
    for (const cartao of cartoes) {
      const cliente = cartao.cliente;
      if (!cliente.email || !cliente.aceitaComunicacoes) { ignorados++; continue; }
      let chave: string | null = null;
      if (automacao.tipo === "BOAS_VINDAS") {
        if (!automacao.iniciaEm || cartao.createdAt < automacao.iniciaEm) { ignorados++; continue; }
        chave = `${automacao.id}:${cartao.id}:boas-vindas`;
      } else if (automacao.tipo === "ANIVERSARIO") {
        if (!aniversarioHoje(cliente.aniversario, agora)) { ignorados++; continue; }
        chave = `${automacao.id}:${cliente.id}:${agora.getFullYear()}`;
      } else if (automacao.tipo === "INATIVO") {
        const limite = new Date(agora.getTime() - automacao.diasInativo * 86400000);
        if (cartao.updatedAt > limite) { ignorados++; continue; }
        chave = `${automacao.id}:${cartao.id}:${agora.getFullYear()}-${agora.getMonth() + 1}`;
      } else if (automacao.tipo === "QUASE_LA") {
        const faltam = automacao.lojista.selosParaGanhar - cartao.selos;
        if (faltam < 1 || faltam > 2) { ignorados++; continue; }
        chave = `${automacao.id}:${cartao.id}:${cartao.resgates}:${cartao.selos}`;
      }
      if (!chave) { ignorados++; continue; }
      try {
        await prisma.envioAutomacao.create({ data: { chave, lojistaId: automacao.lojistaId, clienteId: cliente.id, automacaoId: automacao.id } });
      } catch { ignorados++; continue; }
      const faltam = Math.max(0, automacao.lojista.selosParaGanhar - cartao.selos);
      const envio = await enviarEmailAutomacao({ para: cliente.email, nome: cliente.nome, negocio: automacao.lojista.nomeNegocio, assunto: preencher(automacao.assunto, { nome: cliente.nome, negocio: automacao.lojista.nomeNegocio, recompensa: automacao.lojista.recompensa, faltam }), mensagem: preencher(automacao.mensagem, { nome: cliente.nome, negocio: automacao.lojista.nomeNegocio, recompensa: automacao.lojista.recompensa, faltam }) });
      await prisma.envioAutomacao.update({ where: { chave }, data: envio.enviado ? { status: "ENVIADO", enviadoEm: new Date() } : { status: "FALHOU", erro: "Provedor de e-mail indisponível ou não configurado" } });
      if (envio.enviado) enviados++; else falhas++;
    }
  }
  return { enviados, ignorados, falhas };
}
