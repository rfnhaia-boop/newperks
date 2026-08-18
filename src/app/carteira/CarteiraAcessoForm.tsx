"use client";

import { FormEvent, useState } from "react";
import { useGoogleIdTokenLogin } from "@/hooks/useGoogleIdTokenLogin";

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function formatarTelefone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function CarteiraAcessoForm({ expirado = false }: { expirado?: boolean; emailInicial?: string }) {
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = useGoogleIdTokenLogin({
    onCredential: async (idToken) => {
      setGoogleLoading(true);
      setErro("");
      try {
        const res = await fetch("/api/carteira/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Não foi possível entrar com o Google.");
        window.location.href = "/carteira";
      } catch (err) {
        setGoogleLoading(false);
        setErro(err instanceof Error ? err.message : "Tente novamente em alguns instantes.");
      }
    },
    onError: (message) => {
      setGoogleLoading(false);
      setErro(message);
    },
  });

  async function entrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEntrando(true);
    setErro("");
    try {
      const res = await fetch("/api/carteira/acesso", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ telefone, senha }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Não foi possível entrar.");
      window.location.href = "/carteira";
    } catch (err) {
      setEntrando(false);
      setErro(err instanceof Error ? err.message : "Tente novamente em alguns instantes.");
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Acesso pessoal</p>
      <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">Sua carteira, em um lugar só.</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-400">Informe o telefone e a senha que você usou ao criar seu cartão.</p>
      {expirado && <p className="mt-5 rounded-2xl bg-amber-500/20 border border-amber-500/30 px-4 py-3 text-sm text-amber-200">Sua sessão expirou. Entre novamente abaixo.</p>}
      {erro && <p className="mt-5 rounded-2xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-200">{erro}</p>}

      <button
        type="button"
        onClick={() => handleGoogle()}
        disabled={googleLoading}
        className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-50"
      >
        <GoogleIcon />
        {googleLoading ? "Conectando..." : "Continuar com o Google"}
      </button>
      <div className="mt-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-wider text-zinc-500">ou</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={entrar} className="mt-5 space-y-3">
        <label className="block text-sm font-bold text-zinc-300" htmlFor="telefone-carteira">Seu telefone</label>
        <input
          id="telefone-carteira"
          type="tel"
          inputMode="numeric"
          required
          value={telefone}
          onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
          placeholder="(11) 91234-5678"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none backdrop-blur-md transition focus:border-white/30 focus:bg-white/10 focus:ring-4 focus:ring-white/10 placeholder:text-zinc-600"
        />
        <label className="block text-sm font-bold text-zinc-300" htmlFor="senha-carteira">Sua senha</label>
        <input
          id="senha-carteira"
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none backdrop-blur-md transition focus:border-white/30 focus:bg-white/10 focus:ring-4 focus:ring-white/10 placeholder:text-zinc-600"
        />
        <button type="submit" disabled={entrando} className="w-full rounded-2xl bg-white px-4 py-3.5 font-bold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-wait disabled:opacity-60">
          {entrando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <a href="/descobrir" className="mt-6 block text-center text-sm font-bold text-zinc-400 underline decoration-zinc-600 underline-offset-4 transition hover:text-white">Ainda não tem cartão? Descobrir ofertas perto de mim →</a>
    </section>
  );
}
