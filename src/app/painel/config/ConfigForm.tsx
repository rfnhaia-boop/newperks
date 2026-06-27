"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LISTA_TEMAS } from "@/lib/themes";
import CartaoSelos from "@/components/CartaoSelos";

type Config = {
  nomeNegocio: string;
  tema: string;
  selosParaGanhar: number;
  recompensa: string;
  ticketMedio: number;
};

export default function ConfigForm({ inicial }: { inicial: Config }) {
  const router = useRouter();
  const [cfg, setCfg] = useState<Config>(inicial);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  async function salvar() {
    setSalvando(true);
    setSalvo(false);
    const res = await fetch("/api/lojista/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    });
    setSalvando(false);
    if (res.ok) {
      setSalvo(true);
      router.refresh();
      setTimeout(() => setSalvo(false), 2500);
    }
  }

  return (
    <div className="space-y-8">
      {/* Prévia ao vivo */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
          Prévia ao vivo
        </p>
        <CartaoSelos
          tema={cfg.tema}
          nomeNegocio={cfg.nomeNegocio || "Seu Negócio"}
          selos={Math.min(3, cfg.selosParaGanhar)}
          selosParaGanhar={cfg.selosParaGanhar}
          recompensa={cfg.recompensa || "Sua recompensa"}
          nomeCliente="Cliente exemplo"
        />
      </div>

      {/* Tema */}
      <div>
        <label className="mb-3 block text-sm font-medium text-zinc-300">
          Tema do cartão
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {LISTA_TEMAS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setCfg({ ...cfg, tema: t.id })}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 bg-gradient-to-br p-4 transition ${t.gradiente} ${
                cfg.tema === t.id
                  ? "border-white ring-2 ring-white/50"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <span className="text-3xl">{t.emoji}</span>
              <span className="text-xs font-medium text-white">{t.nome}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nome do negócio */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Nome do negócio
        </label>
        <input
          type="text"
          value={cfg.nomeNegocio}
          onChange={(e) => setCfg({ ...cfg, nomeNegocio: e.target.value })}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-violet-500"
        />
      </div>

      {/* Selos para ganhar */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Selos para ganhar a recompensa:{" "}
          <span className="font-bold text-violet-400">{cfg.selosParaGanhar}</span>
        </label>
        <input
          type="range"
          min={1}
          max={20}
          value={cfg.selosParaGanhar}
          onChange={(e) => setCfg({ ...cfg, selosParaGanhar: Number(e.target.value) })}
          className="w-full accent-violet-500"
        />
        <div className="flex justify-between text-xs text-zinc-500">
          <span>1</span>
          <span>20</span>
        </div>
      </div>

      {/* Recompensa */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Recompensa
        </label>
        <input
          type="text"
          value={cfg.recompensa}
          onChange={(e) => setCfg({ ...cfg, recompensa: e.target.value })}
          placeholder="Ex: 1 café grátis, 50% de desconto..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-violet-500"
        />
      </div>

      {/* Ticket médio */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Ticket médio por compra (R$)
        </label>
        <input
          type="number"
          min={0}
          step="0.01"
          value={cfg.ticketMedio || ""}
          onChange={(e) => setCfg({ ...cfg, ticketMedio: Number(e.target.value) })}
          placeholder="Ex: 25.00"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-violet-500"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Usado pra estimar seu faturamento no painel (carimbos × ticket médio).
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={salvar}
          disabled={salvando}
          className="rounded-lg bg-violet-600 px-6 py-2.5 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
        >
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
        {salvo && <span className="text-sm font-medium text-emerald-400">✓ Salvo!</span>}
      </div>
    </div>
  );
}
