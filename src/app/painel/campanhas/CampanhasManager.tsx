"use client";

import { FormEvent, useState } from "react";
import { Megaphone, Plus, Sparkles } from "lucide-react";
import CampanhaDivulgacao from "./CampanhaDivulgacao";

type Campanha = { id: string; titulo: string; beneficio: string; descricao: string | null; ativa: boolean; destaque: boolean; createdAt: string; visualizacoes: number; adesoes: number; primeirasVisitas: number; retornos: number };

export default function CampanhasManager({ iniciais, slug }: { iniciais: Campanha[]; slug: string }) {
  const [campanhas, setCampanhas] = useState(iniciais);
  const [titulo, setTitulo] = useState("");
  const [beneficio, setBeneficio] = useState("");
  const [descricao, setDescricao] = useState("");
  const [destaque, setDestaque] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function criar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSalvando(true); setErro("");
    try {
      const res = await fetch("/api/campanhas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ titulo, beneficio, descricao, destaque }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível criar a campanha.");
      setCampanhas((atual) => [data.campanha, ...atual]);
      setTitulo(""); setBeneficio(""); setDescricao(""); setDestaque(true);
    } catch (err) { setErro(err instanceof Error ? err.message : "Tente novamente."); }
    finally { setSalvando(false); }
  }

  async function alternar(id: string, ativa: boolean) {
    const antes = campanhas;
    setCampanhas((atual) => atual.map((c) => c.id === id ? { ...c, ativa } : c));
    const res = await fetch("/api/campanhas", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ativa }) });
    if (!res.ok) setCampanhas(antes);
  }

  return <div className="space-y-7"><section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-950/55 p-5 shadow-2xl backdrop-blur-xl sm:p-7"><div className="flex items-start gap-4"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e9ff65] text-zinc-950"><Megaphone className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Atrair novos clientes</p><h2 className="mt-1 text-xl font-black tracking-tight text-white">Lance uma oferta para a vitrine local.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">Ela aparece em Descobrir para pessoas da sua cidade. Quem gostar pode adicionar seu cartão à carteira antes da primeira visita.</p></div></div></section><section className="rounded-[1.75rem] border border-white/10 bg-zinc-950/45 p-5 backdrop-blur-xl sm:p-7"><h2 className="text-lg font-black text-white">Nova campanha</h2><form onSubmit={criar} className="mt-5 grid gap-4"><label className="grid gap-2 text-sm font-bold text-zinc-300">Chamada da oferta<input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={70} required placeholder="Ex: Boas-vindas para novos clientes" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#e9ff65]/70" /></label><label className="grid gap-2 text-sm font-bold text-zinc-300">O que a pessoa ganha?<input value={beneficio} onChange={(e) => setBeneficio(e.target.value)} maxLength={120} required placeholder="Ex: 10% de desconto na primeira visita" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#e9ff65]/70" /></label><label className="grid gap-2 text-sm font-bold text-zinc-300">Como funciona <span className="font-normal text-zinc-500">(opcional)</span><textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={280} rows={3} placeholder="Ex: Apresente seu cartão na primeira compra. Válido uma vez por pessoa." className="resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#e9ff65]/70" /></label><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-300"><input type="checkbox" checked={destaque} onChange={(e) => setDestaque(e.target.checked)} className="h-4 w-4 accent-[#e9ff65]" /><span><b className="text-white">Colocar em destaque</b><br /><span className="text-xs text-zinc-500">Aparece antes das outras ofertas.</span></span></label>{erro && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{erro}</p>}<button disabled={salvando} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e9ff65] px-5 py-3.5 text-sm font-black text-zinc-950 transition hover:bg-[#f1ff9d] disabled:opacity-60"><Plus className="h-4 w-4" />{salvando ? "Publicando..." : "Publicar campanha"}</button></form></section><section><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black text-white">Suas campanhas</h2><span className="text-sm font-bold text-zinc-500">{campanhas.filter((c) => c.ativa).length} ativas</span></div><div className="space-y-3">{campanhas.length === 0 ? <p className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-zinc-500">Sua primeira oferta vai aparecer aqui.</p> : campanhas.map((campanha) => <article key={campanha.id} className={`rounded-2xl border p-5 backdrop-blur-xl ${campanha.ativa ? "border-white/10 bg-white/[0.05]" : "border-white/5 bg-zinc-950/30 opacity-60"}`}><div className="flex gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-[#e9ff65]"><Sparkles className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-black text-white">{campanha.titulo}</h3><button onClick={() => alternar(campanha.id, !campanha.ativa)} className={`rounded-full px-3 py-1 text-xs font-bold ${campanha.ativa ? "bg-[#e9ff65] text-zinc-950" : "bg-white/10 text-zinc-400"}`}>{campanha.ativa ? "Ativa" : "Pausada"}</button></div><p className="mt-1 text-sm font-bold text-[#e9ff65]">{campanha.beneficio}</p>{campanha.descricao && <p className="mt-2 text-sm leading-5 text-zinc-400">{campanha.descricao}</p>}<div className="mt-4 grid grid-cols-4 gap-2 rounded-xl border border-white/10 bg-black/15 p-3 text-center"><div><p className="text-lg font-black text-white">{campanha.visualizacoes}</p><p className="text-[9px] font-bold uppercase text-zinc-500">abriu</p></div><div><p className="text-lg font-black text-sky-200">{campanha.adesoes}</p><p className="text-[9px] font-bold uppercase text-zinc-500">entrou</p></div><div><p className="text-lg font-black text-emerald-200">{campanha.primeirasVisitas}</p><p className="text-[9px] font-bold uppercase text-zinc-500">visitou</p></div><div><p className="text-lg font-black text-amber-200">{campanha.retornos}</p><p className="text-[9px] font-bold uppercase text-zinc-500">voltou</p></div></div><CampanhaDivulgacao slug={slug} id={campanha.id} titulo={campanha.titulo} beneficio={campanha.beneficio} /></div></div></article>)}</div></section></div>;
}
