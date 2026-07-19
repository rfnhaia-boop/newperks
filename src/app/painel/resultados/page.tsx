import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PERIODOS = [7, 30, 90] as const;

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function percentual(parte: number, total: number) {
  return total > 0 ? Math.round((parte / total) * 100) : 0;
}

function dataChave(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

function dataCurta(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(data);
}

function Metric({ titulo, valor, detalhe, cor = "text-white" }: { titulo: string; valor: string | number; detalhe: string; cor?: string }) {
  return <article className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-zinc-900/60 p-5 shadow-xl shadow-black/10 backdrop-blur-xl"><div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" /><p className="text-[11px] font-black uppercase tracking-[.16em] text-zinc-500">{titulo}</p><p className={`mt-2 text-3xl font-black tracking-tight ${cor}`}>{valor}</p><p className="mt-1.5 text-xs leading-5 text-zinc-500">{detalhe}</p></article>;
}

export default async function ResultadosPage({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
  const { periodo: periodoTexto } = await searchParams;
  const periodo = PERIODOS.includes(Number(periodoTexto) as 7 | 30 | 90) ? Number(periodoTexto) : 30;
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  inicio.setDate(inicio.getDate() - (periodo - 1));
  const session = await auth();
  const lojistaId = session!.user!.id;

  const [lojista, cartoes, carimbos, resgates, campanhas] = await Promise.all([
    prisma.lojista.findUnique({ where: { id: lojistaId }, select: { nomeNegocio: true, ticketMedio: true } }),
    prisma.cartao.findMany({ where: { lojistaId }, select: { id: true, clienteId: true, createdAt: true, totalCarimbos: true } }),
    prisma.carimbo.findMany({ where: { createdAt: { gte: inicio }, cartao: { lojistaId } }, select: { createdAt: true, valor: true, cartao: { select: { clienteId: true, createdAt: true } } } }),
    prisma.resgate.findMany({ where: { lojistaId, createdAt: { gte: inicio } }, select: { id: true, createdAt: true } }),
    prisma.campanha.findMany({ where: { lojistaId }, select: { id: true, titulo: true, beneficio: true, ativa: true, visualizacoes: true, adesoes: true, primeirasVisitas: true, retornos: true }, orderBy: { visualizacoes: "desc" }, take: 6 }),
  ]);

  const novos = cartoes.filter((cartao) => cartao.createdAt >= inicio).length;
  const clientesAtivos = new Set(carimbos.map((carimbo) => carimbo.cartao.clienteId)).size;
  const clientesRetornando = new Set(carimbos.filter((carimbo) => carimbo.cartao.createdAt < inicio).map((carimbo) => carimbo.cartao.clienteId)).size;
  const valorRegistrado = carimbos.reduce((soma, carimbo) => soma + (carimbo.valor ?? 0), 0);
  const comprasSemValor = carimbos.filter((carimbo) => carimbo.valor === null).length;
  const ticket = lojista?.ticketMedio ?? 0;
  const faturamento = valorRegistrado + comprasSemValor * ticket;
  const taxaRetorno = percentual(clientesRetornando, clientesAtivos);

  const dias = Array.from({ length: periodo }, (_, indice) => {
    const data = new Date(inicio);
    data.setDate(inicio.getDate() + indice);
    return { data, chave: dataChave(data), carimbos: 0 };
  });
  const porData = new Map(dias.map((dia) => [dia.chave, dia]));
  carimbos.forEach((carimbo) => { const dia = porData.get(dataChave(carimbo.createdAt)); if (dia) dia.carimbos += 1; });
  const maiorDia = Math.max(1, ...dias.map((dia) => dia.carimbos));
  const campanhasComDados = campanhas.filter((campanha) => campanha.visualizacoes + campanha.adesoes + campanha.primeirasVisitas + campanha.retornos > 0);

  return <div className="mx-auto max-w-6xl space-y-7 pb-10">
    <header className="relative overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-zinc-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/[.09] blur-3xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-200">Resultados do programa</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">O que a fidelidade está movendo.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Leitura direta de aquisição, retorno e consumo na {lojista?.nomeNegocio ?? "sua empresa"}.</p></div><div className="flex rounded-2xl border border-white/10 bg-black/20 p-1">{PERIODOS.map((opcao) => <Link key={opcao} href={`/painel/resultados?periodo=${opcao}`} className={`rounded-xl px-3 py-2 text-xs font-black transition ${periodo === opcao ? "bg-cyan-200 text-zinc-950 shadow-lg shadow-cyan-200/10" : "text-zinc-500 hover:text-white"}`}>{opcao} dias</Link>)}</div></div>
    </header>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric titulo="Clientes novos" valor={novos} detalhe={`cartões criados nos últimos ${periodo} dias`} cor="text-cyan-200" /><Metric titulo="Clientes ativos" valor={clientesAtivos} detalhe="pessoas que receberam ao menos um selo" cor="text-white" /><Metric titulo="Taxa de retorno" valor={`${taxaRetorno}%`} detalhe={`${clientesRetornando} cliente${clientesRetornando === 1 ? "" : "s"} já era da base`} cor="text-emerald-300" /><Metric titulo="Recompensas usadas" valor={resgates.length} detalhe="entregas confirmadas no período" cor="text-amber-200" /></section>

    <section className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]"><article className="rounded-[2rem] border border-white/10 bg-zinc-900/55 p-5 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-zinc-500">Ritmo de visitas</p><h2 className="mt-1 text-xl font-black text-white">{carimbos.length} selo{carimbos.length === 1 ? "" : "s"} neste período</h2></div><p className="text-xs text-zinc-500">Cada barra é um dia</p></div><div className="mt-8 flex h-40 items-end gap-1.5">{dias.map((dia) => <div key={dia.chave} className="group relative flex h-full flex-1 items-end"><div title={`${dataCurta(dia.data)}: ${dia.carimbos} selo(s)`} style={{ height: `${Math.max(dia.carimbos ? 8 : 2, (dia.carimbos / maiorDia) * 100)}%` }} className="w-full rounded-t-md bg-gradient-to-t from-cyan-500 to-sky-200 transition-all duration-500 group-hover:from-cyan-300 group-hover:to-white" /></div>)}</div><div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-600"><span>{dataCurta(inicio)}</span><span>hoje</span></div></article>
      <article className="relative overflow-hidden rounded-[2rem] border border-emerald-300/15 bg-emerald-300/[.07] p-6"><div className="absolute -right-10 -bottom-12 h-40 w-40 rounded-full border-[18px] border-emerald-300/[.08]" /><div className="relative"><p className="text-xs font-black uppercase tracking-[.16em] text-emerald-100/60">Consumo movimentado</p><p className="mt-3 text-4xl font-black tracking-tight text-emerald-200">{moeda(faturamento)}</p><p className="mt-2 max-w-sm text-xs leading-5 text-emerald-50/55">{valorRegistrado > 0 ? `${moeda(valorRegistrado)} foi registrado no balcão` : "Estimativa baseada no ticket médio"}{comprasSemValor > 0 && ticket > 0 ? ` + ${comprasSemValor} compra${comprasSemValor === 1 ? "" : "s"} estimada${comprasSemValor === 1 ? "" : "s"}.` : "."}</p><Link href="/painel/clientes" className="mt-6 inline-flex rounded-xl border border-emerald-200/20 bg-emerald-100/10 px-3 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-100/20">Registrar uma visita →</Link></div></article></section>

    <section className="rounded-[2rem] border border-white/10 bg-zinc-900/55 p-5 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-fuchsia-200/70">Funil de campanhas</p><h2 className="mt-1 text-xl font-black text-white">Da descoberta ao retorno.</h2></div><Link href="/painel/campanhas" className="text-xs font-black text-fuchsia-200 hover:text-white">Gerenciar ofertas →</Link></div>{campanhasComDados.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-7 text-center text-sm text-zinc-500">Publique uma oferta e os resultados de abertura, entrada, visita e retorno aparecerão aqui.</div> : <div className="mt-6 grid gap-4 lg:grid-cols-2">{campanhasComDados.map((campanha) => { const etapas = [{ nome: "abriu", valor: campanha.visualizacoes, cor: "bg-fuchsia-300" }, { nome: "entrou", valor: campanha.adesoes, cor: "bg-violet-400" }, { nome: "visitou", valor: campanha.primeirasVisitas, cor: "bg-sky-300" }, { nome: "voltou", valor: campanha.retornos, cor: "bg-emerald-300" }]; const topo = Math.max(1, campanha.visualizacoes); return <article key={campanha.id} className="rounded-2xl border border-white/[.08] bg-black/15 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-black text-white">{campanha.titulo}</p><p className="mt-1 text-xs text-zinc-500">{campanha.beneficio}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${campanha.ativa ? "bg-emerald-300/10 text-emerald-200" : "bg-white/5 text-zinc-500"}`}>{campanha.ativa ? "ATIVA" : "ENCERRADA"}</span></div><div className="mt-5 grid grid-cols-4 gap-2">{etapas.map((etapa) => <div key={etapa.nome}><div className="flex h-14 items-end rounded-lg bg-white/[.04] p-1"><div style={{ height: `${Math.max(etapa.valor ? 10 : 2, (etapa.valor / topo) * 100)}%` }} className={`w-full rounded-md ${etapa.cor}`} /></div><p className="mt-2 text-sm font-black text-white">{etapa.valor}</p><p className="text-[10px] font-bold uppercase text-zinc-600">{etapa.nome}</p></div>)}</div><p className="mt-4 text-xs text-zinc-500">{percentual(campanha.primeirasVisitas, campanha.adesoes)}% de quem entrou fez a primeira visita.</p></article>; })}</div>}</section>

    <section className="grid gap-3 sm:grid-cols-3"><Metric titulo="Base total" valor={cartoes.length} detalhe="clientes com cartão no seu negócio" /><Metric titulo="Compras no histórico" valor={cartoes.reduce((total, cartao) => total + cartao.totalCarimbos, 0)} detalhe="todos os selos já entregues" /><Metric titulo="Próxima ação" valor={clientesRetornando > 0 ? "Retenção" : "Aquisição"} detalhe={clientesRetornando > 0 ? "Há clientes ativos que já conhecem a casa." : "Convide novos clientes com seu QR Code."} cor="text-fuchsia-200" /></section>
  </div>;
}
