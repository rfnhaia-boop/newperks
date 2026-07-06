"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getTema } from "@/lib/themes";

type Props = {
  temaId?: string | null;
};

const DADOS_TEMAS: Record<string, { bgUrl: string; emojis: string[] }> = {
  cafe: {
    bgUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
    emojis: ["☕", "🥐", "🍪", "🍩"],
  },
  barbearia: {
    bgUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
    emojis: ["💈", "✂️", "🧔", "🎩"],
  },
  dentista: {
    bgUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
    emojis: ["🦷", "🪥", "✨", "🏥"],
  },
  pizzaria: {
    bgUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
    emojis: ["🍕", "🍅", "🧀", "🧅"],
  },
  sorveteria: {
    bgUrl: "https://images.unsplash.com/photo-1501443710928-814d3a964706?auto=format&fit=crop&w=1200&q=80",
    emojis: ["🍦", "🍧", "🍓", "🍒"],
  },
  beleza: {
    bgUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
    emojis: ["💅", "💄", "💇‍♀️", "✨"],
  },
  petshop: {
    bgUrl: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80",
    emojis: ["🐾", "🐶", "🐱", "🦴"],
  },
  generico: {
    bgUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    emojis: ["⭐", "💎", "🎁", "✨"],
  },
};

// Atmosfera por seção do painel
const SECOES: Record<string, {
  aura1: string;
  aura2: string;
  emojis: string[];
  label: string;
}> = {
  dashboard: {
    aura1: "from-violet-600/20 to-purple-600/20",
    aura2: "from-fuchsia-600/15 to-indigo-600/15",
    emojis: ["📊", "💜", "📈", "🏆"],
    label: "Dashboard",
  },
  clientes: {
    aura1: "from-cyan-500/20 to-blue-600/20",
    aura2: "from-sky-500/15 to-teal-600/15",
    emojis: ["👥", "💙", "🤝", "⭐"],
    label: "Clientes",
  },
  qrcode: {
    aura1: "from-amber-500/20 to-orange-500/20",
    aura2: "from-yellow-500/15 to-red-500/10",
    emojis: ["📱", "✨", "🔗", "🎯"],
    label: "QR Code",
  },
  config: {
    aura1: "from-emerald-500/20 to-green-600/20",
    aura2: "from-teal-500/15 to-cyan-600/10",
    emojis: ["⚙️", "💚", "🛠️", "🎛️"],
    label: "Config",
  },
};

function getSecao(pathname: string): string {
  if (pathname === "/painel") return "dashboard";
  if (pathname.startsWith("/painel/clientes")) return "clientes";
  if (pathname.startsWith("/painel/qrcode")) return "qrcode";
  if (pathname.startsWith("/painel/config")) return "config";
  return "dashboard";
}

