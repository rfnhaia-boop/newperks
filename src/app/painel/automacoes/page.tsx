import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AutomacoesManager from "./AutomacoesManager";
import { PADROES, TIPOS_AUTOMACAO, type TipoAutomacao } from "@/lib/automacoes";

export default async function AutomacoesPage() {
  const session = await auth(); const lojistaId = session!.user!.id;
  const [salvas, consentidos] = await Promise.all([prisma.automacao.findMany({ where: { lojistaId } }), prisma.cliente.count({ where: { aceitaComunicacoes: true, cartoes: { some: { lojistaId } } } })]);
  const iniciais = TIPOS_AUTOMACAO.map((tipo) => { const salva = salvas.find((item) => item.tipo === tipo); const padrao = PADROES[tipo as TipoAutomacao]; return { tipo, titulo: padrao.titulo, assunto: salva?.assunto ?? padrao.assunto, mensagem: salva?.mensagem ?? padrao.mensagem, ativa: salva?.ativa ?? false, diasInativo: salva?.diasInativo ?? 30 }; });
  return <div className="mx-auto max-w-6xl space-y-7 pb-10"><header><p className="text-xs font-black uppercase tracking-[.2em] text-[#e9ff65]">Automação de retenção</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">A mensagem certa, sem perseguir ninguém.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">O sistema avalia as regras diariamente e envia somente para quem autorizou comunicações.</p></header><AutomacoesManager iniciais={iniciais} consentidos={consentidos} provedorPronto={Boolean(process.env.RESEND_API_KEY)} /></div>;
}
