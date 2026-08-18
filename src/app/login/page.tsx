"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetOk = searchParams.get("reset") === "ok";
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  async function handleGoogle() {
    setLoadingGoogle(true);
    setErro("");
    try {
      await signIn("google", { callbackUrl: "/painel" });
    } catch {
      setErro("Erro ao conectar com o Google. Tente de novo.");
      setLoadingGoogle(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      const res = await signIn("credentials", { email, senha, redirect: false });
      if (res?.error) {
        setErro("Email ou senha incorretos");
        setLoading(false);
      } else {
        router.push("/painel");
      }
    } catch {
      setErro("Erro de conexão. Tente de novo.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">NewPerks</h1>
        <p className="mt-1 text-zinc-400">Acesse seu painel</p>
      </div>

      {resetOk && (
        <div className="mb-4 rounded-lg border border-emerald-800 bg-emerald-950 px-4 py-3 text-center text-sm text-emerald-300">
          ✅ Senha redefinida com sucesso! Faça login.
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative overflow-hidden space-y-4 rounded-3xl border border-white/10 p-8 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)]" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}>
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loadingGoogle || loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loadingGoogle ? "Conectando..." : "Continuar com o Google"}
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-wider text-zinc-500">ou</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition"
            required
          />
        </div>
        {erro && <p className="text-sm text-red-400">{erro}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-violet-600 py-2 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <div className="text-center">
          <a href="/esqueci-senha" className="text-xs text-zinc-500 transition hover:text-zinc-300">
            Esqueci minha senha
          </a>
        </div>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-500">
        Não tem conta?{" "}
        <a href="/registro" className="text-violet-400 hover:underline">Criar conta</a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 p-4 overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[150px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-fuchsia-600/8 blur-[150px]" />
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
