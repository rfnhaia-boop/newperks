import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CaptacaoManager from "./CaptacaoManager";

const NOMES: Record<string, string> = { instagram: "Instagram", whatsapp: "WhatsApp", cartaz: "Cartaz / balcão", parceiro: "Parceiros" };
const CORES = ["bg-cyan-300", "bg-violet-400", "bg-[#e9ff65]", "bg-emerald-300", "bg-amber-300"];

export default async function CaptacaoPage() {
  const session = await auth(); const lojistaId = session!.user!.id;
  const [lojista, cartoes] = await Promise.all([
    prisma.lojista.findUnique({ where: { id: lojistaId }, select: { slug: true, ofertaPrimeiraVisitaAtiva: true, ofertaPrimeiraVisita: true, ofertaPrimeiraVisitaRegras: true } }),
    prisma.cartao.findMany({ where: { lojistaId }, select: { origemCadastro: true } }),
  ]);
  const contagem = cartoes.reduce<Record<string, number>>((total, cartao) => { const origem = cartao.origemCadastro || "direto"; total[origem] = (total[origem] ?? 0) + 1; return total; }, {});
  const origens = Object.entries(contagem).sort(([, a], [, b]) => b - a).map(([origem, total], indice) => ({ nome: NOMES[origem] ?? (origem === "direto" ? "Acesso direto" : origem), total, cor: CORES[indice % CORES.length] }));
  const baseUrl = `${(process.env.NEXTAUTH_URL || "http://localhost:3001").replace(/\/$/, "")}/c/${lojista?.slug ?? ""}`;
  return <div className="mx-auto max-w-6xl space-y-7 pb-8"><header><p className="text-xs font-black uppercase tracking-[.2em] text-[#e9ff65]">Captação inteligente</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Faça a primeira visita acontecer.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Dê uma razão para entrar agora e saiba exatamente de onde os novos cartões chegaram.</p></header><CaptacaoManager inicial={{ ativa: lojista?.ofertaPrimeiraVisitaAtiva ?? false, oferta: lojista?.ofertaPrimeiraVisita ?? null, regras: lojista?.ofertaPrimeiraVisitaRegras ?? null }} baseUrl={baseUrl} origens={origens} /></div>;
}
