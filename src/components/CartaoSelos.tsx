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

  // Calcula colunas: 5 por linha fica bom para 10; ajusta para outros totais
  const colunas = selosParaGanhar % 5 === 0 ? 5 : selosParaGanhar % 4 === 0 ? 4 : 5;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${t.gradiente} ${
        compacto ? "p-4" : "p-6 sm:p-8"
      } shadow-2xl`}
    >
      {/* Brilho decorativo */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-black/20 blur-3xl" />

      {/* Cabeçalho */}
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-white/60">
            Cartão Fidelidade
          </p>
          <h2 className={`font-bold text-white ${compacto ? "text-lg" : "text-2xl"}`}>
            {nomeNegocio}
          </h2>
          {nomeCliente && (
            <p className="mt-0.5 text-sm text-white/70">{nomeCliente}</p>
          )}
        </div>
        <span className={`${compacto ? "text-3xl" : "text-4xl"} drop-shadow-lg`}>
          {t.emoji}
        </span>
      </div>

      {/* Selos */}
      <div
        className={`relative mt-6 grid justify-items-center gap-3`}
        style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: selosParaGanhar }).map((_, i) => {
          const ativo = i < selos;
          return (
            <div
              key={i}
              className={`flex aspect-square w-full max-w-[56px] items-center justify-center rounded-full transition-all duration-300 ${
                ativo
                  ? `scale-100 ${t.seloBg} shadow-lg ring-2 ring-white/40`
                  : "scale-95 border-2 border-dashed border-white/25 bg-black/10"
              }`}
            >
              {ativo ? (
                <Icone className="h-1/2 w-1/2 text-white" />
              ) : (
                <span className="text-xs font-semibold text-white/40">
                  {i + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Rodapé / status */}
      <div className="relative mt-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white/80">Recompensa</p>
          <p className="text-base font-bold text-white">{recompensa}</p>
        </div>
        {completo ? (
          <span className="animate-pulse rounded-full bg-white px-4 py-2 text-sm font-extrabold text-zinc-900 shadow-lg">
            🎉 COMPLETO!
          </span>
        ) : (
          <div className="text-right">
            <p className="text-2xl font-extrabold text-white">
              {selos}
              <span className="text-base font-medium text-white/60">
                /{selosParaGanhar}
              </span>
            </p>
            <p className="text-xs text-white/60">
              {faltam === 1 ? "falta 1 selo" : `faltam ${faltam} selos`}
            </p>
          </div>
        )}
      </div>

      {resgates > 0 && (
        <p className="relative mt-3 text-xs text-white/50">
          ⭐ {resgates} {resgates === 1 ? "recompensa resgatada" : "recompensas resgatadas"}
        </p>
      )}
    </div>
  );
}
