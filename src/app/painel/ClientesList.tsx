"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getTema } from "@/lib/themes";

type Cartao = {
  id: string;
  selos: number;
  resgates: number;
  cliente: { id: string; nome: string; telefone: string | null; email: string | null };
};

export default function ClientesList({
  cartoes,
  tema,
  selosParaGanhar,
}: {
  cartoes: Cartao[];
  tema: string;
  selosParaGanhar: number;
}) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const t = getTema(tema);
  const { Icone } = t;

  const filtrados = cartoes.filter((c) => {
    const q = busca.toLowerCase();
    return (
      c.cliente.nome.toLowerCase().includes(q) ||
      (c.cliente.email ?? "").toLowerCase().includes(q) ||
      (c.cliente.telefone ?? "").includes(busca)
    );
  });

  async function acaoSelo(clienteId: string, acao: "carimbar" | "resgatar") {
    setLoading(clienteId);
    const res = await fetch("/api/selos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clienteId, acao }),
    });
    const data = await res.json();
    setLoading(null);
    if (res.ok && data.completou) {
      alert(`🎉 ${data.cartao.cliente.nome} completou o cartão! Resgate a recompensa: ${data.recompensa}`);
    }
    if (res.ok && data.resgatou) {
      alert(`✅ Recompensa entregue para ${data.cartao.cliente.nome}!`);
    }
    if (!res.ok) alert(data.error ?? "Erro");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Buscar por nome ou email..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-white outline-none focus:border-violet-500"
      />

      {filtrados.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-12 text-center">
          <p className="text-zinc-500">Nenhum cliente ainda</p>
          <p className="mt-1 text-sm text-zinc-600">
            Os clientes aparecem aqui quando escaneiam seu QR code
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((cartao) => {
            const completo = cartao.selos >= selosParaGanhar;
            return (
              <div
                key={cartao.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">
                      {cartao.cliente.nome}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {cartao.cliente.email ?? cartao.cliente.telefone ?? "—"}
                    </p>
                  </div>
                  {completo ? (
                    <button
                      onClick={() => acaoSelo(cartao.cliente.id, "resgatar")}
                      disabled={loading === cartao.cliente.id}
                      className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {loading === cartao.cliente.id ? "..." : "✓ Resgatar"}
                    </button>
                  ) : (
                    <button
                      onClick={() => acaoSelo(cartao.cliente.id, "carimbar")}
                      disabled={loading === cartao.cliente.id}
                      className="shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
                    >
                      {loading === cartao.cliente.id ? "..." : "+ Selo"}
                    </button>
                  )}
                </div>

                {/* Selos temáticos */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Array.from({ length: selosParaGanhar }).map((_, i) => {
                    const ativo = i < cartao.selos;
                    return (
                      <div
                        key={i}
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${
                          ativo ? t.seloBg : "border border-dashed border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        {ativo && <Icone className="h-3.5 w-3.5 text-white" />}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  {completo ? (
                    <span className="font-semibold text-emerald-400">Cartão completo!</span>
                  ) : (
                    `${cartao.selos}/${selosParaGanhar} selos`
                  )}
                  {cartao.resgates > 0 && ` • ${cartao.resgates} resgate${cartao.resgates !== 1 ? "s" : ""}`}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
