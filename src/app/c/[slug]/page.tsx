"use client";

import { useEffect, useState, use } from "react";
import { getTema } from "@/lib/themes";

type Lojista = {
  nomeNegocio: string;
  tema: string;
  selosParaGanhar: number;
  recompensa: string;
};

export default function EntradaQRPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [lojista, setLojista] = useState<Lojista | null>(null);
  const [estado, setEstado] = useState<"carregando" | "form" | "enviado" | "naoencontrado">(
    "carregando"
  );
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ link: string; emailEnviado: boolean } | null>(null);

  const chave = `fidelix:token:${slug}`;

  useEffect(() => {
    (async () => {
      // Já cadastrou neste aparelho? vai direto pro cartão
      const tokenSalvo = localStorage.getItem(chave);
      if (tokenSalvo) {
        window.location.href = `/cartao/${tokenSalvo}`;
        return;
      }
      const res = await fetch(`/api/c/${slug}`);
      if (!res.ok) {
        setEstado("naoencontrado");
        return;
      }
      setLojista(await res.json());
      setEstado("form");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !/.+@.+\..+/.test(email)) return;
    setEnviando(true);
    const res = await fetch(`/api/c/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email }),
    });
    const data = await res.json();
    setEnviando(false);
    if (res.ok) {
      const token = data.link.split("/cartao/")[1];
      localStorage.setItem(chave, token);
      setResultado({ link: data.link, emailEnviado: data.emailEnviado });
      setEstado("enviado");
    }
  }

  const tema = getTema(lojista?.tema);

  if (estado === "carregando") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
      </div>
    );
  }

  if (estado === "naoencontrado") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-zinc-950 p-6 text-center">
        <span className="text-5xl">🔍</span>
        <h1 className="text-xl font-bold text-white">Cartão não encontrado</h1>
        <p className="text-zinc-400">Esse QR code não está mais ativo.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${tema.gradiente} bg-fixed px-4 py-10`}>
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="text-5xl drop-shadow-lg">{tema.emoji}</span>
          <h1 className="mt-2 text-2xl font-bold text-white drop-shadow">
            {lojista?.nomeNegocio}
          </h1>
        </div>

        {estado === "form" && (
          <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-md ring-1 ring-white/20">
            <h2 className="text-lg font-bold text-white">Bem-vindo! 👋</h2>
            <p className="mt-1 text-sm text-white/70">
              Cadastre-se para juntar selos e ganhar:{" "}
              <strong>{lojista?.recompensa}</strong>
            </p>
            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/15 px-4 py-3 text-white placeholder-white/50 outline-none focus:border-white/50"
                required
              />
              <input
                type="email"
                placeholder="Seu melhor email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/15 px-4 py-3 text-white placeholder-white/50 outline-none focus:border-white/50"
                required
              />
              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-xl bg-white py-3 font-bold text-zinc-900 transition hover:bg-white/90 disabled:opacity-60"
              >
                {enviando ? "Criando..." : "Criar meu cartão"}
              </button>
            </form>
            <p className="mt-3 text-center text-xs text-white/50">
              Você recebe um link de acesso no seu email.
            </p>
          </div>
        )}

        {estado === "enviado" && resultado && (
          <div className="rounded-3xl bg-white/10 p-6 text-center backdrop-blur-md ring-1 ring-white/20">
            <span className="text-4xl">✅</span>
            <h2 className="mt-2 text-lg font-bold text-white">Cartão criado!</h2>
            <p className="mt-1 text-sm text-white/70">
              {resultado.emailEnviado
                ? "Enviamos o link de acesso pro seu email."
                : "Seu cartão está pronto. Acesse pelo botão abaixo."}
            </p>
            <a
              href={resultado.link}
              className="mt-5 block w-full rounded-xl bg-white py-3 font-bold text-zinc-900 transition hover:bg-white/90"
            >
              Ver meu cartão agora
            </a>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-white/40">powered by NewPerks</p>
      </div>
    </div>
  );
}
