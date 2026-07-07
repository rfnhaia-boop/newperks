"use client";

import { useEffect, useState, useCallback, use } from "react";
import CartaoSelos from "@/components/CartaoSelos";
import { getTema } from "@/lib/themes";
import BackgroundFidelix from "@/components/BackgroundFidelix";

type Dados = {
  nomeCliente: string;
  selos: number;
  resgates: number;
  nomeNegocio: string;
  tema: string;
  selosParaGanhar: number;
  recompensa: string;
  slug: string;
};

export default function CartaoPessoalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [dados, setDados] = useState<Dados | null>(null);
  const [estado, setEstado] = useState<"carregando" | "ok" | "naoencontrado">("carregando");
  const [mostrarCapa, setMostrarCapa] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<"cartao" | "beneficios" | "sobre">("cartao");

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
  const limite = Math.max(2, Math.ceil(dados.selosParaGanhar / 3));
  const perto = !completo && faltam <= limite;

  return (
    <div className="relative min-h-screen px-4 py-8 flex items-center justify-center overflow-hidden">
      {/* Dynamic themed background with floating 3D elements */}
      <BackgroundFidelix temaId={dados?.tema} />

      <div className="relative w-full max-w-md z-10">
        {mostrarCapa ? (
          /* Primeira Página: Capa de Boas-vindas Premium (Card Sleeve) */
          <div 
            className="relative overflow-hidden rounded-[2.5rem] p-8 border border-white/15 text-center shadow-[0_32px_64px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              backdropFilter: "blur(30px) saturate(180%)",
              WebkitBackdropFilter: "blur(30px) saturate(180%)",
            }}
          >
            {/* Glossy reflect */}
            <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white/10 border border-white/20 text-4xl mb-6 shadow-inner animate-[float_6s_ease-in-out_infinite]">
              {tema.emoji}
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-1">
              {dados.nomeNegocio}
            </p>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
              Olá, {dados.nomeCliente}! 👋
            </h1>
            <p className="mt-4 text-sm text-white/70 leading-relaxed px-2">
              Seu cartão de fidelidade digital está pronto. Junte selos a cada visita e garanta recompensas exclusivas!
            </p>

            <div className="mt-8 relative group">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-white/30 to-white/5 opacity-50 blur-lg transition duration-500 group-hover:opacity-80" />
              <button
                onClick={() => setMostrarCapa(false)}
                className="relative w-full rounded-2xl bg-white py-4 font-bold text-zinc-950 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/95 active:translate-y-0"
              >
                Acessar meu Cartão
              </button>
            </div>

            <p className="mt-8 text-[10px] text-white/35 tracking-wider font-semibold uppercase">
              powered by NewPerks
            </p>
          </div>
        ) : (
          /* Segunda Página: Hub Especializado com Tabs */
          <div className="space-y-5 animate-fade-in">
            {/* Header com mini-identidade */}
            <div className="flex items-center gap-3 pl-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
                <span className="text-2xl">{tema.emoji}</span>
              </div>
              <div>
                <h1 className="text-lg font-black text-white leading-none">{dados.nomeNegocio}</h1>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-0.5">Fidelidade VIP</p>
              </div>
            </div>

            {/* Sistema de Abas (Tabs) */}
            <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
              <button
                onClick={() => setAbaAtiva("cartao")}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                  abaAtiva === "cartao"
                    ? "bg-white text-zinc-950 shadow-md"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                💳 Meu Cartão
              </button>
              <button
                onClick={() => setAbaAtiva("beneficios")}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                  abaAtiva === "beneficios"
                    ? "bg-white text-zinc-950 shadow-md"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                🎁 Benefícios
              </button>
              <button
                onClick={() => setAbaAtiva("sobre")}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                  abaAtiva === "sobre"
                    ? "bg-white text-zinc-950 shadow-md"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                📍 Sobre nós
              </button>
            </div>

            {/* Conteúdo das Abas */}
            <div className="transition-all duration-300">
              {abaAtiva === "cartao" && (
                <div className="space-y-4 animate-slide-up">
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
                    <div 
                      className="relative overflow-hidden rounded-2xl border border-white/20 p-5 text-center shadow-xl"
                      style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        color: "#09090b"
                      }}
                    >
                      <p className="text-lg font-black">
                        🎉 Você completou o cartão!
                      </p>
                      <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">
                        Apresente esta tela no balcão para resgatar sua recompensa:
                        <strong className="text-zinc-950 font-bold block mt-1 text-sm underline decoration-yellow-500 underline-offset-4 decoration-2">
                          {dados.recompensa}
                        </strong>
                      </p>
                    </div>
                  ) : perto ? (
                    <div 
                      className="relative overflow-hidden rounded-2xl border border-white/20 p-5 text-center shadow-xl animate-pulse"
                      style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        color: "#09090b"
                      }}
                    >
                      <p className="text-lg font-black">
                        Falta{faltam === 1 ? "" : "m"} {faltam} {faltam === 1 ? "selo" : "selos"}! 🔥
                      </p>
                      <p className="mt-1 text-xs text-zinc-600 leading-relaxed">
                        Você está quase ganhando sua recompensa: <strong className="text-zinc-950 font-bold">{dados.recompensa}</strong>
                      </p>
                    </div>
                  ) : (
                    <div 
                      className="relative overflow-hidden rounded-2xl border border-white/10 p-4 text-center text-xs text-white/80 leading-relaxed backdrop-blur-md"
                      style={{
                        background: "rgba(255, 255, 255, 0.04)"
                      }}
                    >
                      <span className="inline-block mr-1">✨</span> Mostre esta tela para o atendente carimbar seu selo na sua próxima compra.
                    </div>
                  )}

                  <button
                    onClick={carregar}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/10 py-3.5 text-xs font-bold text-white tracking-wide border border-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white/15 hover:border-white/20 active:scale-98"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    <span>Atualizar Cartão</span>
                  </button>
                </div>
              )}

              {abaAtiva === "beneficios" && (
                <div 
                  className="rounded-3xl border border-white/10 p-6 space-y-5 animate-slide-up"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                  }}
                >
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Histórico de Lealdade</h3>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="rounded-2xl bg-white/5 border border-white/5 p-3.5 text-center">
                        <p className="text-[10px] font-bold text-white/50 uppercase">Carimbos dados</p>
                        <p className="text-2xl font-black text-white mt-1">{dados.selos}</p>
                      </div>
                      <div className="rounded-2xl bg-white/5 border border-white/5 p-3.5 text-center">
                        <p className="text-[10px] font-bold text-white/50 uppercase">Resgates Feitos</p>
                        <p className="text-2xl font-black text-white mt-1">{dados.resgates}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Como funciona</h3>
                    <div className="space-y-2.5 text-xs text-white/70">
                      <div className="flex gap-2">
                        <span className="text-amber-400">1.</span>
                        <p>Consuma no estabelecimento e solicite o carimbo no seu celular.</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-amber-400">2.</span>
                        <p>Junte {dados.selosParaGanhar} selos para completar o cartão de fidelidade.</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-amber-400">3.</span>
                        <p>Apresente o cartão completo no balcão e ganhe: <strong className="text-white font-semibold">{dados.recompensa}</strong>.</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Regras de Lealdade</h3>
                    <ul className="space-y-1.5 text-xs text-white/60 list-disc list-inside">
                      <li>Uso individual e intransferível</li>
                      <li>Selos acumuláveis em qualquer compra</li>
                      <li>Sujeito às regras e disponibilidade do parceiro</li>
                    </ul>
                  </div>
                </div>
              )}

              {abaAtiva === "sobre" && (
                <div 
                  className="rounded-3xl border border-white/10 p-6 space-y-5 animate-slide-up"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                  }}
                >
                  <div className="text-center pb-2 border-b border-white/10">
                    <span className="text-4xl">{tema.emoji}</span>
                    <h3 className="text-lg font-black text-white mt-2">{dados.nomeNegocio}</h3>
                    <p className="text-xs text-white/60">Programa de fidelidade digital</p>
                  </div>

                  <div className="space-y-4 text-xs text-white/80">
                    <div className="flex items-center gap-3">
                      <span className="text-lg flex-shrink-0">🎁</span>
                      <div>
                        <p className="font-bold text-white">Sua recompensa</p>
                        <p className="text-white/60 mt-0.5">{dados.recompensa}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-lg flex-shrink-0">{tema.emoji}</span>
                      <div>
                        <p className="font-bold text-white">Como ganhar</p>
                        <p className="text-white/60 mt-0.5">
                          Junte {dados.selosParaGanhar} selos — um a cada visita — e resgate no balcão.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-lg flex-shrink-0">🔗</span>
                      <div>
                        <p className="font-bold text-white">Seu acesso</p>
                        <p className="text-white/60 mt-0.5">
                          Este link é pessoal — salve nos favoritos ou guarde o email de boas-vindas.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 text-center">
                    <a
                      href={`/c/${dados.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs text-violet-400 font-bold hover:underline"
                    >
                      <span>Cadastrar outra pessoa</span>
                      <span>→</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-8 text-center text-xs text-white/30 tracking-wider font-semibold uppercase">
              powered by NewPerks
            </p>
          </div>
        )}
      </div>

      {/* Slide and Fade transitions styles */}
      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
