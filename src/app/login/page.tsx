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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    const res = await signIn("credentials", { email, senha, redirect: false });
    if (res?.error) {
      setErro("Email ou senha incorretos");
      setLoading(false);
    } else {
      router.push("/painel");
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

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-violet-500"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-violet-500"
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
