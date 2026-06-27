"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { getTema } from "@/lib/themes";

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
  const posterRef = useRef<HTMLDivElement>(null);
  const t = getTema(tema);

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

  return (
    <div className="space-y-4">
      {/* Poster imprimível */}
      <div
        ref={posterRef}
        id="poster"
        className={`mx-auto flex max-w-sm flex-col items-center gap-5 rounded-3xl bg-gradient-to-br ${t.gradiente} p-8 text-center shadow-2xl`}
      >
        <span className="text-5xl">{t.emoji}</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
            Cartão Fidelidade
          </p>
          <h2 className="text-2xl font-extrabold text-white">{nomeNegocio}</h2>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-lg">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="QR Code" className="h-52 w-52" />
          ) : (
            <div className="h-52 w-52 animate-pulse rounded bg-zinc-200" />
          )}
        </div>

        <div className="space-y-1">
          <p className="text-lg font-bold text-white">📲 Aponte a câmera</p>
          <p className="text-sm text-white/80">
            Junte selos e ganhe: <strong>{recompensa}</strong>
          </p>
        </div>
      </div>

      <p className="break-all text-center font-mono text-xs text-zinc-500">{url}</p>

      {/* Ações (não imprimem) */}
      <div className="no-print flex justify-center gap-3">
        <button
          onClick={imprimir}
          className="rounded-lg bg-violet-600 px-5 py-2.5 font-semibold text-white transition hover:bg-violet-500"
        >
          🖨️ Imprimir
        </button>
        <button
          onClick={baixar}
          className="rounded-lg border border-zinc-700 px-5 py-2.5 font-semibold text-zinc-200 transition hover:bg-zinc-800"
        >
          ⬇️ Baixar QR
        </button>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #poster, #poster * { visibility: visible; }
          #poster { position: absolute; left: 50%; top: 40px; transform: translateX(-50%); }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
