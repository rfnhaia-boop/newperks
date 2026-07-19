import Link from "next/link";
import { cookies } from "next/headers";
import { cookieCarteira, validarTokenCarteira } from "@/lib/carteira-session";
import { prisma } from "@/lib/prisma";
import CarteiraAcessoForm from "./CarteiraAcessoForm";
import ConvitesCarteira from "./ConvitesCarteira";
import CartaoFidelidadeCard from "./CartaoFidelidadeCard";

export default async function CarteiraPage({ searchParams }: { searchParams: Promise<{ acesso?: string; email?: string }> }) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
  const sessao = validarTokenCarteira(cookieStore.get(cookieCarteira)?.value);

  if (!sessao) return <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:py-16"><div className="absolute inset-0 bg-zinc-950"><img src="/hero-bg.png" alt="" className="h-full w-full scale-105 object-cover opacity-70" /><div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/10" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" /></div><div className="relative z-10 mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-[1fr_430px] lg:items-center"><div className="px-2 sm:px-6"><Link href="/" className="text-sm font-black uppercase tracking-[.25em] text-white/50 transition hover:text-white">NewPerks</Link><p className="mt-14 text-sm font-bold uppercase tracking-[.2em] text-[#e9ff65]">Uma conta. Todos os seus lugares.</p><h1 className="mt-4 max-w-xl text-5xl font-black leading-[.95] tracking-[-.04em] text-white sm:text-7xl">Fidelidade que cabe na sua rotina.</h1><p className="mt-7 max-w-md text-base leading-relaxed text-zinc-400">Barbearia, café, pizzaria, clínica: cada negócio mantém seu cartão, e você não precisa lembrar de vários links.</p></div><div><CarteiraAcessoForm expirado={params.acesso === "expirado"} emailInicial={params.email} /></div></div></main>;

  const cliente = await prisma.cliente.findUnique({ where: { id: sessao.clienteId }, include: { cartoes: { include: { lojista: { include: { campanhas: { where: { ativa: true }, take: 2, orderBy: { destaque: "desc" } } } } }, orderBy: { updatedAt: "desc" } } } });
  if (!cliente) return <main className="min-h-screen bg-zinc-950 p-10"><CarteiraAcessoForm /></main>;
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3001";
  const convites = cliente.cartoes.map((cartao) => ({ nome: cartao.lojista.nomeNegocio, url: `${base}/c/${cartao.lojista.slug}?ref=${cartao.codigoIndicacao}` }));

  return (
    <main className="relative h-screen overflow-hidden px-4 py-6 text-white sm:py-8 flex flex-col">
      {/* Background Liquid Glass */}
      <div className="absolute inset-0 z-0 bg-zinc-950">
        <img src="/liquid-carteira-bg.png" alt="" className="h-full w-full object-cover opacity-60 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl flex flex-col h-full">
        <header className="flex-none flex items-start justify-between gap-5">
          <div>
            <Link href="/" className="text-xs font-black uppercase tracking-[.2em] text-white/50 transition hover:text-white">NewPerks</Link>
            <h1 className="mt-3 text-3xl font-black tracking-[-.05em] sm:text-4xl text-white drop-shadow-md">Olá, {cliente.nome.split(" ")[0]}.</h1>
            <p className="mt-1 text-sm text-zinc-300">Seus cartões de fidelidade, juntos.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/descobrir" className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20 backdrop-blur-md">Descobrir ofertas</Link>
            <form action="/carteira/sair" method="post"><button className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/70 transition hover:border-white hover:text-white backdrop-blur-md">Sair</button></form>
          </div>
        </header>

        {/* Layout Dividido no Desktop */}
        <div className="mt-8 flex-1 lg:grid lg:grid-cols-12 lg:gap-8 lg:overflow-hidden">
          
          {/* Coluna Esquerda: Resumo, Convites, Ofertas */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:overflow-y-auto lg:pr-2 hide-scrollbar pb-8 lg:pb-0">
            {/* Resumo da Carteira */}
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Sua carteira</p>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <h2 className="max-w-[280px] text-2xl font-black tracking-[-.045em] sm:text-3xl">{cliente.cartoes.length === 0 ? "Seu primeiro cartão está esperando por você." : `${cliente.cartoes.length} ${cliente.cartoes.length === 1 ? "lugar faz" : "lugares fazem"} parte da sua rotina.`}</h2>
              </div>
            </section>

            {convites.length > 0 && <ConvitesCarteira cartoes={convites} />}

            {/* Banner Vantagens (Liquid Glass) */}
            <section className="relative overflow-hidden rounded-[2rem] border border-white/10 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <img src="/liquid-banner-bg.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
              <div className="relative z-10 flex flex-col items-start gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.18em] text-white/80 drop-shadow-md">Mais vantagens</p>
                  <h2 className="mt-2 text-xl font-black tracking-[-.04em] sm:text-2xl text-white drop-shadow-lg">Seu próximo cartão está a poucos minutos.</h2>
                </div>
                <Link href="/descobrir" className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black">Ver ofertas →</Link>
              </div>
            </section>
          </div>

          {/* Coluna Direita: Cartões de Fidelidade */}
          <div className="lg:col-span-7 mt-6 lg:mt-0 lg:overflow-y-auto lg:pl-2 hide-scrollbar pb-16 lg:pb-8">
            <section className="grid gap-4 sm:grid-cols-2">
              {cliente.cartoes.map((cartao) => (
                <CartaoFidelidadeCard key={cartao.id} cartao={cartao} />
              ))}
            </section>
          </div>

        </div>
      </div>
    </main>
  );
}
