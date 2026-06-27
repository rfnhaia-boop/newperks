import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import PainelNav from "./PainelNav";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const iniciais = session.user?.name
    ?.split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md">
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
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
