"use client";

import { useEffect, useState, useCallback, use } from "react";
import CartaoSelos from "@/components/CartaoSelos";
import { getTema } from "@/lib/themes";

type Dados = {
  nomeCliente: string;
  selos: number;
  resgates: number;
  nomeNegocio: string;
  tema: string;
  selosParaGanhar: number;
  recompensa: string;
};

export default function CartaoPessoalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [dados, setDados] = useState<Dados | null>(null);
  const [estado, setEstado] = useState<"carregando" | "ok" | "naoencontrado">("carregando");

  const carregar = useCallback(async () => {
    const res = await fetch(`/api/cartao/${token}`);
    if (!res.ok) {
      setEstado("naoencontrado");
      return;
    }
    setDados(await res.json());
    setEstado("ok");
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Atualiza ao vivo a cada 8s (vê o selo entrar na hora)
  useEffect(() => {
    if (estado !== "ok") return;
    const id = setInterval(carregar, 8000);
    return () => clearInterval(id);
  }, [estado, carregar]);

  const tema = getTema(dados?.tema);

  if (estado === "carregando") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
      </div>
    );
  }

  if (estado === "naoencontrado" || !dados) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-zinc-950 p-6 text-center">
        <span className="text-5xl">🔍</span>
        <h1 className="text-xl font-bold text-white">Cartão não encontrado</h1>
        <p className="text-zinc-400">Esse link não está mais ativo.</p>
      </div>
    );
  }

  const completo = dados.selos >= dados.selosParaGanhar;
  const faltam = dados.selosParaGanhar - dados.selos;
  // "perto" = faltam até 1/3 da meta (mínimo 2)
  const limite = Math.max(2, Math.ceil(dados.selosParaGanhar / 3));
  const perto = !completo && faltam <= limite;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${tema.gradiente} bg-fixed px-4 py-8`}>
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="text-5xl drop-shadow-lg">{tema.emoji}</span>
          <h1 className="mt-2 text-2xl font-bold text-white drop-shadow">
            {dados.nomeNegocio}
          </h1>
        </div>

        <div className="space-y-4">
          <CartaoSelos
            tema={dados.tema}
            nomeNegocio={dados.nomeNegocio}
            nomeCliente={dados.nomeCliente}
            selos={dados.selos}
            selosParaGanhar={dados.selosParaGanhar}
            recompensa={dados.recompensa}
            resgates={dados.resgates}
          />

          {completo ? (
            <div className="rounded-2xl bg-white p-4 text-center shadow-lg">
              <p className="text-lg font-extrabold text-zinc-900">
                🎉 Você completou o cartão!
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                Mostre esta tela ao atendente para resgatar:{" "}
                <strong>{dados.recompensa}</strong>
              </p>
            </div>
          ) : perto ? (
            <div className="animate-pulse rounded-2xl bg-white p-4 text-center shadow-lg">
              <p className="text-lg font-extrabold text-zinc-900">
                Falta{faltam === 1 ? "" : "m"} {faltam} {faltam === 1 ? "selo" : "selos"}! 🔥
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                Você está quase ganhando: <strong>{dados.recompensa}</strong>
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/10 p-4 text-center text-sm text-white/80 backdrop-blur-md ring-1 ring-white/20">
              A cada compra, mostre esta tela para o atendente carimbar seu selo ✨
            </div>
          )}

          <button
            onClick={carregar}
            className="w-full rounded-xl bg-white/10 py-2.5 text-sm font-medium text-white/80 backdrop-blur-md ring-1 ring-white/20 transition hover:bg-white/20"
          >
            ↻ Atualizar
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-white/40">powered by NewPerks</p>
      </div>
    </div>
  );
}
