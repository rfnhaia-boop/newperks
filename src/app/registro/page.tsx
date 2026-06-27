"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
    const res = await fetch("/api/lojista/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setErro(data.error ?? "Erro ao criar conta");
      setLoading(false);
    } else {
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">NewPerks</h1>
          <p className="mt-1 text-zinc-400">Criar conta de lojista</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
          {[
            { key: "nomeNegocio", label: "Nome do negócio", type: "text" },
            { key: "nome", label: "Seu nome", type: "text" },
            { key: "email", label: "Email", type: "email" },
            { key: "senha", label: "Senha", type: "password" },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="mb-1 block text-sm text-zinc-400">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white outline-none focus:border-violet-500"
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
            className="w-full rounded-lg bg-violet-600 py-2.5 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar conta"}
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
