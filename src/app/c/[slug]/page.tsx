"use client";

import { useEffect, useState, use } from "react";
import { getTema } from "@/lib/themes";
import BackgroundFidelix from "@/components/BackgroundFidelix";

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
  // "cadastro" = primeira vez | "entrar" = já tem cartão nesta loja
  const [modo, setModo] = useState<"cadastro" | "entrar">("cadastro");
  const [erro, setErro] = useState<string | null>(null);

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
    if (!/.+@.+\..+/.test(email)) return;
    if (modo === "cadastro" && !nome.trim()) return;
    setErro(null);
    setEnviando(true);
    const res = await fetch(`/api/c/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modo === "entrar" ? { email, modo: "entrar" } : { nome, email }),
    });
    const data = await res.json();
    setEnviando(false);
    if (res.ok) {
      const token = data.link.split("/cartao/")[1];
      localStorage.setItem(chave, token);
      if (modo === "entrar") {
        // Já tem cartão: vai direto, sem tela intermediária
        window.location.href = data.link;
        return;
      }
      setResultado({ link: data.link, emailEnviado: data.emailEnviado });
      setEstado("enviado");
    } else {
      setErro(data.error ?? "Algo deu errado. Tente de novo.");
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
    <div className="relative min-h-screen px-4 py-16 flex items-center justify-center">
      {/* Dynamic themed background with floating 3D elements */}
      <BackgroundFidelix temaId={lojista?.tema} />
      
      <div className="relative w-full max-w-md z-10">
        <div className="mb-8 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 shadow-inner backdrop-blur-md border border-white/20 mb-3 transform hover:rotate-6 transition-transform duration-300">
            <span className="text-4xl drop-shadow-md">{tema.emoji}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
            {lojista?.nomeNegocio}
          </h1>
        </div>

        {estado === "form" && (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-300 hover:border-white/15">
            {/* Glow inner line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            {modo === "cadastro" ? (
              <>
                <h2 className="text-xl font-bold text-white tracking-tight">Bem-vindo! 👋</h2>
                <p className="mt-1.5 text-sm text-white/70 leading-relaxed">
                  Cadastre-se para juntar selos e ganhar:{" "}
                  <strong className="text-white font-semibold underline decoration-white/30 underline-offset-2">
                    {lojista?.recompensa}
                  </strong>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white tracking-tight">Que bom te ver! 🎉</h2>
                <p className="mt-1.5 text-sm text-white/70 leading-relaxed">
                  Digite o email do seu cadastro para abrir seu cartão.
                </p>
              </>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {modo === "cadastro" && (
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-white/30 focus:bg-white/10 focus:ring-4 focus:ring-white/5"
                    required
                  />
                </div>
              )}
              <div className="space-y-1">
                <input
                  type="email"
                  placeholder="Seu melhor email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-white/30 focus:bg-white/10 focus:ring-4 focus:ring-white/5"
                  required
                />
              </div>

              {erro && (
                <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {erro}
                </p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="w-full mt-2 rounded-2xl bg-white py-3.5 font-bold text-zinc-950 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-xl hover:shadow-black/20 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
              >
                {enviando ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                    <span>{modo === "entrar" ? "Abrindo..." : "Criando..."}</span>
                  </div>
                ) : modo === "entrar" ? (
                  "Abrir meu cartão"
                ) : (
                  "Criar meu cartão"
                )}
              </button>
            </form>

            <button
              onClick={() => {
                setModo(modo === "cadastro" ? "entrar" : "cadastro");
                setErro(null);
              }}
              className="mt-4 w-full text-center text-sm font-semibold text-white/60 transition hover:text-white"
            >
              {modo === "cadastro" ? "Já tenho cartão aqui → Entrar" : "Primeira vez? → Criar cartão"}
            </button>

            {modo === "cadastro" && (
              <p className="mt-3 text-center text-xs text-white/40 font-medium">
                Você recebe um link de acesso no seu email.
              </p>
            )}
          </div>
        )}

        {estado === "enviado" && resultado && (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 border border-white/20 text-2xl mb-4">
              ✅
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Cartão criado!</h2>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">
              {resultado.emailEnviado
                ? "Enviamos o link de acesso para o seu email."
                : "Seu cartão está pronto. Acesse pelo botão abaixo."}
            </p>
            <a
              href={resultado.link}
              className="mt-6 block w-full rounded-2xl bg-white py-3.5 font-bold text-zinc-950 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-xl active:translate-y-0"
            >
              Ver meu cartão agora
            </a>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-white/30 tracking-wider font-semibold uppercase">
          powered by NewPerks
        </p>
      </div>
    </div>
  );
}
