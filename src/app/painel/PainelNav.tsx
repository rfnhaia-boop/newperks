"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, Megaphone, RotateCcw, Users, QrCode, Settings, MessageSquareText, Gift } from "lucide-react";
import { motion } from "framer-motion";

const ABAS = [
  { href: "/painel", label: "Dashboard", icone: LayoutDashboard },
  { href: "/painel/clientes", label: "Clientes", icone: Users },
  { href: "/painel/qrcode", label: "QR Code", icone: QrCode },
  { href: "/painel/campanhas", label: "Ofertas", icone: Megaphone },
  { href: "/painel/retencao", label: "Retorno", icone: RotateCcw },
  { href: "/painel/feedback", label: "Feedback", icone: MessageSquareText },
  { href: "/painel/recompensas", label: "Prêmios", icone: Gift },
  { href: "/painel/config", label: "Config", icone: Settings },
];

export default function PainelNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop — pill nav centralizado no header */}
      <div className="relative hidden md:inline-flex gap-1 rounded-full border border-white/5 bg-zinc-900/60 p-1.5 backdrop-blur-lg shadow-inner">
        {ABAS.map((aba) => {
          const ativa =
            aba.href === "/painel"
              ? pathname === "/painel"
              : pathname.startsWith(aba.href);
          const Icon = aba.icone;
          return (
            <a
              key={aba.href}
              href={aba.href}
              className={`relative flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-300 z-10 ${
                ativa
                  ? "text-white"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              {ativa && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`h-4 w-4 ${ativa ? "text-white" : "text-zinc-400"}`} />
              <span>{aba.label}</span>
            </a>
          );
        })}
      </div>

      {/* Mobile — bottom bar fixa */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-white/5 bg-zinc-950/80 backdrop-blur-xl safe-area-bottom">
        {ABAS.map((aba) => {
          const ativa =
            aba.href === "/painel"
              ? pathname === "/painel"
              : pathname.startsWith(aba.href);
          const Icon = aba.icone;
          return (
            <a
              key={aba.href}
              href={aba.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-[10px] font-semibold transition-colors ${
                ativa ? "text-violet-400" : "text-zinc-500"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{aba.label}</span>
              {ativa && (
                <motion.div
                  layoutId="nav-dot-mobile"
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-violet-500"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </a>
          );
        })}
      </nav>
    </>
  );
}
