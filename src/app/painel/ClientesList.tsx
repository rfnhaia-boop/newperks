"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTema } from "@/lib/themes";
import { toast } from "@/components/Toaster";
import { Gift, Search, UsersRound } from "lucide-react";

type Carimbo = {
  id: string;
  descricao: string | null;
  valor: number | null;
  createdAt: Date | string;
};

type Cartao = {
  id: string;
  selos: number;
  resgates: number;
  updatedAt: Date | string;
  carimbos: Carimbo[];
  feedback?: { nota: number; comentario: string | null; createdAt: Date | string } | null;
  campanhaOrigem?: { titulo: string } | null;
  indicador?: { cliente: { nome: string } } | null;
  cliente: { id: string; nome: string; telefone: string | null; email: string | null };
};

function iniciais(nome: string) {
  return nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dataRelativa(iso: Date | string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

type FiltroKey = "todos" | "prontos" | "juntando" | "novos" | "sumidos";

const FILTROS: { key: FiltroKey; label: string; ativo: string }[] = [
  { key: "todos", label: "Todos", ativo: "border-white/40 bg-white/15 text-white" },
  { key: "prontos", label: "🎁 Prontos", ativo: "border-emerald-500/50 bg-emerald-500/20 text-emerald-300" },
  { key: "juntando", label: "⏳ Juntando", ativo: "border-cyan-500/50 bg-cyan-500/20 text-cyan-300" },
  { key: "novos", label: "✨ Novos", ativo: "border-violet-500/50 bg-violet-500/20 text-violet-300" },
  { key: "sumidos", label: "😴 Sumidos", ativo: "border-amber-500/50 bg-amber-500/20 text-amber-300" },
];

const DIAS_SUMIDO = 30;

function diasSemVisita(cartao: Cartao) {
  return Math.floor((Date.now() - new Date(cartao.updatedAt).getTime()) / 86400000);
}

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
  const [filtro, setFiltro] = useState<FiltroKey>("todos");
  const [loading, setLoading] = useState<string | null>(null);
  const [aberto, setAberto] = useState<string | null>(null); // clienteId do popup
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [historicoCompleto, setHistoricoCompleto] = useState(false);

  const t = getTema(tema);
  const { Icone } = t;

  function statusDe(cartao: Cartao): Exclude<FiltroKey, "todos"> {
    if (cartao.selos >= selosParaGanhar) return "prontos";
    if (diasSemVisita(cartao) >= DIAS_SUMIDO) return "sumidos";
    if (cartao.selos === 0) return "novos";
    return "juntando";
  }

  const filtrados = cartoes.filter((c) => {
    const q = busca.toLowerCase();
    const bateBusca =
      c.cliente.nome.toLowerCase().includes(q) ||
      (c.cliente.email ?? "").toLowerCase().includes(q) ||
      (c.cliente.telefone ?? "").includes(busca);
    const bateFiltro = filtro === "todos" || statusDe(c) === filtro;
    return bateBusca && bateFiltro;
  });

  // Prontos primeiro, depois mais ativos
  const ordenados = [...filtrados].sort((a, b) => {
    const pa = statusDe(a) === "prontos" ? 0 : 1;
    const pb = statusDe(b) === "prontos" ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const contagem: Record<FiltroKey, number> = {
    todos: cartoes.length,
    prontos: 0,
    juntando: 0,
    novos: 0,
    sumidos: 0,
  };
  for (const c of cartoes) contagem[statusDe(c)]++;

  const cartaoAberto = aberto ? cartoes.find((c) => c.cliente.id === aberto) ?? null : null;

  // Popup aberto: ESC fecha e o scroll da página trava
  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(null);
    window.addEventListener("keydown", esc);
    const scrollAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = scrollAnterior;
    };
  }, [aberto]);

  function abrirPopup(clienteId: string) {
    setAberto(clienteId);
    setDescricao("");
    setValor("");
    setHistoricoCompleto(false);
  }

  async function chamarApi(clienteId: string, body: Record<string, unknown>) {
    setLoading(clienteId);
    try {
      const res = await fetch("/api/selos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId, ...body }),
      });
      const data = await res.json().catch(() => ({}));
      return { res, data };
    } catch {
      return { res: { ok: false } as Response, data: { error: "Erro de conexão. Tente de novo." } };
    } finally {
      setLoading(null);
    }
  }

  async function carimbar(clienteId: string) {
    const { res, data } = await chamarApi(clienteId, {
      acao: "carimbar",
      descricao: descricao || undefined,
      valor: valor || undefined,
    });
    if (res.ok && data.completou) {
      toast(`${data.cartao.cliente.nome} completou o cartão! Recompensa: ${data.recompensa}`, "festa");
    } else if (res.ok) {
      toast(`Selo registrado para ${data.cartao.cliente.nome}`, "sucesso");
    } else {
      toast(data.error ?? "Erro ao carimbar", "erro");
    }
    setDescricao("");
    setValor("");
    router.refresh();
  }

  async function resgatar(clienteId: string) {
    const { res, data } = await chamarApi(clienteId, { acao: "resgatar" });
    if (res.ok && data.resgatou) toast(`Recompensa entregue para ${data.cartao.cliente.nome}!`, "sucesso");
    if (!res.ok) toast(data.error ?? "Erro ao resgatar", "erro");
    router.refresh();
  }

  async function desfazer(clienteId: string) {
    const { res, data } = await chamarApi(clienteId, { acao: "desfazer" });
    if (res.ok) toast(`Último selo de ${data.cartao.cliente.nome} desfeito`, "sucesso");
    else toast(data.error ?? "Erro ao desfazer", "erro");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3.5 backdrop-blur-md">
          <UsersRound className="h-4 w-4 text-violet-300" />
          <p className="mt-3 text-2xl font-black tracking-tight text-white">{contagem.juntando + contagem.novos}</p>
          <p className="text-xs font-medium text-zinc-400">Clientes em movimento</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3.5 backdrop-blur-md">
          <Gift className="h-4 w-4 text-emerald-300" />
          <p className="mt-3 text-2xl font-black tracking-tight text-white">{contagem.prontos}</p>
          <p className="text-xs font-medium text-zinc-400">Prêmios para entregar</p>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar cliente, email ou telefone"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none backdrop-blur-md transition focus:border-violet-500/60 focus:bg-white/[0.08] placeholder-zinc-500"
        />
      </div>

      {/* Chips de filtro */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => {
          const ativo = filtro === f.key;
          const n = contagem[f.key];
          if (f.key !== "todos" && n === 0) return null;
          return (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                ativo ? f.ativo : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              }`}
            >
              {f.label} <span className="opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      {ordenados.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 px-6 py-12 text-center">
          <p className="text-3xl">{cartoes.length === 0 ? "👋" : "🔎"}</p>
          <p className="mt-3 font-semibold text-zinc-400">
            {cartoes.length === 0 ? "Nenhum cliente ainda" : "Nenhum cliente nesse filtro"}
          </p>
          {cartoes.length === 0 && (
            <p className="mt-1 text-sm text-zinc-600">Os clientes aparecem aqui quando escaneiam seu QR code</p>
          )}
        </div>
      ) : (
        /* Lista otimizada para leitura rápida no celular */
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {ordenados.map((cartao) => {
            const status = statusDe(cartao);
            const pct = Math.min((cartao.selos / selosParaGanhar) * 100, 100);
            const borda =
              status === "prontos"
                ? "border-emerald-500/50 hover:border-emerald-400"
                : status === "sumidos"
                  ? "border-amber-500/40 hover:border-amber-400/70"
                  : "border-white/10 hover:border-white/25";
            return (
              <button
                key={cartao.id}
                onClick={() => abrirPopup(cartao.cliente.id)}
                className={`group flex items-center gap-3 rounded-2xl border ${borda} p-3.5 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.07]`}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                }}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${t.seloBg}`}
                >
                  {iniciais(cartao.cliente.nome)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-white">{cartao.cliente.nome}</p>
                    <span className={`shrink-0 text-[11px] font-bold ${status === "prontos" ? "text-emerald-400" : status === "sumidos" ? "text-amber-400" : "text-zinc-500"}`}>
                      {status === "prontos" ? "Pronto" : status === "sumidos" ? `${diasSemVisita(cartao)}d sem vir` : `${cartao.selos}/${selosParaGanhar}`}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div className={`h-full rounded-full transition-all duration-500 ${status === "prontos" ? "bg-emerald-500" : t.seloBg}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-zinc-500">{status === "prontos" ? "Recompensa disponível para resgate" : status === "sumidos" ? "Vale chamar de volta" : `${selosParaGanhar - cartao.selos} selo${selosParaGanhar - cartao.selos !== 1 ? "s" : ""} para a recompensa`}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Popup do cliente */}
      {cartaoAberto && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
          onClick={() => setAberto(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-3xl border border-white/15 shadow-2xl animate-[popIn_0.2s_cubic-bezier(0.16,1,0.3,1)]"
            style={{
              background: "rgba(24, 24, 27, 0.92)",
              backdropFilter: "blur(30px) saturate(160%)",
              WebkitBackdropFilter: "blur(30px) saturate(160%)",
            }}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <div className="max-h-[85vh] overflow-y-auto p-5">
              {(() => {
                const cartao = cartaoAberto;
                const status = statusDe(cartao);
                const completo = cartao.selos >= selosParaGanhar;
                const carimbos = historicoCompleto ? cartao.carimbos : cartao.carimbos.slice(0, 2);

                return (
                  <>
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${t.seloBg}`}
                      >
                        {iniciais(cartao.cliente.nome)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-white">{cartao.cliente.nome}</p>
                        <p className="truncate text-xs text-zinc-500">
                          {cartao.cliente.email ?? cartao.cliente.telefone ?? "—"}
                        </p>
                      </div>
                      <button
                        onClick={() => setAberto(null)}
                        aria-label="Fechar"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-zinc-400 transition hover:bg-white/20 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Sumido — chamar de volta */}
                    {!completo && status === "sumidos" && (
                      <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                        <span className="text-xs font-medium text-amber-300">
                          😴 {diasSemVisita(cartao)} dias sem visitar
                        </span>
                        {cartao.cliente.telefone && (
                          <a
                            href={`https://wa.me/55${cartao.cliente.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(
                              `Oi ${cartao.cliente.nome.split(" ")[0]}! Sentimos sua falta 😊 Seu cartão fidelidade já tem ${cartao.selos} selo${cartao.selos !== 1 ? "s" : ""} — passa aqui pra continuar juntando!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 rounded-lg bg-emerald-600/80 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-500"
                          >
                            Chamar no WhatsApp
                          </a>
                        )}
                      </div>
                    )}

                    {/* Selinhos */}
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {Array.from({ length: selosParaGanhar }).map((_, i) => {
                        const carimbado = i < cartao.selos;
                        return (
                          <div
                            key={i}
                            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                              carimbado
                                ? `${t.seloBg} border-transparent text-white shadow-md`
                                : "border-white/10 bg-white/5 text-zinc-600"
                            }`}
                          >
                            <Icone className="h-4 w-4" />
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2.5 text-center text-xs text-zinc-500">
                      {completo ? (
                        <span className="font-semibold text-emerald-400">Cartão completo! 🎉</span>
                      ) : (
                        `${cartao.selos} de ${selosParaGanhar} selos`
                      )}
                      {cartao.resgates > 0 && ` · ${cartao.resgates} resgate${cartao.resgates !== 1 ? "s" : ""}`}
                    </p>
                    <div className="mt-4 grid gap-2 text-xs">
                      {cartao.campanhaOrigem && <p className="rounded-lg bg-sky-400/10 px-3 py-2 text-sky-200">Chegou pela campanha: <b>{cartao.campanhaOrigem.titulo}</b></p>}
                      {cartao.indicador && <p className="rounded-lg bg-[#e9ff65]/10 px-3 py-2 text-[#e9ff65]">Indicado por: <b>{cartao.indicador.cliente.nome}</b></p>}
                      {cartao.feedback && <p className="rounded-lg bg-amber-300/10 px-3 py-2 text-amber-100">Feedback: <b>{cartao.feedback.nota} ★</b>{cartao.feedback.comentario ? ` · ${cartao.feedback.comentario}` : ""}</p>}
                    </div>

                    {/* Ação */}
                    {completo ? (
                      <button
                        onClick={() => resgatar(cartao.cliente.id)}
                        disabled={loading === cartao.cliente.id}
                        className="mt-4 w-full rounded-2xl bg-emerald-600 py-3.5 font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                      >
                        {loading === cartao.cliente.id ? "..." : "🎁 Entregar recompensa"}
                      </button>
                    ) : (
                      <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs font-medium text-zinc-400">O que o cliente pediu? (opcional)</p>
                        <input
                          type="text"
                          placeholder="Ex: 2 cafés + brownie"
                          value={descricao}
                          onChange={(e) => setDescricao(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder-zinc-600 focus:border-violet-500/60"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Valor (R$)"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                            className="w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder-zinc-600 focus:border-violet-500/60"
                          />
                          <button
                            onClick={() => carimbar(cartao.cliente.id)}
                            disabled={loading === cartao.cliente.id}
                            className="flex-1 rounded-lg bg-violet-600 py-2 text-sm font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
                          >
                            {loading === cartao.cliente.id ? "Salvando..." : "+ Dar selo"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Histórico */}
                    {cartao.carimbos.length > 0 && (
                      <div className="mt-4 space-y-1">
                        {carimbos.map((c) => (
                          <div key={c.id} className="flex items-center gap-2 py-1 text-xs">
                            <Icone className="h-3 w-3 shrink-0 text-zinc-500" />
                            <span className="flex-1 truncate text-zinc-400">
                              {c.descricao ?? <span className="italic text-zinc-600">sem descrição</span>}
                            </span>
                            {c.valor && <span className="shrink-0 text-zinc-400">{moeda(c.valor)}</span>}
                            <span className="shrink-0 text-zinc-600">{dataRelativa(c.createdAt)}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-4 pt-1">
                          {cartao.carimbos.length > 2 && (
                            <button
                              onClick={() => setHistoricoCompleto(!historicoCompleto)}
                              className="text-xs text-zinc-600 transition hover:text-zinc-400"
                            >
                              {historicoCompleto ? "▲ menos" : `▼ ver os ${cartao.carimbos.length} carimbos`}
                            </button>
                          )}
                          {cartao.selos > 0 && (
                            <button
                              onClick={() => desfazer(cartao.cliente.id)}
                              disabled={loading === cartao.cliente.id}
                              className="ml-auto text-xs text-zinc-600 transition hover:text-amber-400 disabled:opacity-50"
                              title="Desfaz o último selo (erro de operação)"
                            >
                              ↩ Desfazer último selo
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
