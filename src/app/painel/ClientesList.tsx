"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getTema } from "@/lib/themes";
import { toast } from "@/components/Toaster";

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

type SecaoKey = "prontos" | "juntando" | "novos";

const SECOES: Record<SecaoKey, { label: string; emoji: string; cor: string }> = {
  prontos: { label: "Prontos pra resgatar", emoji: "🎁", cor: "text-emerald-400" },
  juntando: { label: "Juntando selos", emoji: "⏳", cor: "text-cyan-400" },
  novos: { label: "Novos", emoji: "✨", cor: "text-violet-400" },
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
  const [formAberto, setFormAberto] = useState<string | null>(null);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [historicoAberto, setHistoricoAberto] = useState<string | null>(null);
  const [fechadas, setFechadas] = useState<Set<SecaoKey>>(new Set());

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

  function statusDe(cartao: Cartao): SecaoKey {
    if (cartao.selos >= selosParaGanhar) return "prontos";
    if (cartao.selos === 0) return "novos";
    return "juntando";
  }

  const grupos: Record<SecaoKey, Cartao[]> = { prontos: [], juntando: [], novos: [] };
  for (const c of filtrados) grupos[statusDe(c)].push(c);

  function toggleSecao(key: SecaoKey) {
    setFechadas((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function abrirForm(clienteId: string) {
    setFormAberto(clienteId);
    setDescricao("");
    setValor("");
  }

  async function confirmarSelo(clienteId: string) {
    setLoading(clienteId);
    const res = await fetch("/api/selos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clienteId,
        acao: "carimbar",
        descricao: descricao || undefined,
        valor: valor || undefined,
      }),
    });
    const data = await res.json();
    setLoading(null);
    setFormAberto(null);
    setDescricao("");
    setValor("");
    if (res.ok && data.completou) {
      toast(`${data.cartao.cliente.nome} completou o cartão! Recompensa: ${data.recompensa}`, "festa");
    } else if (res.ok) {
      toast(`Selo registrado para ${data.cartao.cliente.nome}`, "sucesso");
    }
    if (!res.ok) toast(data.error ?? "Erro ao carimbar", "erro");
    router.refresh();
  }

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
      toast(`Recompensa entregue para ${data.cartao.cliente.nome}!`, "sucesso");
    }
    if (!res.ok) toast(data.error ?? "Erro ao resgatar", "erro");
    router.refresh();
  }

  function renderCard(cartao: Cartao) {
    const completo = cartao.selos >= selosParaGanhar;
    const pct = Math.min((cartao.selos / selosParaGanhar) * 100, 100);
    const esteFormAberto = formAberto === cartao.cliente.id;
    const esteHistorico = historicoAberto === cartao.cliente.id;
    const ultimoCarimbo = cartao.carimbos[0];

    return (
      <div
        key={cartao.id}
        className="overflow-hidden rounded-2xl border border-white/10 transition hover:border-white/20"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${t.seloBg}`}
            >
              {iniciais(cartao.cliente.nome)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{cartao.cliente.nome}</p>
              <p className="truncate text-xs text-zinc-500">
                {cartao.cliente.email ?? cartao.cliente.telefone ?? "—"}
              </p>
            </div>
            {completo ? (
              <button
                onClick={() => resgatar(cartao.cliente.id)}
                disabled={loading === cartao.cliente.id}
                className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading === cartao.cliente.id ? "..." : "✓ Resgatar"}
              </button>
            ) : (
              <button
                onClick={() => (esteFormAberto ? setFormAberto(null) : abrirForm(cartao.cliente.id))}
                disabled={loading === cartao.cliente.id}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${
                  esteFormAberto ? "bg-white/10 hover:bg-white/15" : "bg-violet-600 hover:bg-violet-500"
                }`}
              >
                {loading === cartao.cliente.id ? "..." : esteFormAberto ? "Cancelar" : "+ Selo"}
              </button>
            )}
          </div>

          {/* Progresso — selinhos + barra */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
              <span>
                {completo ? (
                  <span className="font-semibold text-emerald-400">Cartão completo!</span>
                ) : (
                  `${cartao.selos} de ${selosParaGanhar} selos`
                )}
              </span>
              <span>
                {cartao.resgates > 0 && `${cartao.resgates} resgate${cartao.resgates !== 1 ? "s" : ""}`}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: selosParaGanhar }).map((_, i) => {
                const carimbado = i < cartao.selos;
                return (
                  <div
                    key={i}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
                      carimbado
                        ? `${t.seloBg} border-transparent text-white shadow-sm`
                        : "border-white/10 bg-white/5 text-zinc-600"
                    }`}
                  >
                    <Icone className="h-3.5 w-3.5" />
                  </div>
                );
              })}
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${completo ? "bg-emerald-500" : t.seloBg}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Último pedido */}
          {ultimoCarimbo?.descricao && !esteFormAberto && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-zinc-500">
              <span>🛒</span>
              <span className="truncate">{ultimoCarimbo.descricao}</span>
              {ultimoCarimbo.valor && (
                <span className="shrink-0 font-medium text-zinc-400">{moeda(ultimoCarimbo.valor)}</span>
              )}
              <span className="shrink-0 ml-auto">{dataRelativa(ultimoCarimbo.createdAt)}</span>
            </div>
          )}

          {/* Form inline */}
          {esteFormAberto && (
            <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs font-medium text-zinc-400">O que o cliente pediu? (opcional)</p>
              <input
                type="text"
                placeholder="Ex: 2 cafés + brownie"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                autoFocus
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none placeholder-zinc-600 focus:border-violet-500/60"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Valor (R$)"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none placeholder-zinc-600 focus:border-violet-500/60"
                />
                <button
                  onClick={() => confirmarSelo(cartao.cliente.id)}
                  disabled={loading === cartao.cliente.id}
                  className="flex-1 rounded-lg bg-violet-600 py-1.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
                >
                  {loading === cartao.cliente.id ? "Salvando..." : "Confirmar Selo"}
                </button>
              </div>
            </div>
          )}

          {/* Histórico */}
          {cartao.carimbos.length > 0 && (
            <button
              onClick={() => setHistoricoAberto(esteHistorico ? null : cartao.cliente.id)}
              className="mt-2.5 flex w-full items-center gap-1 text-xs text-zinc-600 transition hover:text-zinc-400"
            >
              <span>{esteHistorico ? "▲" : "▼"}</span>
              <span>{cartao.carimbos.length} carimbo{cartao.carimbos.length !== 1 ? "s" : ""} no histórico</span>
            </button>
          )}
          {esteHistorico && (
            <div className="mt-2 space-y-1 rounded-xl border border-white/5 bg-white/[0.03] p-2">
              {cartao.carimbos.map((c) => (
                <div key={c.id} className="flex items-center gap-2 py-1 text-xs">
                  <Icone className="h-3 w-3 shrink-0 text-zinc-500" />
                  <span className="flex-1 truncate text-zinc-400">
                    {c.descricao ?? <span className="text-zinc-600 italic">sem descrição</span>}
                  </span>
                  {c.valor && <span className="shrink-0 text-zinc-400">{moeda(c.valor)}</span>}
                  <span className="shrink-0 text-zinc-600">{dataRelativa(c.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const ordem: SecaoKey[] = ["prontos", "juntando", "novos"];

  return (
    <div className="space-y-4">
      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar por nome ou email..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none backdrop-blur-md transition focus:border-violet-500/50 focus:bg-white/10 placeholder-zinc-500"
      />

      {filtrados.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
          <p className="text-zinc-500">Nenhum cliente ainda</p>
          <p className="mt-1 text-sm text-zinc-600">Os clientes aparecem aqui quando escaneiam seu QR code</p>
        </div>
      ) : (
        <div className="space-y-5">
          {ordem.map((key) => {
            const lista = grupos[key];
            if (lista.length === 0) return null;
            const secao = SECOES[key];
            const aberta = !fechadas.has(key);

            return (
              <section key={key}>
                {/* Cabeçalho da seção */}
                <button
                  onClick={() => toggleSecao(key)}
                  className="mb-3 flex w-full items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-left transition hover:bg-white/[0.06]"
                >
                  <span className="text-lg">{secao.emoji}</span>
                  <span className={`font-semibold ${secao.cor}`}>{secao.label}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-zinc-300">
                    {lista.length}
                  </span>
                  <span className="ml-auto text-zinc-500">{aberta ? "▲" : "▼"}</span>
                </button>

                {/* Grade de clientes */}
                {aberta && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {lista.map((cartao) => renderCard(cartao))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
