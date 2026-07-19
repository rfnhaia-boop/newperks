"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LISTA_TEMAS } from "@/lib/themes";

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    nomeNegocio: "",
    tema: "generico",
  });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("/api/lojista/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.error ?? "Erro ao criar conta. Tente de novo.");
        setLoading(false);
        return;
      }
      // Conta criada — entra direto, sem redigitar nada
      const login = await signIn("credentials", {
        email: form.email,
        senha: form.senha,
        redirect: false,
      });
      if (login?.error) {
        // fallback raro: conta criada mas login falhou
        router.push("/login");
        return;
      }
      router.push("/painel");
    } catch {
      setErro("Erro de conexão. Verifique sua internet e tente de novo.");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 px-4 py-10 overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[150px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-fuchsia-600/8 blur-[150px]" />

      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">NewPerks</h1>
          <p className="mt-1 text-zinc-400">Crie sua conta — leva 1 minuto</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-white/10 p-6"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
          }}
        >
          {[
            { key: "nomeNegocio", label: "Nome do negócio", type: "text" },
            { key: "nome", label: "Seu nome", type: "text" },
            { key: "email", label: "Email", type: "email" },
            { key: "senha", label: "Senha (mínimo 10 caracteres)", type: "password" },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="mb-1 block text-sm text-zinc-400">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                minLength={key === "senha" ? 10 : undefined}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none transition focus:border-violet-500/50 focus:bg-white/10"
                required
              />
            </div>
          ))}

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Tipo de negócio (define o visual do cartão)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {LISTA_TEMAS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm({ ...form, tema: t.id })}
                  title={t.nome}
                  className={`flex flex-col items-center gap-1 rounded-lg border-2 bg-gradient-to-br p-2 transition ${t.gradiente} ${
                    form.tema === t.id
                      ? "border-white"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <span className="text-xl">{t.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {erro && <p className="text-sm text-red-400">{erro}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-2.5 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? "Criando sua conta..." : "Criar conta e entrar"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">
          Já tem conta?{" "}
          <a href="/login" className="text-violet-400 hover:underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}