export default function BackgroundFidelix({ temaId }: Props) {
  const tema = getTema(temaId);
  const configTema = DADOS_TEMAS[tema.id] || DADOS_TEMAS.generico;
  const pathname = usePathname();
  const secaoKey = getSecao(pathname);
  const secao = SECOES[secaoKey];

  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) / 30,
        y: (e.clientY - window.innerHeight / 2) / 30,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!mounted) return null;

  // Alterna entre emojis do tema (índices 0,1) e da seção (índices 2,3)
  const emojisFloat = [
    configTema.emojis[0],
    secao.emojis[0],
    configTema.emojis[1],
    secao.emojis[1],
  ];

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-zinc-950">
      {/* Foto de fundo temática */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: `url(${configTema.bgUrl})`,
          filter: "blur(18px) brightness(0.25)",
          transition: "background-image 0.8s ease",
        }}
      />

      {/* Máscara escura */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/75 to-zinc-950/95" />

      {/* Aura 1 — cor da seção */}
      <div
        key={secaoKey + "-aura1"}
        className={`absolute top-[5%] left-[5%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr ${secao.aura1} blur-[140px] animate-[spin_22s_linear_infinite]`}
        style={{ transition: "opacity 0.6s ease" }}
      />

      {/* Aura 2 — cor complementar da seção */}
      <div
        key={secaoKey + "-aura2"}
        className={`absolute bottom-[5%] right-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br ${secao.aura2} blur-[120px] animate-[spin_28s_linear_infinite_reverse]`}
        style={{ transition: "opacity 0.6s ease" }}
      />

      {/* Emojis flutuantes — alternando tema + seção */}
      <div className="absolute inset-0 pointer-events-none select-none">

        <div
          className="absolute left-[8%] top-[15%] flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_2px_8px_rgba(255,255,255,0.2)] backdrop-blur-sm text-2xl animate-[float_8s_ease-in-out_infinite]"
          style={{ transform: `translate3d(${mousePos.x * 0.5}px,${mousePos.y * 0.5}px,0) rotate(12deg)` }}
        >
          {emojisFloat[0]}
        </div>

        <div
          className="absolute left-[12%] bottom-[18%] flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.4),inset_0_2px_10px_rgba(255,255,255,0.2)] backdrop-blur-sm text-3xl animate-[float_10s_ease-in-out_2s_infinite]"
          style={{ transform: `translate3d(${mousePos.x * -0.7}px,${mousePos.y * -0.7}px,0) rotate(-12deg)` }}
        >
          {emojisFloat[1]}
        </div>

        <div
          className="absolute right-[10%] top-[20%] flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.4),inset_0_2px_10px_rgba(255,255,255,0.2)] backdrop-blur-sm text-3xl animate-[float_9s_ease-in-out_1s_infinite]"
          style={{ transform: `translate3d(${mousePos.x * 0.6}px,${mousePos.y * 0.6}px,0) rotate(6deg)` }}
        >
          {emojisFloat[2]}
        </div>

        <div
          className="absolute right-[8%] bottom-[22%] flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_2px_8px_rgba(255,255,255,0.2)] backdrop-blur-sm text-2xl animate-[float_11s_ease-in-out_3s_infinite]"
          style={{ transform: `translate3d(${mousePos.x * -0.4}px,${mousePos.y * -0.4}px,0) rotate(-6deg)` }}
        >
          {emojisFloat[3]}
        </div>

        {/* Esferas de vidro */}
        <div
          className="absolute left-[20%] top-[45%] h-10 w-10 rounded-full bg-gradient-to-tr from-white/5 to-white/20 border border-white/20 shadow-[inset_6px_6px_12px_rgba(255,255,255,0.25),0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-[2px] animate-[float_7s_ease-in-out_0.5s_infinite]"
          style={{ transform: `translate3d(${mousePos.x * 0.3}px,${mousePos.y * 0.3}px,0)` }}
        />
        <div
          className="absolute right-[22%] top-[55%] h-12 w-12 rounded-full bg-gradient-to-tr from-white/5 to-white/20 border border-white/20 shadow-[inset_8px_8px_16px_rgba(255,255,255,0.25),0_12px_32px_rgba(0,0,0,0.25)] backdrop-blur-[2px] animate-[float_12s_ease-in-out_1.5s_infinite]"
          style={{ transform: `translate3d(${mousePos.x * -0.5}px,${mousePos.y * -0.5}px,0)` }}
        />
        <div
          className="absolute left-[45%] top-[8%] h-8 w-8 rounded-full bg-gradient-to-tr from-white/5 to-white/20 border border-white/20 shadow-[inset_4px_4px_8px_rgba(255,255,255,0.25),0_6px_16px_rgba(0,0,0,0.2)] backdrop-blur-[2px] animate-[float_8s_ease-in-out_2.5s_infinite]"
          style={{ transform: `translate3d(${mousePos.x * 0.2}px,${mousePos.y * 0.2}px,0)` }}
        />
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { margin-top: 0px; }
          50% { margin-top: -25px; }
        }
      `}</style>
    </div>
  );
}
