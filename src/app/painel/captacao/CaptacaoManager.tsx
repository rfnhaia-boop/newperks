"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, Copy, Gift, Link2, MessageCircle, MousePointerClick, Save, Sparkles } from "lucide-react";

type Origem = { nome: string; total: number; cor: string };
type Props = { inicial: { ativa: boolean; oferta: string | null; regras: string | null }; baseUrl: string; origens: Origem[] };
const CANAIS = [
  { id: "instagram", nome: "Instagram", icone: Camera, descricao: "Bio, stories e posts" },
  { id: "whatsapp", nome: "WhatsApp", icone: MessageCircle, descricao: "Status, grupos e mensagens" },
  { id: "cartaz", nome: "Cartaz / balcão", icone: MousePointerClick, descricao: "QR Code físico e mesa" },
  { id: "parceiro", nome: "Parceiros", icone: Sparkles, descricao: "Indicações e collabs" },
];

export default function CaptacaoManager({ inicial, baseUrl, origens }: Props) {
  const router = useRouter();
  const [ativa, setAtiva] = useState(inicial.ativa);
  const [oferta, setOferta] = useState(inicial.oferta ?? "");
  const [regras, setRegras] = useState(inicial.regras ?? "");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [copiado, setCopiado] = useState("");

  async function salvar() {
    setSalvando(true); setMensagem("");
    const res = await fetch("/api/captacao", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ativa, oferta, regras }) });
    const data = await res.json(); setSalvando(false);
    if (!res.ok) { setMensagem(data.error ?? "Não foi possível salvar."); return; }
    setMensagem("Oferta atualizada. Novos cartões receberão essa vantagem."); router.refresh();
  }
  async function copiar(id: string) {
    await navigator.clipboard.writeText(`${baseUrl}?origem=${id}`);
    setCopiado(id); setTimeout(() => setCopiado(""), 1800);
  }

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
    <section className="relative overflow-hidden rounded-[2rem] border border-[#e9ff65]/20 bg-zinc-900/65 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-7"><div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#e9ff65]/[.08] blur-3xl" /><div className="relative"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e9ff65]/25 bg-[#e9ff65]/[.1] text-[#e9ff65]"><Gift className="h-5 w-5" /></div><div><h2 className="text-xl font-black tracking-tight text-white">Oferta para a primeira visita</h2><p className="mt-1 text-sm leading-6 text-zinc-400">Uma vantagem de entrada para transformar curiosidade em primeira compra.</p></div></div>
      <div className="mt-7 space-y-5"><div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4"><div><p className="font-black text-white">Ativar oferta de boas-vindas</p><p className="mt-1 text-xs text-zinc-500">Só quem criar um novo cartão recebe a oferta.</p></div><button type="button" onClick={() => setAtiva(!ativa)} aria-pressed={ativa} className={`relative h-7 w-12 rounded-full transition ${ativa ? "bg-[#e9ff65]" : "bg-white/15"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-zinc-950 shadow transition ${ativa ? "left-6" : "left-1"}`} /></button></div>
      <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[.15em] text-zinc-400">O que a pessoa ganha</span><input value={oferta} onChange={(e) => setOferta(e.target.value)} maxLength={140} placeholder="Ex.: 15% OFF na primeira compra" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-base font-bold text-white outline-none transition focus:border-[#e9ff65]/55 focus:ring-4 focus:ring-[#e9ff65]/10" /></label>
      <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[.15em] text-zinc-400">Condições <span className="font-medium normal-case tracking-normal text-zinc-600">(opcional)</span></span><textarea value={regras} onChange={(e) => setRegras(e.target.value)} rows={3} maxLength={300} placeholder="Ex.: Válido para consumo acima de R$ 30, somente na primeira visita." className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-[#e9ff65]/55 focus:ring-4 focus:ring-[#e9ff65]/10" /></label>
      {mensagem && <p className={`rounded-xl px-3 py-2.5 text-sm ${mensagem.startsWith("Oferta") ? "bg-emerald-400/10 text-emerald-200" : "bg-red-400/10 text-red-200"}`}>{mensagem}</p>}<button type="button" onClick={salvar} disabled={salvando} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e9ff65] px-5 py-3.5 text-sm font-black text-zinc-950 transition hover:bg-[#f3ff9d] disabled:opacity-60"><Save className="h-4 w-4" />{salvando ? "Salvando..." : "Salvar oferta de entrada"}</button></div></div></section>
    <aside className="space-y-4"><section className="rounded-[1.75rem] border border-white/10 bg-zinc-900/60 p-5"><div className="flex items-center gap-2"><Link2 className="h-4 w-4 text-[#e9ff65]" /><h2 className="text-sm font-black uppercase tracking-[.15em] text-white">Links rastreáveis</h2></div><p className="mt-2 text-xs leading-5 text-zinc-500">Cada link marca a origem apenas quando cria um cartão novo.</p><div className="mt-4 space-y-2.5">{CANAIS.map((canal) => { const Icon = canal.icone; return <div key={canal.id} className="flex items-center gap-3 rounded-2xl border border-white/[.08] bg-white/[.035] p-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white"><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-sm font-black text-white">{canal.nome}</p><p className="text-[11px] text-zinc-500">{canal.descricao}</p></div><button onClick={() => copiar(canal.id)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:bg-white/15 hover:text-white" title={`Copiar link do ${canal.nome}`}>{copiado === canal.id ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}</button></div>; })}</div></section>
      <section className="rounded-[1.75rem] border border-cyan-300/15 bg-cyan-300/[.06] p-5"><p className="text-xs font-black uppercase tracking-[.15em] text-cyan-100/70">De onde vieram seus cartões</p>{origens.length === 0 ? <p className="mt-3 text-sm leading-6 text-zinc-500">Compartilhe um link rastreável para começar a medir seus canais.</p> : <div className="mt-4 space-y-3">{origens.map((origem) => <div key={origem.nome}><div className="flex justify-between gap-3 text-sm"><span className="font-bold text-white">{origem.nome}</span><span className="font-black text-cyan-200">{origem.total}</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className={origem.cor} style={{ width: `${Math.min(100, (origem.total / Math.max(...origens.map((item) => item.total))) * 100)}%` }} /></div></div>)}</div>}</section></aside></div>;
}
