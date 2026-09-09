"use client";

import { useEffect, useState } from "react";
import { Link2, Copy, Check, RefreshCw, Unlink } from "lucide-react";

export default function IntegracaoFlowCard() {
  const [conectado, setConectado] = useState<boolean | null>(null);
  const [chave, setChave] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    fetch("/api/lojista/integracao-flow")
      .then((r) => r.json())
      .then((d) => setConectado(!!d.conectado))
      .catch(() => setConectado(false));
  }, []);

  async function gerar() {
    setCarregando(true);
    try {
      const res = await fetch("/api/lojista/integracao-flow", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setChave(data.chave);
        setConectado(true);
      }
    } finally {
      setCarregando(false);
    }
  }

  async function desconectar() {
    setCarregando(true);
    try {
      await fetch("/api/lojista/integracao-flow", { method: "DELETE" });
      setConectado(false);
      setChave(null);
    } finally {
      setCarregando(false);
    }
  }

  function copiar() {
    if (!chave) return;
    navigator.clipboard.writeText(chave);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30">
          <Link2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Integração com o Flow</h2>
          <p className="text-xs text-zinc-500">Cartão fidelidade embutido dentro do seu agendamento</p>
        </div>
      </div>

      {conectado === null ? (
        <p className="text-sm text-zinc-500">Carregando...</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <span className={`h-2 w-2 rounded-full ${conectado ? "bg-emerald-400" : "bg-zinc-600"}`} />
            <span className={conectado ? "text-emerald-300 font-medium" : "text-zinc-400"}>
              {conectado ? "Integração ativa" : "Ainda não conectado"}
            </span>
          </div>

          {chave && (
            <div className="rounded-2xl border border-violet-400/20 bg-violet-400/[.06] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-300">
                Sua chave — copie agora, ela não aparece de novo
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-black/30 px-3 py-2 text-xs text-white">{chave}</code>
                <button
                  onClick={copiar}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-500"
                >
                  {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-zinc-400">
                Cole essa chave na configuração do Flow (aba do agendamento) pra conectar seu cartão fidelidade — o cliente passa a ver o cartão sem sair do próprio agendamento.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={gerar}
              disabled={carregando}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              {conectado ? "Gerar nova chave" : "Gerar chave de integração"}
            </button>
            {conectado && (
              <button
                onClick={desconectar}
                disabled={carregando}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
              >
                <Unlink className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
