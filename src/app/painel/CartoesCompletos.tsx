"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Completo = { clienteId: string; nome: string };

export default function CartoesCompletos({ completos }: { completos: Completo[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function resgatar(clienteId: string) {
    setLoading(clienteId);
    const res = await fetch("/api/selos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clienteId, acao: "resgatar" }),
    });
    const data = await res.json();
    setLoading(null);
    if (res.ok && data.resgatou) {
      router.refresh();
    } else if (!res.ok) {
      alert(data.error ?? "Erro");
    }
  }

  if (completos.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500">
        Nenhum cartão completo no momento 🎯
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {completos.map((c) => (
        <div
          key={c.clienteId}
          className="flex items-center justify-between rounded-lg bg-zinc-800/60 px-3 py-2"
        >
          <span className="truncate text-sm font-medium text-white">🎉 {c.nome}</span>
          <button
            onClick={() => resgatar(c.clienteId)}
            disabled={loading === c.clienteId}
            className="shrink-0 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading === c.clienteId ? "..." : "Resgatar"}
          </button>
        </div>
      ))}
    </div>
  );
}
