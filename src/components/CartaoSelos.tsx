"use client";

import { getTema } from "@/lib/themes";

type Props = {
  tema: string;
  nomeNegocio: string;
  selos: number;
  selosParaGanhar: number;
  recompensa: string;
  nomeCliente?: string;
  resgates?: number;
  /** Versão compacta para listas do painel */
  compacto?: boolean;
};

export default function CartaoSelos({
  tema,
  nomeNegocio,
  selos,
  selosParaGanhar,
  recompensa,
  nomeCliente,
  resgates = 0,
  compacto = false,
}: Props) {
  const t = getTema(tema);
  const { Icone } = t;
  const completo = selos >= selosParaGanhar;
  const faltam = Math.max(0, selosParaGanhar - selos);
  const progresso = Math.min((selos / selosParaGanhar) * 100, 100);

  const colunas = selosParaGanhar % 5 === 0 ? 5 : selosParaGanhar % 4 === 0 ? 4 : 5;

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] ${
        compacto ? "p-5" : "px-7 pt-7 pb-6"
      } shadow-[0_8px_32px_rgba(0,0,0,0.25)] border border-white/20`}
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
      }}
    >
      {/* Glass reflections */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="min-w-0 flex-1">
          {nomeCliente && (
            <p className="text-xs text-white/60 font-medium truncate">
              {nomeCliente}
            </p>
          )}
          <h2 className={`font-bold text-white truncate ${compacto ? "text-lg" : "text-xl"}`}>
            {nomeNegocio}
          </h2>
        </div>
        <span className={`${compacto ? "text-3xl" : "text-4xl"} ml-3 flex-shrink-0`}>
          {t.emoji}
        </span>
      </div>

      {/* Progress bar */}
      {!compacto && (
        <div className="relative mt-5 h-1.5 rounded-full bg-black/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-white/80 transition-all duration-700 ease-out"
            style={{ width: `${progresso}%` }}
          />
        </div>
      )}

      {/* Stamps */}
      <div
        className="relative mt-5 grid justify-items-center gap-2.5"
        style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: selosParaGanhar }).map((_, i) => {
          const ativo = i < selos;
          return (
            <div
              key={i}
              className={`flex aspect-square w-full max-w-[48px] items-center justify-center rounded-full transition-all duration-300 ${
                ativo
                  ? "bg-white/90 shadow-lg scale-100"
                  : "bg-white/10 scale-95"
              }`}
            >
              {ativo ? (
                <Icone className="h-[45%] w-[45%] text-zinc-800" />
              ) : (
                <span className="text-[10px] font-bold text-white/25">
                  {i + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="relative mt-5 flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-white/45 font-semibold">
            Recompensa
          </p>
          <p className="text-sm font-bold text-white truncate">{recompensa}</p>
        </div>
        {completo ? (
          <span className="rounded-full bg-white px-4 py-1.5 text-xs font-extrabold text-zinc-900 shadow-lg whitespace-nowrap">
            Completo! 🎉
          </span>
        ) : (
          <p className="text-right whitespace-nowrap">
            <span className="text-xl font-extrabold text-white">{selos}</span>
            <span className="text-sm text-white/50">/{selosParaGanhar}</span>
          </p>
        )}
      </div>

      {resgates > 0 && (
        <p className="relative mt-3 text-[10px] text-white/40 font-medium">
          ⭐ {resgates} {resgates === 1 ? "resgate" : "resgates"}
        </p>
      )}
    </div>
  );
}
