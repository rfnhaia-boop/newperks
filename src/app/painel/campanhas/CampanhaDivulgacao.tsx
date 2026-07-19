"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, MessageCircle, QrCode, Share2 } from "lucide-react";

export default function CampanhaDivulgacao({ slug, id, titulo, beneficio }: { slug: string; id: string; titulo: string; beneficio: string }) {
  const [aberto, setAberto] = useState(false); const [copiado, setCopiado] = useState(false); const [qr, setQr] = useState("");
  const link = typeof window === "undefined" ? "" : `${window.location.origin}/c/${slug}?campanha=${id}`;
  useEffect(() => { if (aberto && link) QRCode.toDataURL(link, { width: 360, margin: 1, errorCorrectionLevel: "H" }).then(setQr); }, [aberto, link]);
  const texto = `✨ ${titulo}\n\n${beneficio}\n\nEntre no programa de fidelidade e aproveite: ${link}`;
  async function copiar() { await navigator.clipboard.writeText(texto); setCopiado(true); setTimeout(() => setCopiado(false), 1800); }
  async function compartilhar() { if (navigator.share) { await navigator.share({ title: titulo, text: texto, url: link }); } else await copiar(); }
  return <div className="mt-4"><button onClick={() => setAberto(!aberto)} className="inline-flex items-center gap-2 rounded-xl border border-sky-300/25 bg-sky-300/[.08] px-3 py-2 text-xs font-black text-sky-100 transition hover:bg-sky-300 hover:text-zinc-950"><Share2 className="h-3.5 w-3.5" />Divulgar campanha</button>{aberto && <div className="mt-3 overflow-hidden rounded-2xl border border-sky-300/20 bg-sky-300/[.06] p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-sky-200">Kit de divulgação</p><p className="mt-1 text-sm font-bold text-white">Pronto para Story, WhatsApp e balcão.</p></div>{qr && <div className="rounded-xl bg-white p-1.5"><img src={qr} alt="QR Code da campanha" className="h-20 w-20" /></div>}</div><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={compartilhar} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-300 px-3 py-3 text-xs font-black text-zinc-950 transition hover:bg-sky-200"><MessageCircle className="h-4 w-4" />Compartilhar</button><button onClick={copiar} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-xs font-black text-white transition hover:bg-white hover:text-zinc-950">{copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copiado ? "Copiado" : "Copiar texto"}</button></div><p className="mt-3 flex items-center gap-2 text-[11px] leading-4 text-sky-100/60"><QrCode className="h-3.5 w-3.5 shrink-0" />Esse QR abre exatamente esta oferta, não só o programa geral.</p></div>}</div>;
}
