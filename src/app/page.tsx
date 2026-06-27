import CartaoSelos from "@/components/CartaoSelos";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Topo */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="text-xl font-bold text-violet-400">NewPerks</span>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm text-zinc-300 transition hover:text-white">
            Entrar
          </a>
          <a
            href="/registro"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium transition hover:bg-violet-500"
          >
            Criar conta
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="inline-block rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-300">
            Sem app • Sem papel • Só QR code
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            Cartão fidelidade{" "}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              digital
            </span>{" "}
            pro seu negócio
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Seu cliente escaneia o QR code, junta selos a cada compra e ganha
            recompensas. Você acompanha tudo num painel simples.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/registro"
              className="rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500"
            >
              Começar grátis
            </a>
            <a
              href="/login"
              className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-200 transition hover:bg-zinc-900"
            >
              Já tenho conta
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 blur-2xl" />
          <div className="relative">
            <CartaoSelos
              tema="cafe"
              nomeNegocio="Café da Esquina"
              nomeCliente="Maria Silva"
              selos={7}
              selosParaGanhar={10}
              recompensa="1 café grátis"
              resgates={2}
            />
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-center text-2xl font-bold">Como funciona</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { n: "1", t: "Cliente escaneia", d: "Aponta a câmera no QR code do balcão. Sem baixar app." },
            { n: "2", t: "Junta selos", d: "A cada compra, o atendente carimba um selo no cartão digital." },
            { n: "3", t: "Ganha recompensa", d: "Completou o cartão? Resgata o prêmio na hora." },
          ].map((p) => (
            <div key={p.n} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 font-bold">
                {p.n}
              </div>
              <h3 className="mt-4 font-bold">{p.t}</h3>
              <p className="mt-1 text-sm text-zinc-400">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Temas */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-center text-2xl font-bold">Pro seu tipo de negócio</h2>
        <p className="mt-2 text-center text-zinc-400">
          Cada negócio tem seu visual. Escolha e personalize.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <CartaoSelos tema="barbearia" nomeNegocio="Barbearia do Zé" selos={4} selosParaGanhar={10} recompensa="1 corte grátis" compacto />
          <CartaoSelos tema="dentista" nomeNegocio="Clínica Sorriso" selos={2} selosParaGanhar={5} recompensa="Limpeza grátis" compacto />
          <CartaoSelos tema="sorveteria" nomeNegocio="Gelato Bom" selos={6} selosParaGanhar={8} recompensa="Casquinha grátis" compacto />
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h2 className="text-3xl font-bold">Pronto pra fidelizar mais clientes?</h2>
        <a
          href="/registro"
          className="mt-6 inline-block rounded-xl bg-violet-600 px-8 py-3 font-semibold transition hover:bg-violet-500"
        >
          Criar minha conta grátis
        </a>
      </section>

      <footer className="border-t border-zinc-900 py-6 text-center text-sm text-zinc-600">
        NewPerks — cartão fidelidade digital
      </footer>
    </main>
  );
}
