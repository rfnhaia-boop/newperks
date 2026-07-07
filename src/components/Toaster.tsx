"use client";

import { useEffect, useState } from "react";

type Tipo = "sucesso" | "erro" | "festa";

type Toast = { id: number; mensagem: string; tipo: Tipo };

type Listener = (t: Toast) => void;

let listener: Listener | null = null;
let seq = 0;

/** Dispara um toast de qualquer client component: toast("Salvo!", "sucesso") */
export function toast(mensagem: string, tipo: Tipo = "sucesso") {
  listener?.({ id: ++seq, mensagem, tipo });
}

const ESTILOS: Record<Tipo, { borda: string; icone: string }> = {
  sucesso: { borda: "border-emerald-500/40", icone: "✅" },
  erro: { borda: "border-red-500/40", icone: "⚠️" },
  festa: { borda: "border-violet-500/40", icone: "🎉" },
};

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listener = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 4500);
    };
    return () => {
      listener = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-2.5 rounded-2xl border ${ESTILOS[t.tipo].borda} px-4 py-3 text-sm text-white shadow-2xl animate-[toastIn_0.25s_ease-out]`}
          style={{
            background: "rgba(24, 24, 27, 0.9)",
            backdropFilter: "blur(20px) saturate(150%)",
            WebkitBackdropFilter: "blur(20px) saturate(150%)",
          }}
        >
          <span className="shrink-0">{ESTILOS[t.tipo].icone}</span>
          <span className="min-w-0 flex-1">{t.mensagem}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="shrink-0 text-zinc-500 transition hover:text-white"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      ))}
      <style jsx global>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
