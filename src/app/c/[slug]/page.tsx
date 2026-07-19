"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { getTema } from "@/lib/themes";
import BackgroundFidelix from "@/components/BackgroundFidelix";

type Lojista = {
  nomeNegocio: string;
  tema: string;
  selosParaGanhar: number;
  recompensa: string;
  cidade?: string | null;
  whatsapp?: string | null;
  ofertaPrimeiraVisita?: string | null;
  ofertaPrimeiraVisitaAtiva?: boolean;
  ofertaPrimeiraVisitaRegras?: string | null;
};

export default function EntradaQRPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const campanhaId = searchParams.get("campanha");
  const indicadoPorCodigo = searchParams.get("ref");
  const origem = searchParams.get("origem");
  const [lojista, setLojista] = useState<Lojista | null>(null);
  const [estado, setEstado] = useState<"carregando" | "form" | "carteira" | "enviado" | "naoencontrado">(
    "carregando"
  );
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [aniversario, setAniversario] = useState("");
  const [aceitaComunicacoes, setAceitaComunicacoes] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ emailEnviado: boolean; codigoTeste?: string } | null>(null);
  // "cadastro" = primeira vez | "entrar" = já tem cartão nesta loja
  const [modo, setModo] = useState<"cadastro" | "entrar">("cadastro");
  const [erro, setErro] = useState<string | null>(null);
  const [carteira, setCarteira] = useState<{ nome: string; nomeNegocio: string; link: string | null; campanha?: { titulo: string; beneficio: string } | null } | null>(null);

  useEffect(() => {
    (async () => {
      const campanhaQueryApi = campanhaId ? `?campanha=${encodeURIComponent(campanhaId)}` : "";
      const res = await fetch(`/api/c/${slug}${campanhaQueryApi}`);
      if (!res.ok) {
        setEstado("naoencontrado");
        return;
      }
      setLojista(await res.json());
      const campanhaQuery = campanhaId ? `?campanha=${encodeURIComponent(campanhaId)}` : "";
      const acesso = await fetch(`/api/c/${slug}/carteira${campanhaQuery}`).then((r) => r.json()).catch(() => null);
      if (acesso?.autenticado) {
        setCarteira(acesso);
        setEstado("carteira");
      } else {
        setEstado("form");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, campanhaId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) return;
    if (modo === "cadastro" && !nome.trim()) return;
    setErro(null);
    setEnviando(true);
    let res: Response, data: { acessarCarteira?: boolean; emailEnviado?: boolean; codigoTeste?: string; error?: string };
    try {
      res = await fetch(`/api/c/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          modo === "entrar" ? { email, modo: "entrar" } : { nome, email, aniversario: aniversario || undefined, indicadoPorCodigo: indicadoPorCodigo || undefined, campanhaId: campanhaId || undefined, origem: origem || undefined, aceitaComunicacoes }
        ),
      });
      data = await res.json().catch(() => ({}));
    } catch {
      setEnviando(false);
      setErro("Erro de conexão. Tente de novo.");
      return;
    }
    setEnviando(false);
    if (res.ok && data.acessarCarteira) {
      if (modo === "entrar") {
        window.location.href = `/carteira?email=${encodeURIComponent(email)}`;
        return;
      }
      setResultado({ emailEnviado: data.emailEnviado ?? false, codigoTeste: data.codigoTeste });
      setEstado("enviado");
    } else {
      setErro(data.error ?? "Algo deu errado. Tente de novo.");
    }
  }

  async function usarCarteira() {
    if (!carteira) return;
    setEnviando(true);
    setErro(null);
    try {
      const params = new URLSearchParams();
      if (indicadoPorCodigo) params.set("ref", indicadoPorCodigo);
      if (campanhaId) params.set("campanha", campanhaId);
      if (origem) params.set("origem", origem);
      const refQuery = params.size ? `?${params.toString()}` : "";
      const res = await fetch(`/api/c/${slug}/carteira${refQuery}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.link) throw new Error(data.error ?? "Não foi possível abrir seu cartão.");
      window.location.href = data.link;
    } catch (err) {
      setEnviando(false);
      setErro(err instanceof Error ? err.message : "Tente novamente em alguns instantes.");
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
          <a href="/carteira" className="mt-3 inline-flex text-xs font-bold text-white/60 transition hover:text-white">
            Já tem outros cartões? Abrir minha carteira →
          </a>
          {campanhaId && <div className="mx-auto mt-5 max-w-sm rounded-2xl border border-[#e9ff65]/30 bg-[#e9ff65]/10 px-4 py-3 text-left"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#e9ff65]">Oferta de primeira visita</p><p className="mt-1 text-sm font-bold text-white">Entre no programa e veja sua vantagem exclusiva.</p></div>}
          {!campanhaId && lojista?.ofertaPrimeiraVisitaAtiva && lojista.ofertaPrimeiraVisita && <div className="mx-auto mt-5 max-w-sm rounded-2xl border border-[#e9ff65]/30 bg-[#e9ff65]/10 px-4 py-3 text-left"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#e9ff65]">Vantagem de primeira visita</p><p className="mt-1 text-sm font-bold text-white">{lojista.ofertaPrimeiraVisita}</p>{lojista.ofertaPrimeiraVisitaRegras && <p className="mt-1.5 text-xs leading-5 text-white/65">{lojista.ofertaPrimeiraVisitaRegras}</p>}</div>}
          {lojista?.cidade && <p className="mt-3 text-xs font-bold text-white/45">Disponível em {lojista.cidade}{lojista.whatsapp ? " · atendimento pelo WhatsApp" : ""}</p>}
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
              {modo === "cadastro" && <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-white/10 bg-white/[.035] p-3 text-left"><input type="checkbox" checked={aceitaComunicacoes} onChange={(e) => setAceitaComunicacoes(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#e9ff65]" /><span className="text-[11px] leading-5 text-white/55">Quero receber lembretes sobre meu cartão e vantagens deste estabelecimento por e-mail.</span></label>}
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
              {modo === "cadastro" && (
                <div className="space-y-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Aniversário DD/MM (opcional 🎂)"
                    value={aniversario}
                    onChange={(e) => {
                      // máscara simples DD/MM
                      const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setAniversario(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                    }}
                    maxLength={5}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-white/30 focus:bg-white/10 focus:ring-4 focus:ring-white/5"
                  />
                </div>
              )}

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

        {estado === "carteira" && carteira && (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Sua carteira Fidelix</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">Oi, {carteira.nome.split(" ")[0]}.</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {carteira.link ? `Seu cartão da ${carteira.nomeNegocio} já está aqui.` : "Você já está conectado. Só falta autorizar este cartão na sua carteira."}
            </p>
            {carteira.campanha && !carteira.link && <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">Sua oferta de boas-vindas</p><p className="mt-2 text-sm font-bold text-white">{carteira.campanha.titulo}</p><p className="mt-1 text-sm font-black text-[#e9ff65]">{carteira.campanha.beneficio}</p></div>}
            {erro && <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{erro}</p>}
            <button onClick={() => { if (carteira.link) window.location.href = carteira.link; else usarCarteira(); }} disabled={enviando} className="mt-6 w-full rounded-2xl bg-white py-3.5 font-bold text-zinc-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-white/95 disabled:opacity-60">
              {enviando ? "Preparando..." : carteira.link ? "Abrir meu cartão" : "Liberar meu cartão"}
            </button>
            <button onClick={() => setEstado("form")} className="mt-4 w-full text-center text-sm font-semibold text-white/60 transition hover:text-white">Não sou {carteira.nome.split(" ")[0]}</button>
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
                ? "Enviamos um código de acesso para o seu email."
                : "Seu cartão está pronto. Use o código de acesso para abrir sua carteira."}
            </p>
            {resultado.codigoTeste && <p className="mt-3 text-sm font-black text-[#e9ff65]">Teste local: {resultado.codigoTeste}</p>}
            <a
              href={`/carteira?email=${encodeURIComponent(email)}`}
              className="mt-6 block w-full rounded-2xl bg-white py-3.5 font-bold text-zinc-950 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-xl active:translate-y-0"
            >
              Abrir minha carteira
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
