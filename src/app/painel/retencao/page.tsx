import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const dia = 86_400_000;

type ClienteCartao = {
  id: string;
  selos: number;
  totalCarimbos: number;
  createdAt: Date;
  updatedAt: Date;
  cliente: { nome: string; telefone: string | null; aniversario: string | null };
};

function whatsapp(cartao: ClienteCartao, mensagem: string) {
  const telefone = cartao.cliente.telefone?.replace(/\D/g, "");
  if (!telefone) return null;
  const numero = telefone.length <= 11 ? `55${telefone}` : telefone;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

function ListaSegmento({ titulo, descricao, cor, cartoes, mensagem, detalhe }: {
  titulo: string; descricao: string; cor: string; cartoes: ClienteCartao[];
  mensagem: (cartao: ClienteCartao) => string; detalhe: (cartao: ClienteCartao) => string;
}) {
  return <section className="rounded-[1.65rem] border border-white/10 bg-white/[.035] p-5 backdrop-blur-xl"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className={`text-xs font-black uppercase tracking-[.17em] ${cor}`}>{titulo}</p><p className="mt-1 text-sm text-zinc-400">{descricao}</p></div><span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-sm font-black text-white">{cartoes.length}</span></div><div className="mt-4 space-y-2">{cartoes.length === 0 ? <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-sm text-zinc-500">Nenhum cliente neste grupo agora.</p> : cartoes.map((cartao) => { const link = whatsapp(cartao, mensagem(cartao)); return <article key={cartao.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[.07] bg-black/15 p-3.5"><div><p className="font-black text-white">{cartao.cliente.nome}</p><p className="mt-1 text-xs text-zinc-500">{detalhe(cartao)}</p></div>{link ? <a href={link} target="_blank" rel="noreferrer" className="rounded-xl bg-[#e9ff65] px-3.5 py-2.5 text-xs font-black text-zinc-950 transition hover:bg-[#f3ff9d]">Chamar no WhatsApp</a> : <span className="rounded-xl border border-white/10 px-3.5 py-2.5 text-xs font-bold text-zinc-500">Sem WhatsApp</span>}</article>; })}</div></section>;
}

export default async function RetencaoPage() {
  const session = await auth();
  const [lojista, cartoes] = await Promise.all([
    prisma.lojista.findUnique({ where: { id: session!.user!.id }, select: { nomeNegocio: true, recompensa: true, selosParaGanhar: true } }),
    prisma.cartao.findMany({ where: { lojistaId: session!.user!.id }, include: { cliente: true }, orderBy: { updatedAt: "asc" } }),
  ]);
  const agora = Date.now();
  const diasSemVisita = (c: ClienteCartao) => Math.floor((agora - c.updatedAt.getTime()) / dia);
  const hoje = new Date();
  const ddmm = `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  const emRisco = cartoes.filter((c) => diasSemVisita(c) >= 30);
  const aniversariantes = cartoes.filter((c) => c.cliente.aniversario === ddmm);
  const quaseLa = cartoes.filter((c) => c.selos > 0 && c.selos < (lojista?.selosParaGanhar ?? 10) && (lojista!.selosParaGanhar - c.selos) <= 2);
  const novos = cartoes.filter((c) => c.totalCarimbos === 0 && Math.floor((agora - c.createdAt.getTime()) / dia) <= 14);
  const nome = lojista?.nomeNegocio ?? "nosso estabelecimento";

  return <div className="mx-auto max-w-4xl space-y-6"><header><p className="text-xs font-black uppercase tracking-[.18em] text-amber-300">Retenção inteligente</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white">A mensagem certa, na hora certa.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Os grupos são atualizados pelo uso real do cartão. Você revisa cada conversa antes de abrir o WhatsApp.</p></header><section className="grid gap-3 sm:grid-cols-4"><div className="rounded-2xl border border-amber-300/20 bg-amber-300/[.09] p-4"><p className="text-xs font-bold uppercase text-amber-100/70">Parados</p><p className="mt-2 text-3xl font-black text-amber-200">{emRisco.length}</p><p className="mt-1 text-xs text-zinc-500">30+ dias</p></div><div className="rounded-2xl border border-pink-300/20 bg-pink-300/[.08] p-4"><p className="text-xs font-bold uppercase text-pink-100/70">Aniversário</p><p className="mt-2 text-3xl font-black text-pink-200">{aniversariantes.length}</p><p className="mt-1 text-xs text-zinc-500">hoje</p></div><div className="rounded-2xl border border-sky-300/20 bg-sky-300/[.08] p-4"><p className="text-xs font-bold uppercase text-sky-100/70">Quase lá</p><p className="mt-2 text-3xl font-black text-sky-200">{quaseLa.length}</p><p className="mt-1 text-xs text-zinc-500">faltam até 2 selos</p></div><div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[.08] p-4"><p className="text-xs font-bold uppercase text-emerald-100/70">Novos</p><p className="mt-2 text-3xl font-black text-emerald-200">{novos.length}</p><p className="mt-1 text-xs text-zinc-500">sem primeira visita</p></div></section><ListaSegmento titulo="Clientes parados" cor="text-amber-200" descricao="Traga de volta quem já conhece seu negócio." cartoes={emRisco} detalhe={(c) => `Há ${diasSemVisita(c)} dias sem atividade · ${c.selos} selo(s)`} mensagem={(c) => `Oi, ${c.cliente.nome.split(" ")[0]}! Sentimos sua falta na ${nome}. Volte nos próximos dias e aproveite uma condição especial no seu cartão. ✨`} /><ListaSegmento titulo="Aniversariantes de hoje" cor="text-pink-200" descricao="Uma lembrança pessoal para transformar data em visita." cartoes={aniversariantes} detalhe={() => "Aniversário hoje"} mensagem={(c) => `Feliz aniversário, ${c.cliente.nome.split(" ")[0]}! 🎂 A equipe da ${nome} separou um carinho especial para você. Vem comemorar com a gente!`} /><ListaSegmento titulo="Cartões quase completos" cor="text-sky-200" descricao="Crie urgência quando a recompensa está perto." cartoes={quaseLa} detalhe={(c) => `Faltam ${(lojista?.selosParaGanhar ?? 10) - c.selos} selo(s) para ${lojista?.recompensa}`} mensagem={(c) => `Oi, ${c.cliente.nome.split(" ")[0]}! Você está a só ${(lojista?.selosParaGanhar ?? 10) - c.selos} selo(s) de ganhar ${lojista?.recompensa} na ${nome}. Falta pouco! 🔥`} /><ListaSegmento titulo="Novos clientes" cor="text-emerald-200" descricao="Converta o cartão recém-criado na primeira visita." cartoes={novos} detalhe={() => "Cartão criado, aguardando primeiro carimbo"} mensagem={(c) => `Oi, ${c.cliente.nome.split(" ")[0]}! Seu cartão da ${nome} já está pronto. Faça sua primeira visita e comece a juntar selos hoje. ✨`} /></div>;
}
