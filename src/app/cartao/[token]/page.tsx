"use client";

import { useEffect, useState, useCallback, useRef, use } from "react";
import CartaoSelos from "@/components/CartaoSelos";
import { getTema } from "@/lib/themes";
import BackgroundFidelix from "@/components/BackgroundFidelix";
import Confete from "@/components/Confete";
import TiltCard from "@/components/TiltCard";
import FeedbackForm from "./FeedbackForm";

type Dados = {
  nomeCliente: string;
  selos: number;
  resgates: number;
  nomeNegocio: string;
  tema: string;
  selosParaGanhar: number;
  recompensa: string;
  ofertaPrimeiraVisita: string | null;
  recompensaEstoque: number | null;
  recompensaValidaAte: string | null;
  recompensaRegras: string | null;
  slug: string;
  whatsapp: string | null;
  instagram: string | null;
  site: string | null;
  linksExtra: { titulo: string, url: string }[] | null;
  regras: string | null;
  horario: string | null;
  endereco: string | null;
  linkIndicacao: string;
  feedbackEnviado: boolean;
};

export default function CartaoPessoalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [dados, setDados] = useState<Dados | null>(null);
  const [estado, setEstado] = useState<"carregando" | "ok" | "naoencontrado">("carregando");
  const jaVisitou = typeof window !== "undefined" && localStorage.getItem(`newperks:visited:${token}`);
  const [mostrarCapa, setMostrarCapa] = useState(!jaVisitou);
  const [abaAtiva, setAbaAtiva] = useState<"cartao" | "beneficios" | "sobre">("cartao");
  const [celebrar, setCelebrar] = useState(false);
  const [resgatado, setResgatado] = useState(false);
  const selosAnteriores = useRef<number | null>(null);
  const resgatesAnteriores = useRef<number | null>(null);

  const carregar = useCallback(async () => {
    const res = await fetch(`/api/cartao/${token}`);
    if (!res.ok) {
      setEstado("naoencontrado");
      return;
    }
    const d: Dados = await res.json();
    setDados(d);
    setEstado("ok");

    // Celebra ao vivo: selo novo vibra; completar o cartão solta confete
    const antes = selosAnteriores.current;
    selosAnteriores.current = d.selos;
    if (antes !== null && d.selos > antes) {
      if (d.selos >= d.selosParaGanhar) {
        setCelebrar(true);
        navigator.vibrate?.([100, 60, 100, 60, 250]);
        setTimeout(() => setCelebrar(false), 5000);
      } else {
        navigator.vibrate?.(60);
      }
    }

    // Resgate ao vivo: recompensa entregue → cartão renovado
    const resgAntes = resgatesAnteriores.current;
    resgatesAnteriores.current = d.resgates;
    if (resgAntes !== null && d.resgates > resgAntes) {
      setResgatado(true);
      navigator.vibrate?.([80, 50, 80]);
      setTimeout(() => setResgatado(false), 8000);
    }
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Atualiza ao vivo a cada 8s — pausa quando aba perde foco (economiza bateria)
  useEffect(() => {
    if (estado !== "ok") return;
    let id: ReturnType<typeof setInterval> | null = null;
    function iniciar() { if (!id) id = setInterval(carregar, 8000); }
    function parar() { if (id) { clearInterval(id); id = null; } }
    function onVis() { document.hidden ? parar() : iniciar(); }
    iniciar();
    document.addEventListener("visibilitychange", onVis);
    return () => { parar(); document.removeEventListener("visibilitychange", onVis); };
  }, [estado, carregar]);

  const tema = getTema(dados?.tema);

  async function indicarAmigo() {
    if (!dados) return;
    const texto = `Eu junto vantagens na ${dados.nomeNegocio}. Crie seu cartão pelo meu convite: ${dados.linkIndicacao}`;
    if (navigator.share) { await navigator.share({ title: `Vantagens na ${dados.nomeNegocio}`, text: texto, url: dados.linkIndicacao }); return; }
    await navigator.clipboard.writeText(texto);
    alert("Link de convite copiado!");
  }

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
  const recompensaExpirada = Boolean(dados.recompensaValidaAte && new Date(dados.recompensaValidaAte) < new Date());

  return (
    <div className="relative min-h-screen px-4 py-8 flex items-center justify-center overflow-hidden">
      {/* Dynamic themed background with floating 3D elements */}
      <BackgroundFidelix temaId={dados?.tema} />
      {celebrar && <Confete />}

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
                onClick={() => { setMostrarCapa(false); localStorage.setItem(`newperks:visited:${token}`, "1"); }}
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
            <div className="flex items-center justify-between gap-3 pl-2">
              <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
                <span className="text-2xl">{tema.emoji}</span>
              </div>
              <div>
                <h1 className="text-lg font-black text-white leading-none">{dados.nomeNegocio}</h1>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-0.5">Fidelidade VIP</p>
              </div>
              </div>
              <a href="/carteira" className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-black text-white/80 transition hover:bg-white hover:text-zinc-950">Meus cartões</a>
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
                  {resgatado && (
                    <div
                      className="rounded-2xl border border-emerald-400/40 bg-emerald-500/15 p-4 text-center backdrop-blur-md animate-slide-up"
                    >
                      <p className="text-base font-black text-emerald-300">🎁 Prêmio resgatado!</p>
                      <p className="mt-1 text-xs text-emerald-100/80">
                        Aproveite! Seu cartão foi renovado — já pode começar a juntar selos de novo.
                      </p>
                    </div>
                  )}
                  <div className="animate-[cardFloat_6s_ease-in-out_infinite]" style={{ perspective: "1200px" }}>
                    <TiltCard>
                      <CartaoSelos
                        tema={dados.tema}
                        nomeNegocio={dados.nomeNegocio}
                        nomeCliente={dados.nomeCliente}
                        selos={dados.selos}
                        selosParaGanhar={dados.selosParaGanhar}
                        recompensa={dados.recompensa}
                        resgates={dados.resgates}
                      />
                    </TiltCard>
                  </div>

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

                  {dados.ofertaPrimeiraVisita && <div className="rounded-2xl border border-[#e9ff65]/30 bg-[#e9ff65]/[.09] p-4"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#e9ff65]">Sua vantagem de primeira visita</p><p className="mt-1.5 text-sm font-black text-white">{dados.ofertaPrimeiraVisita}</p><p className="mt-1 text-xs leading-5 text-white/65">Mostre este cartão antes de receber seu primeiro selo no balcão.</p></div>}

                  {(dados.recompensaValidaAte || dados.recompensaEstoque !== null || dados.recompensaRegras) && (
                    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[.07] p-4 text-xs text-white/75">
                      <p className="font-black uppercase tracking-wider text-amber-200">Condições da recompensa</p>
                      <div className="mt-2 space-y-1.5 leading-5">
                        {dados.recompensaValidaAte && <p>{recompensaExpirada ? "Esta recompensa está sendo atualizada pelo estabelecimento." : `Válida até ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(dados.recompensaValidaAte))}.`}</p>}
                        {dados.recompensaEstoque !== null && !recompensaExpirada && <p>{dados.recompensaEstoque > 0 ? `${dados.recompensaEstoque} ${dados.recompensaEstoque === 1 ? "disponível" : "disponíveis"} no momento.` : "Indisponível no momento — fale com o estabelecimento."}</p>}
                        {dados.recompensaRegras && <p>{dados.recompensaRegras}</p>}
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-[#e9ff65]/25 bg-[#e9ff65]/[.08] p-4">
                    <p className="text-sm font-black text-[#e9ff65]">Indique e ganhe 1 selo</p>
                    <p className="mt-1 text-xs leading-5 text-white/70">Seu selo bônus entra quando seu amigo fizer a primeira visita. Assim a vantagem vale para quem realmente chega.</p>
                    <button onClick={indicarAmigo} className="mt-3 w-full rounded-xl bg-[#e9ff65] py-3 text-sm font-black text-zinc-950 transition hover:bg-[#f3ff9d]">Convidar um amigo →</button>
                  </div>

                  <FeedbackForm token={token} nomeNegocio={dados.nomeNegocio} jaEnviado={dados.feedbackEnviado} />

                  <div className="border-t border-white/10 pt-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Regras de Lealdade</h3>
                    <ul className="space-y-1.5 text-xs text-white/60 list-disc list-inside">
                      {dados.regras ? (
                        dados.regras
                          .split("\n")
                          .map((r) => r.trim())
                          .filter(Boolean)
                          .map((r, i) => <li key={i}>{r}</li>)
                      ) : (
                        <>
                          <li>Uso individual e intransferível</li>
                          <li>Selos acumuláveis em qualquer compra</li>
                          <li>Sujeito às regras e disponibilidade do parceiro</li>
                        </>
                      )}
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

                    {dados.horario && (
                      <div className="flex items-center gap-3">
                        <span className="text-lg flex-shrink-0">⏰</span>
                        <div>
                          <p className="font-bold text-white">Horário de atendimento</p>
                          <p className="text-white/60 mt-0.5">{dados.horario}</p>
                        </div>
                      </div>
                    )}

                    {dados.endereco && (
                      <div className="flex items-center gap-3">
                        <span className="text-lg flex-shrink-0">📍</span>
                        <div>
                          <p className="font-bold text-white">Endereço</p>
                          <p className="text-white/60 mt-0.5">{dados.endereco}</p>
                        </div>
                      </div>
                    )}

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

                  <div className="space-y-3 pt-2">
                    {dados.whatsapp && (
                      <a
                        href={`https://wa.me/${dados.whatsapp.length <= 11 ? "55" + dados.whatsapp : dados.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-emerald-500/40 active:translate-y-0"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4l.9 2.1c.1.2.1.4 0 .5l-.4.6-.5.5c-.1.1-.2.3-.1.5.1.2.6 1 1.3 1.7.9.8 1.7 1.1 2 1.2.2.1.4.1.5-.1l.7-.9c.2-.2.3-.2.6-.1l2 .9c.3.1.4.2.5.4 0 .1 0 .7-.2 1.2z" />
                        </svg>
                        <span>Chamar no WhatsApp</span>
                      </a>
                    )}
                    {dados.instagram && (
                      <a
                        href={`https://instagram.com/${dados.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 py-3.5 font-bold text-white shadow-lg shadow-pink-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-pink-500/40 active:translate-y-0"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                        <span>Seguir no Instagram</span>
                      </a>
                    )}
                    {dados.site && (
                      <a
                        href={dados.site.startsWith('http') ? dados.site : `https://${dados.site}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 py-3.5 font-bold text-white backdrop-blur-md shadow-lg border border-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                        <span>Acessar Site</span>
                      </a>
                    )}
                    {Array.isArray(dados.linksExtra) && dados.linksExtra.map((link, i) => (
                      <a
                        key={i}
                        href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/5 py-3.5 font-bold text-white/90 backdrop-blur-md border border-white/5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15 hover:text-white active:translate-y-0"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        <span>{link.titulo}</span>
                      </a>
                    ))}
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
