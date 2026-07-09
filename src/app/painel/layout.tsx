import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PainelNav from "./PainelNav";
import BackgroundFidelix from "@/components/BackgroundFidelix";
import Toaster from "@/components/Toaster";
import { LogOut, Star } from "lucide-react";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const lojista = await prisma.lojista.findUnique({
    where: { id: session.user!.id },
    select: { tema: true },
  });

  const iniciais = session.user?.name
    ?.split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "?";

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white font-sans">
      {/* Dynamic themed background — changes per lojista theme */}
      <BackgroundFidelix temaId={lojista?.tema} />

      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          
          {/* Logo */}
          <div className="flex shrink-0 items-center gap-3 w-48">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 font-bold shadow-lg shadow-violet-500/20">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none tracking-tight text-zinc-100">NewPerks</span>
              <span className="mt-1 truncate text-xs font-medium text-violet-400">{session.user?.name}</span>
            </div>
          </div>

          {/* Nav centralizada */}
          <div className="flex flex-1 justify-center">
            <PainelNav />
          </div>

          {/* Direita: avatar + sair */}
          <div className="flex shrink-0 items-center gap-4 w-48 justify-end">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-zinc-300 ring-2 ring-white/10 shadow-inner">
              {iniciais}
            </div>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
              <button
                type="submit"
                className="group flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 transition-all hover:bg-red-500/10 hover:text-red-400"
              >
                <span className="hidden sm:inline">Sair</span>
                <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-10">{children}</main>
      <Toaster />
    </div>
  );
}
