"use client";

import { useState } from "react";

type Cartao = { nome: string; url: string };

export default function ConvitesCarteira({ cartoes }: { cartoes: Cartao[] }) {
  const [copiado, setCopiado] = useState<string | null>(null);

  async function compartilhar(cartao: Cartao) {
    const texto = `Eu junto vantagens na ${cartao.nome}. Crie seu cartão por aqui: ${cartao.url}`;
    if (navigator.share) { await navigator.share({ title: `Vantagens na ${cartao.nome}`, text: texto, url: cartao.url }); return; }
    await navigator.clipboard.writeText(texto);
    setCopiado(cartao.nome);
    window.setTimeout(() => setCopiado(null), 2200);
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-7 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] backdrop-blur-2xl">
      <div className="absolute -right-20 -top-20 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-[#e9ff65]/10 blur-[60px] sm:blur-[80px]" />
      
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[.18em] text-[#e9ff65] drop-shadow-md">Convide alguém</p>
          <h2 className="mt-1 sm:mt-2 text-xl sm:text-2xl font-black tracking-[-.04em] text-white drop-shadow-lg leading-tight">Compartilhe os lugares que você curte.</h2>
          <p className="mt-1 sm:mt-2 max-w-xl text-xs sm:text-sm leading-5 sm:leading-6 text-zinc-300 drop-shadow-sm">Seu amigo entra pelo seu convite e o negócio reconhece a sua indicação.</p>
        </div>
        <span className="text-2xl sm:text-4xl text-[#e9ff65] drop-shadow-[0_0_15px_rgba(233,255,101,0.5)]">✦</span>
      </div>
      
      <div className="relative z-10 mt-6 flex flex-wrap gap-3">
        {cartoes.map((cartao) => (
          <button 
            key={cartao.nome} 
            type="button" 
            onClick={() => compartilhar(cartao)} 
            className="rounded-xl bg-[#e9ff65] px-5 py-3.5 text-sm font-black text-zinc-950 shadow-[0_0_15px_rgba(233,255,101,0.3)] transition hover:-translate-y-0.5 hover:bg-[#f3ff9d] hover:shadow-[0_0_25px_rgba(233,255,101,0.5)]"
          >
            {copiado === cartao.nome ? "Link copiado!" : `Indicar ${cartao.nome} →`}
          </button>
        ))}
      </div>
    </section>
  );
}
