"use client";

import { useState } from "react";
import CartaoSelos from "@/components/CartaoSelos";
import Confete from "@/components/Confete";
import BackgroundFidelix from "@/components/BackgroundFidelix";
import TiltCard from "@/components/TiltCard";
import { LISTA_TEMAS } from "@/lib/themes";

const NEGOCIOS: Record<string, string> = {
  cafe: "Café Aroma",
  barbearia: "Barbearia do Zé",
  dentista: "Sorriso Clínica",
  pizzaria: "Pizzaria Bella",
  sorveteria: "Gelato Mania",
  beleza: "Studio Glam",
  petshop: "PetLove",
  generico: "Sua Loja",
};

const RECOMPENSAS: Record<string, string> = {
  cafe: "1 café grátis",
  barbearia: "1 corte grátis",
  dentista: "1 limpeza grátis",
  pizzaria: "1 pizza média grátis",
  sorveteria: "1 sorvete grátis",
  beleza: "1 escova grátis",
  petshop: "1 banho grátis",
  generico: "1 prêmio grátis",
};

const META = 10;

export default function DemoPage() {
  const [tema, setTema] = useState("cafe");
  const [selos, setSelos] = useState(6);
  const [resgates, setResgates] = useState(0);
  const [celebrar, setCelebrar] = useState(false);

  const completo = selos >= META;

  function carimbar() {
    if (completo) return;
    const novo = selos + 1;
    setSelos(novo);
    navigator.vibrate?.(60);
    if (novo >= META) {
      setCelebrar(true);
      navigator.vibrate?.([100, 60, 100, 60, 250]);
      setTimeout(() => setCelebrar(false), 5000);
    }
  }

  function resgatar() {
    setSelos(0);
    setResgates((r) => r + 1);
  }

  return (
    <div className="relative min-h-screen px-4 py-10 flex items-center justify-center overflow-hidden">
      <BackgroundFidelix temaId={tema} />
      {celebrar && <Confete />}

      <div className="relative z-10 w-full max-w-md space-y-5">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
            NewPerks — demonstração
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-white">
            Experimente o cartão fidelidade
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Carimbe até completar e veja o que seu cliente sente 👇
          </p>
        </div>

        {/* Seletor de tema */}
        <div className="flex flex-wrap justify-center gap-2">
          {LISTA_TEMAS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTema(t.id)}
              className={`rounded-full border px-3 py-1.5 text-lg transition ${
                tema === t.id
                  ? "border-white/60 bg-white/15 scale-110"
                  : "border-white/10 bg-white/5 opacity-60 hover:opacity-100"
              }`}
              title={t.nome}
            >
              {t.emoji}
            </button>
          ))}
        </div>

        <div className="animate-[cardFloat_6s_ease-in-out_infinite]" style={{ perspective: "1200px" }}>
          <TiltCard>
            <CartaoSelos
              tema={tema}
              nomeNegocio={NEGOCIOS[tema] ?? "Sua Loja"}
              nomeCliente="Você"
              selos={selos}
              selosParaGanhar={META}
              recompensa={RECOMPENSAS[tema] ?? "1 prêmio grátis"}
              resgates={resgates}
            />
          </TiltCard>
        </div>

        {completo ? (
          <button
            onClick={resgatar}
            className="w-full rounded-2xl bg-emerald-600 py-4 font-bold text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 active:translate-y-0"
          >
            🎁 Resgatar recompensa (cartão renova)
          </button>
        ) : (
          <button
            onClick={carimbar}
            className="w-full rounded-2xl bg-white py-4 font-bold text-zinc-950 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/95 active:translate-y-0"
          >
            ☝️ Simular uma compra (+1 selo)
          </button>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-md">
          <p className="text-sm text-white/80">
            Gostou? Seus clientes ganham isso escaneando um QR code no seu balcão —{" "}
            <strong className="text-white">sem baixar app</strong>.
          </p>
          <a
            href="/registro"
            className="mt-3 inline-block rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500"
          >
            Criar minha conta grátis →
          </a>
        </div>
      </div>
    </div>
  );
}
