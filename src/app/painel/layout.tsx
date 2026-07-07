import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PainelNav from "./PainelNav";
import BackgroundFidelix from "@/components/BackgroundFidelix";
import Toaster from "@/components/Toaster";

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
    <div className="relative min-h-screen bg-zinc-950 text-white">
      {/* Dynamic themed background — changes per lojista theme */}
      <BackgroundFidelix temaId={lojista?.tema} />

      <header className="sticky top-0 z-50 border-b border-white/10"
        style={{
          background: "rgba(9, 9, 11, 0.6)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
          {/* Logo */}
          <div className="flex min-w-0 shrink-0 flex-col">
            <span className="text-lg font-bold leading-none text-violet-400">NewPerks</span>
            <span className="mt-0.5 truncate text-xs text-zinc-500">{session.user?.name}</span>
          </div>

          {/* Nav centralizada */}
          <div className="flex flex-1 justify-center">
            <PainelNav />
          </div>

          {/* Direita: avatar + sair */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600/20 text-xs font-bold text-violet-300 ring-1 ring-violet-500/30">
              {iniciais}
            </div>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-8">{children}</main>
      <Toaster />
    </div>
  );
}
