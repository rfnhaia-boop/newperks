"use client";

import { useState } from "react";

export default function FeedbackForm({ token, nomeNegocio, jaEnviado }: { token: string; nomeNegocio: string; jaEnviado: boolean }) {
  const [aberto, setAberto] = useState(false);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [estado, setEstado] = useState<"pronto" | "enviando" | "feito">(jaEnviado ? "feito" : "pronto");
  const [erro, setErro] = useState("");

  async function enviar() {
    if (!nota) return;
    setEstado("enviando"); setErro("");
    try {
      const res = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, nota, comentario }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Não foi possível enviar sua opinião.");
      setEstado("feito");
      if (data.googleReviewUrl) window.open(data.googleReviewUrl, "_blank", "noopener,noreferrer");
    } catch (e) { setEstado("pronto"); setErro(e instanceof Error ? e.message : "Tente novamente."); }
  }

  if (estado === "feito") return <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[.08] p-4"><p className="text-sm font-black text-emerald-200">✓ Sua opinião foi recebida.</p><p className="mt-1 text-xs leading-5 text-emerald-100/65">Obrigado por ajudar {nomeNegocio} a ficar ainda melhor.</p></div>;

  return <div className="rounded-2xl border border-sky-300/20 bg-sky-300/[.07] p-4"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-300 text-lg text-zinc-950">✦</span><div><p className="text-sm font-black text-white">Como foi sua experiência?</p><p className="mt-1 text-xs leading-5 text-white/65">Sua opinião é privada e ajuda este lugar a melhorar.</p></div></div>{!aberto ? <button type="button" onClick={() => setAberto(true)} className="mt-4 w-full rounded-xl border border-white/15 bg-white/10 py-3 text-sm font-black text-white transition hover:bg-white hover:text-zinc-950">Avaliar agora</button> : <div className="mt-4 space-y-3"><div className="flex justify-between gap-1" aria-label="Escolha uma nota de 1 a 5">{[1,2,3,4,5].map((n) => <button key={n} type="button" onClick={() => setNota(n)} className={`grid h-10 flex-1 place-items-center rounded-xl text-xl transition ${nota >= n ? "bg-amber-300 text-zinc-950" : "bg-white/10 text-white/40 hover:bg-white/20"}`}>★</button>)}</div><textarea value={comentario} onChange={(e) => setComentario(e.target.value)} maxLength={600} placeholder="Quer contar mais? (opcional)" className="min-h-24 w-full resize-none rounded-xl border border-white/10 bg-black/15 p-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-sky-300/60" />{erro && <p className="text-xs text-red-300">{erro}{erro.includes("Abra sua carteira") && <> <a className="font-bold underline" href="/carteira">Abrir carteira</a></>}</p>}<button type="button" disabled={!nota || estado === "enviando"} onClick={enviar} className="w-full rounded-xl bg-sky-300 py-3 text-sm font-black text-zinc-950 transition hover:bg-sky-200 disabled:opacity-40">{estado === "enviando" ? "Enviando..." : "Enviar minha opinião"}</button></div>}</div>;
}
