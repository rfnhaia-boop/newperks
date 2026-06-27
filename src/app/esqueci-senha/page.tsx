"use client";
import { useState } from "react";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/lojista/reset-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setEnviado(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-violet-400">NewPerks</h1>
          <p className="mt-1 text-zinc-400">Recuperar acesso</p>
        </div>

        {enviado ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <p className="text-2xl">📬</p>
            <p className="mt-3 font-semibold text-white">Verifique seu email</p>
            <p className="mt-2 text-sm text-zinc-400">
              Se esse email estiver cadastrado, você vai receber um link pra redefinir a senha em instantes.
            </p>
            <a href="/login" className="mt-6 inline-block text-sm text-violet-400 hover:underline">
              Voltar pro login
            </a>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Email da conta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white outline-none focus:border-violet-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-violet-600 py-2 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-zinc-500">
          Lembrou a senha?{" "}
          <a href="/login" className="text-violet-400 hover:underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}
