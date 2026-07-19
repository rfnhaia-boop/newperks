"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getTema } from "@/lib/themes";

type Lojista = { nomeNegocio: string; recompensa: string; selosParaGanhar: number; tema: string; campanhas?: { id: string; titulo: string; beneficio: string }[] };
type CartaoProps = { id: string; token: string; selos: number; lojista: Lojista };

export default function CartaoFidelidadeCard({ cartao }: { cartao: CartaoProps }) {
  const tema = getTema(cartao.lojista.tema);
  const faltam = Math.max(cartao.lojista.selosParaGanhar - cartao.selos, 0);
  const progresso = Math.min((cartao.selos / cartao.lojista.selosParaGanhar) * 100, 100);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [aberto, setAberto] = useState(false);
  const router = useRouter();
  const cardRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  return (
    <>
    <button type="button"
      ref={cardRef}
      key={cartao.id} 
      onClick={() => setAberto(true)}
      onMouseMove={handleMouseMove}
      className="group relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.02] backdrop-blur-md transition duration-500 hover:-translate-y-1 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.6)] hover:border-white/20 block"
    >
      {/* Luz Interativa do Mouse (Spotlight branco suave) */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`
        }}
      />
      
      {/* Luz Colorida Dinâmica do Tema acompanhando o mouse (Brilho líquido) */}
      <div 
        className={`pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-40 bg-gradient-to-br ${tema.gradiente}`}
        style={{
          maskImage: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`
        }}
      />

      {/* Barra superior de progresso visual */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${tema.gradiente}`} />
      
      <div className="relative z-10 p-4 sm:p-5 pointer-events-none">
        <div className="flex justify-between items-center">
          <span className="text-2xl sm:text-3xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110">{tema.emoji}</span>
          <span className="rounded-full bg-black/40 border border-white/10 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold text-white/90 backdrop-blur-sm shadow-inner">{cartao.selos}/{cartao.lojista.selosParaGanhar} selos</span>
        </div>
        
        <h3 className="mt-3 sm:mt-5 text-base sm:text-lg font-black text-white leading-tight">{cartao.lojista.nomeNegocio}</h3>
        <p className="mt-1 min-h-8 sm:min-h-10 text-xs sm:text-sm text-zinc-400 line-clamp-2">{cartao.lojista.recompensa}</p>
        
        <div className="mt-4 sm:mt-5 h-1.5 sm:h-2 overflow-hidden rounded-full bg-black/50 border border-white/5 shadow-inner">
          <div className={`h-full bg-gradient-to-r ${tema.gradiente} shadow-[0_0_10px_rgba(255,255,255,0.3)]`} style={{ width: `${progresso}%` }} />
        </div>
        
        <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs font-bold text-zinc-500">{faltam === 0 ? "Prêmio disponível — resgate agora" : `Faltam ${faltam} selos`}</p>
      </div>
    </button>
    {aberto && <div className="fixed inset-0 z-[100] grid place-items-end bg-black/70 p-4 backdrop-blur-sm sm:place-items-center" onClick={() => setAberto(false)}><section className="w-full max-w-md rounded-[2rem] border border-white/15 bg-zinc-950 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}><p className="text-xs font-black uppercase tracking-[.16em] text-[#e9ff65]">Seu próximo prêmio</p><h2 className="mt-2 text-2xl font-black text-white">{cartao.lojista.nomeNegocio}</h2><p className="mt-3 text-zinc-300">Faltam <strong className="text-white">{faltam} selo{faltam !== 1 ? "s" : ""}</strong> para ganhar <strong className="text-[#e9ff65]">{cartao.lojista.recompensa}</strong>.</p>{cartao.lojista.campanhas?.length ? <div className="mt-5 space-y-2"><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Novidades para você</p>{cartao.lojista.campanhas.map((c) => <div key={c.id} className="rounded-xl border border-white/10 bg-white/[.05] p-3"><p className="font-bold text-white">{c.titulo}</p><p className="mt-1 text-sm text-[#e9ff65]">{c.beneficio}</p></div>)}</div> : <p className="mt-5 rounded-xl bg-white/[.05] p-3 text-sm text-zinc-400">Sem novas campanhas agora. Continue juntando seus selos.</p>}<button onClick={() => router.push(`/cartao/${cartao.token}`)} className="mt-6 w-full rounded-xl bg-[#e9ff65] py-3.5 font-black text-zinc-950">Abrir meu cartão →</button><button onClick={() => setAberto(false)} className="mt-3 w-full py-2 text-sm font-bold text-zinc-500">Agora não</button></section></div>}
    </>
  );
}
