"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { MapPin, Sparkles } from "lucide-react";
import { getTema } from "@/lib/themes";

type Campanha = {
  id: string;
  titulo: string;
  beneficio: string;
  descricao: string | null;
  destaque: boolean;
  lojista: {
    nomeNegocio: string;
    slug: string;
    tema: string;
    cidade: string | null;
  };
};

export default function CampanhaDescobrirCard({ campanha: c }: { campanha: Campanha }) {
  const tema = getTema(c.lojista.tema);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  return (
    <article 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.02] backdrop-blur-md transition duration-500 hover:-translate-y-1 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.6)] hover:border-white/20`}
    >
      {/* Luz Interativa do Mouse (Spotlight) */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`
        }}
      />
      
      {/* Luz Colorida Dinâmica do Tema acompanhando o mouse (Brilho líquido) */}
      <div 
        className={`pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-40 bg-gradient-to-br ${tema.gradiente} z-10`}
        style={{
          maskImage: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`
        }}
      />

      {/* Borda Gradiente do Card */}
      <div className={`absolute top-0 w-full h-1.5 bg-gradient-to-r ${tema.gradiente}`} />
      
      <div className="relative z-20 p-4 sm:p-5 pt-4 sm:pt-6 flex flex-row sm:flex-col items-center sm:items-start h-full gap-4 sm:gap-0 pointer-events-none">
        
        {/* Esquerda no Mobile: Emoji e Destaque */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-between w-20 sm:w-full shrink-0 gap-2 sm:gap-0">
          <span className="text-4xl sm:text-3xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110">{tema.emoji}</span>
          {c.destaque && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e9ff65] px-2.5 py-1 text-[10px] font-black text-zinc-950 shadow-[0_0_15px_rgba(233,255,101,0.4)]">
              <Sparkles className="h-3 w-3" />
              DESTAQUE
            </span>
          )}
        </div>
        
        {/* Direita no Mobile: Textos e Botão */}
        <div className="flex flex-col flex-1 w-full text-left">
          <p className="mt-0 sm:mt-6 text-[10px] sm:text-xs font-black uppercase tracking-[.14em] text-white/55">{c.lojista.nomeNegocio}</p>
          <h3 className="mt-1 text-base sm:text-xl font-black leading-tight tracking-[-.04em] text-white drop-shadow-md">{c.titulo}</h3>
          
          <p className="mt-2 sm:mt-4 rounded-xl border border-white/10 bg-white/[0.05] shadow-inner px-2.5 py-1.5 sm:px-3 sm:py-3 text-[11px] sm:text-sm font-black text-[#e9ff65] w-fit sm:w-auto">{c.beneficio}</p>
          
          {c.descricao && (
            <p className="hidden sm:block mt-3 text-sm leading-5 text-white/70 line-clamp-3">{c.descricao}</p>
          )}
        
          <div className="hidden sm:flex mt-5 items-center justify-between mt-auto pt-4">
            <p className="flex items-center gap-1.5 text-xs font-bold text-white/55">
              <MapPin className="h-3.5 w-3.5" />
              {c.lojista.cidade ?? "Parceiro NewPerks"}
            </p>
            <span className="flex gap-1">
              {[0, 1, 2, 3, 4].map((n) => (
                <i key={n} className="h-2 w-2 rounded-full bg-white/30" />
              ))}
            </span>
          </div>
          
          <Link 
            href={`/c/${c.lojista.slug}?campanha=${c.id}`} 
            className="mt-3 sm:mt-5 block w-full rounded-xl bg-white px-3 sm:px-4 py-2 sm:py-3.5 text-center text-[11px] sm:text-sm font-black text-zinc-950 shadow-lg transition duration-300 pointer-events-auto hover:scale-[1.02] hover:bg-zinc-200"
          >
            Quero este cartão →
          </Link>
        </div>
      </div>
    </article>
  );
}
