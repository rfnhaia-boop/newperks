import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CampanhaDescobrirCard from "./CampanhaDescobrirCard";

export default async function DescobrirPage({ searchParams }: { searchParams: Promise<{ cidade?: string }> }) {
  const { cidade: busca = "" } = await searchParams;
  const cidade = busca.trim().slice(0, 80);
  const agora = new Date();
  const campanhas = await prisma.campanha.findMany({
    where: { ativa: true, AND: [{ OR: [{ iniciaEm: null }, { iniciaEm: { lte: agora } }] }, { OR: [{ terminaEm: null }, { terminaEm: { gte: agora } }] }], ...(cidade ? { lojista: { cidade: { equals: cidade, mode: "insensitive" }, ativo: true } } : { lojista: { ativo: true } }) },
    include: { lojista: { select: { nomeNegocio: true, slug: true, tema: true, cidade: true } } }, orderBy: [{ destaque: "desc" }, { createdAt: "desc" }],
  });
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 text-white sm:py-8 flex flex-col">
      {/* Background Liquid Glass */}
      <div className="absolute inset-0 z-0 bg-zinc-950">
        <img src="/liquid-carteira-bg.png" alt="" className="h-full w-full object-cover opacity-60 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl flex flex-col">
        <header className="flex-none flex items-center justify-between">
          <Link href="/carteira" className="text-xs font-black uppercase tracking-[.2em] text-white/55 transition hover:text-white">← Minha carteira</Link>
          <Link href="/" className="text-xs font-black uppercase tracking-[.2em] text-white/50 transition hover:text-white">NewPerks</Link>
        </header>

        {/* Header Panorâmico de Busca */}
        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[.18em] text-[#e9ff65] drop-shadow-md">Descubra perto de você</p>
            <h1 className="mt-2 sm:mt-3 text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-[-.05em] drop-shadow-lg hidden sm:block">Cartões que valem a próxima visita.</h1>
            <p className="mt-2 sm:mt-4 max-w-xl text-xs sm:text-sm leading-6 text-zinc-300 drop-shadow-md hidden sm:block">Escolha uma campanha, libere o cartão e guarde a oferta na sua carteira.</p>
          </div>
          
          <form className="w-full md:max-w-md rounded-2xl border border-white/10 bg-black/40 p-3 shadow-inner backdrop-blur-sm">
            <label className="px-1 text-xs font-bold text-white/60" htmlFor="cidade">Em qual cidade você está?</label>
            <div className="mt-2 flex gap-2">
              <input id="cidade" name="cidade" defaultValue={cidade} placeholder="Ex: Jundiaí" className="min-w-0 w-full flex-1 rounded-xl bg-white/10 px-3 py-3 text-sm font-bold text-white outline-none placeholder:text-white/35 transition focus:bg-white/20 focus:ring-2 focus:ring-[#e9ff65]/50" />
              <button className="rounded-xl bg-[#e9ff65] px-5 py-3 text-sm font-black text-zinc-950 transition hover:bg-[#f3ff9d] hover:shadow-[0_0_15px_rgba(233,255,101,0.5)]">Buscar</button>
            </div>
          </form>
        </section>

        <div className="mt-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-white/45">{cidade ? `Ofertas em ${cidade}` : "Todas as ofertas"}</p>
            <h2 className="mt-1 text-xl sm:text-3xl font-black tracking-[-.04em]">{campanhas.length} oportunidades para conhecer.</h2>
          </div>
          {cidade && <Link href="/descobrir" className="text-sm font-bold text-white/60 underline transition hover:text-white">Limpar</Link>}
        </div>

        {/* Grade de Ofertas Interativa */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-16">
          {campanhas.map((c) => (
            <CampanhaDescobrirCard key={c.id} campanha={c as any} />
          ))}
        </section>
      </div>
    </main>
  );
}
