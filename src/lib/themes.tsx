import type { ReactNode } from "react";

export type TemaId =
  | "cafe"
  | "barbearia"
  | "dentista"
  | "pizzaria"
  | "sorveteria"
  | "beleza"
  | "petshop"
  | "generico";

export type Tema = {
  id: TemaId;
  nome: string;
  emoji: string;
  // Gradiente do cartão (classes Tailwind)
  gradiente: string;
  // Cor de fundo do selo CARIMBADO (sólido, vibrante) — ícone fica branco em cima
  seloBg: string;
  // Ícone do selo (recebe className)
  Icone: (props: { className?: string }) => ReactNode;
};

// ─── Ícones (24x24) ────────────────────────────────────────────────

function IconeCafe({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M3 8h13v5.5A5.5 5.5 0 0 1 10.5 19h-2A5.5 5.5 0 0 1 3 13.5V8z"
        fill="currentColor"
      />
      <path
        d="M16 9.5h2.2a2.6 2.6 0 0 1 0 5.2H16"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M6.5 2.5c-.6.8-.6 1.6 0 2.4M10 2.5c-.6.8-.6 1.6 0 2.4M13.5 2.5c-.6.8-.6 1.6 0 2.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconeBarbearia({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

function IconeDentista({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2c-2.5 0-3.7 1-5.2 1S4 2.2 4 6.4c0 2.4.8 4.8 1.4 7.9C6 17.4 6.2 22 8 22c1.5 0 1.6-2.7 2-5.1.3-1.8.7-2.6 2-2.6s1.7.8 2 2.6c.4 2.4.5 5.1 2 5.1 1.8 0 2-4.6 2.6-7.7C21.2 11.2 22 8.8 22 6.4 22 2.2 19.5 3 18 3s-3.5-1-6-1z" />
    </svg>
  );
}

function IconePizzaria({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M3.5 6.5C6 4.8 9 3.5 12 3.5s6 1.3 8.5 3L12 21z"
        fill="currentColor"
      />
      <circle cx="9.5" cy="8.5" r="1.1" fill="#fff" opacity="0.45" />
      <circle cx="14" cy="9.5" r="1.1" fill="#fff" opacity="0.45" />
      <circle cx="11.5" cy="13" r="1.1" fill="#fff" opacity="0.45" />
    </svg>
  );
}

function IconeSorveteria({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="12" cy="7.5" r="5.5" />
      <path d="M6.8 11.2 12 22l5.2-10.8c-1.5 1-3.3 1.6-5.2 1.6s-3.7-.6-5.2-1.6z" />
    </svg>
  );
}

function IconeBeleza({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 21s-7.5-4.7-10-8.6C.4 9.3 1.8 5 5.6 5 8.2 5 12 8.2 12 8.2S15.8 5 18.4 5C22.2 5 23.6 9.3 22 12.4 19.5 16.3 12 21 12 21z" />
    </svg>
  );
}

function IconePetshop({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <ellipse cx="5" cy="11" rx="2.1" ry="2.6" />
      <ellipse cx="9.5" cy="7.5" rx="2.1" ry="2.6" />
      <ellipse cx="14.5" cy="7.5" rx="2.1" ry="2.6" />
      <ellipse cx="19" cy="11" rx="2.1" ry="2.6" />
      <path d="M12 12.2c-3 0-5.2 2.6-5.2 5.2 0 2 1.6 3.1 3.6 3.1.9 0 1.1.5 1.6.5s.7-.5 1.6-.5c2 0 3.6-1.1 3.6-3.1 0-2.6-2.2-5.2-5.2-5.2z" />
    </svg>
  );
}

function IconeGenerico({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2.5l2.9 6.1 6.6.6-5 4.4 1.5 6.5L12 17.3 6 20.6l1.5-6.5-5-4.4 6.6-.6z" />
    </svg>
  );
}

// ─── Definição dos temas ──────────────────────────────────────────
// Cores vibrantes; selo carimbado = círculo sólido (seloBg) + ícone branco.

export const TEMAS: Record<TemaId, Tema> = {
  cafe: {
    id: "cafe",
    nome: "Cafeteria",
    emoji: "☕",
    gradiente: "from-amber-500 via-orange-600 to-orange-800",
    seloBg: "bg-amber-950",
    Icone: IconeCafe,
  },
  barbearia: {
    id: "barbearia",
    nome: "Barbearia",
    emoji: "💈",
    gradiente: "from-blue-950 via-slate-800 to-red-800",
    seloBg: "bg-red-600",
    Icone: IconeBarbearia,
  },
  dentista: {
    id: "dentista",
    nome: "Dentista / Clínica",
    emoji: "🦷",
    gradiente: "from-cyan-500 via-sky-500 to-blue-600",
    seloBg: "bg-blue-700",
    Icone: IconeDentista,
  },
  pizzaria: {
    id: "pizzaria",
    nome: "Pizzaria / Lanches",
    emoji: "🍕",
    gradiente: "from-red-600 via-orange-600 to-amber-500",
    seloBg: "bg-red-800",
    Icone: IconePizzaria,
  },
  sorveteria: {
    id: "sorveteria",
    nome: "Sorveteria / Açaí",
    emoji: "🍦",
    gradiente: "from-fuchsia-500 via-pink-500 to-rose-400",
    seloBg: "bg-purple-600",
    Icone: IconeSorveteria,
  },
  beleza: {
    id: "beleza",
    nome: "Salão / Beleza",
    emoji: "💅",
    gradiente: "from-purple-600 via-fuchsia-600 to-pink-500",
    seloBg: "bg-fuchsia-900",
    Icone: IconeBeleza,
  },
  petshop: {
    id: "petshop",
    nome: "Pet Shop",
    emoji: "🐾",
    gradiente: "from-emerald-500 via-teal-500 to-cyan-600",
    seloBg: "bg-emerald-800",
    Icone: IconePetshop,
  },
  generico: {
    id: "generico",
    nome: "Outro / Genérico",
    emoji: "⭐",
    gradiente: "from-violet-600 via-purple-600 to-fuchsia-600",
    seloBg: "bg-violet-900",
    Icone: IconeGenerico,
  },
};

export function getTema(id?: string | null): Tema {
  return TEMAS[(id as TemaId) ?? "generico"] ?? TEMAS.generico;
}

export const LISTA_TEMAS = Object.values(TEMAS);
