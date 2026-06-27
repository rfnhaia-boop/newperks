"use client";

import { usePathname } from "next/navigation";

const ABAS = [
  { href: "/painel", label: "Dashboard", icone: "📊" },
  { href: "/painel/clientes", label: "Clientes", icone: "👥" },
  { href: "/painel/qrcode", label: "QR Code", icone: "🎫" },
  { href: "/painel/config", label: "Config", icone: "⚙️" },
];

export default function PainelNav() {
  const pathname = usePathname();

  return (
    <div className="inline-flex gap-0.5 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
      {ABAS.map((aba) => {
        const ativa =
          aba.href === "/painel"
            ? pathname === "/painel"
            : pathname.startsWith(aba.href);
        return (
          <a
            key={aba.href}
            href={aba.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
              ativa
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/40"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="text-sm">{aba.icone}</span>
            <span className="hidden md:inline">{aba.label}</span>
          </a>
        );
      })}
    </div>
  );
}
