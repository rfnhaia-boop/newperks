"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { getTema } from "@/lib/themes";
import { Printer, Download, Share2, Copy, Check, QrCode } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function QRPoster({
  url,
  nomeNegocio,
  tema,
  recompensa,
}: {
  url: string;
  nomeNegocio: string;
  tema: string;
  recompensa: string;
}) {
  const [qr, setQr] = useState<string>("");
  const [copiado, setCopiado] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const t = getTema(tema);

  // Tilt Effect Hooks
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 40 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 40 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["100%", "-100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["100%", "-100%"]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 600,
      margin: 1,
      errorCorrectionLevel: "H",
      color: { dark: "#18181b", light: "#ffffff" },
    }).then(setQr);
  }, [url]);

  function imprimir() {
    window.print();
  }

  async function baixar() {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr;
    a.download = `qrcode-${nomeNegocio || "newperks"}.png`;
    a.click();
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      window.prompt("Copie este link:", url);
    }
  }

  async function compartilhar() {
    if (navigator.share) {
      await navigator.share({
        title: `Cartão fidelidade — ${nomeNegocio}`,
        text: `Entre no cartão fidelidade da ${nomeNegocio} e comece a juntar selos!`,
        url,
      });
      return;
    }
    await copiarLink();
  }

  return (
    <div className="space-y-6">
      {/* 3D Tilt Wrapper */}
      <div className="perspective-1000">
        <motion.div
          id="poster"
          ref={posterRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className="group relative mx-auto flex max-w-sm flex-col items-center gap-6 rounded-[2rem] border border-white/10 p-10 text-center shadow-2xl shadow-violet-500/10 transition-shadow hover:shadow-violet-500/30 overflow-hidden"
        >
          {/* Glassmorphism bg */}
          <div className="absolute inset-0 -z-10 bg-zinc-900/60 backdrop-blur-2xl" />
          
          {/* Glare effect */}
          <motion.div
            className="pointer-events-none absolute inset-0 -z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: "radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 60%)",
              x: glareX,
              y: glareY,
            }}
          />

          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 shadow-inner ring-1 ring-white/10"
            style={{ transform: "translateZ(30px)" }}
          >
            <span className="text-5xl drop-shadow-md">{t.emoji}</span>
          </div>

          <div style={{ transform: "translateZ(40px)" }}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">
              Cartão Fidelidade
            </p>
            <h2 className="mt-1 text-3xl font-black text-white">{nomeNegocio}</h2>
          </div>

          <div
            className="rounded-[1.5rem] bg-white p-5 shadow-xl ring-4 ring-white/10"
            style={{ transform: "translateZ(50px)" }}
          >
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="QR Code" className="h-56 w-56 rounded-xl" />
            ) : (
              <div className="h-56 w-56 animate-pulse rounded-xl bg-zinc-200" />
            )}
          </div>

          <div className="space-y-2" style={{ transform: "translateZ(30px)" }}>
            <p className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <QrCode className="h-5 w-5 text-violet-400" />
              Aponte a câmera
            </p>
            <p className="text-sm text-zinc-300">
              Junte selos e ganhe: <strong className="text-violet-300">{recompensa}</strong>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Copy Link Input Area */}
      <div className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-zinc-900/50 p-2 backdrop-blur-md flex items-center justify-between gap-2 shadow-inner">
        <div className="flex-1 overflow-hidden px-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-0.5">Link do Programa</p>
          <p className="truncate font-mono text-xs text-zinc-300">{url}</p>
        </div>
        <button
          onClick={copiarLink}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-300 transition-colors hover:bg-violet-600 hover:text-white"
          title="Copiar link"
        >
          {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      {/* Versão de impressão — clara, econômica de tinta, legível em papel */}
      <div id="poster-print" className="hidden">
        <div
          style={{
            width: "560px",
            margin: "0 auto",
            padding: "48px 40px",
            textAlign: "center",
            background: "#ffffff",
            color: "#18181b",
            border: "3px solid #18181b",
            borderRadius: "24px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: "52px", lineHeight: 1 }}>{t.emoji}</div>
          <p style={{ margin: "16px 0 0", fontSize: "13px", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#52525b" }}>
            Cartão Fidelidade
          </p>
          <h2 style={{ margin: "4px 0 0", fontSize: "34px", fontWeight: 800 }}>{nomeNegocio}</h2>

          {qr && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="QR Code" style={{ width: "300px", height: "300px", margin: "24px auto 0", display: "block" }} />
          )}

          <p style={{ margin: "24px 0 0", fontSize: "22px", fontWeight: 800 }}>📲 Aponte a câmera do celular</p>
          <p style={{ margin: "8px 0 0", fontSize: "16px", color: "#3f3f46" }}>
            Junte selos a cada compra e ganhe:
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "20px", fontWeight: 800 }}>{recompensa}</p>
          <p style={{ margin: "20px 0 0", fontSize: "11px", color: "#a1a1aa", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            powered by NewPerks
          </p>
        </div>
      </div>

      {/* Ações (não imprimem) */}
      <div className="no-print mx-auto grid max-w-sm grid-cols-2 gap-3">
        <button
          onClick={imprimir}
          className="group flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02] hover:bg-violet-500 col-span-2"
        >
          <Printer className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          Imprimir Cartaz
        </button>
        <button
          onClick={baixar}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Download className="h-4 w-4" />
          Baixar QR
        </button>
        <button
          onClick={compartilhar}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Share2 className="h-4 w-4" />
          Compartilhar
        </button>
      </div>

      <p className="no-print px-2 text-center text-xs leading-relaxed text-zinc-500">
        Dica: mande o link no WhatsApp ou deixe o cartaz perto do caixa para o cliente entrar no programa.
      </p>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #poster { display: none !important; }
          #poster-print { display: block !important; }
          #poster-print, #poster-print * { visibility: visible; }
          #poster-print { position: absolute; left: 50%; top: 40px; transform: translateX(-50%); }
          .no-print { display: none !important; }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
