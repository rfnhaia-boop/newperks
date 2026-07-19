import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CartaoSelos from "@/components/CartaoSelos";
import GraficoBarras from "./GraficoBarras";
import CartoesCompletos from "./CartoesCompletos";

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Dias até o próximo aniversário a partir de "DD/MM" (0 = hoje) */
function diasAteAniversario(ddmm: string): number | null {
  const [d, m] = ddmm.split("/").map(Number);
  if (!d || !m || m > 12 || d > 31) return null;
  const hoje = new Date();
  const hoje0 = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  let prox = new Date(hoje.getFullYear(), m - 1, d);
  if (prox < hoje0) prox = new Date(hoje.getFullYear() + 1, m - 1, d);
  return Math.round((prox.getTime() - hoje0.getTime()) / 86400000);
}

/* Reusable glass card wrapper */
function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.04)",
        backdropFilter: "blur(20px) saturate(150%)",
        WebkitBackdropFilter: "blur(20px) saturate(150%)",
      }}
    >
      {/* Top highlight line */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {children}
    </div>
  );
}

export default async function PainelPage() {
  const session = await auth();
  const lojista = await prisma.lojista.findUnique({
    where: { id: session!.user!.id },
    select: {
      nomeNegocio: true,
      tema: true,
      selosParaGanhar: true,
      recompensa: true,
      ticketMedio: true,
    },
  });

  const cartoes = await prisma.cartao.findMany({
    where: { lojistaId: session!.user!.id },
    include: { cliente: true },
    orderBy: { updatedAt: "desc" },
  });

  // Faturamento real: soma dos valores registrados nos carimbos
  const vendas = await prisma.carimbo.aggregate({
    where: { cartao: { lojistaId: session!.user!.id }, valor: { not: null } },
    _sum: { valor: true },
    _count: { valor: true },
  });

  const goal = lojista?.selosParaGanhar ?? 10;
  const ticket = lojista?.ticketMedio ?? 0;
  const totalCarimbos = cartoes.reduce((a, c) => a + c.totalCarimbos, 0);
  const totalResgates = cartoes.reduce((a, c) => a + c.resgates, 0);

  const valorReal = vendas._sum.valor ?? 0;
  const carimbosComValor = vendas._count.valor;
  const carimbosSemValor = Math.max(0, totalCarimbos - carimbosComValor);
  // Real quando registrado + estimativa (ticket médio) pros carimbos sem valor
  const faturamento = valorReal + carimbosSemValor * ticket;
  const temValorReal = carimbosComValor > 0;

  const completos = cartoes.filter((c) => c.selos >= goal);
  const emUso = cartoes.filter((c) => c.selos > 0 && c.selos < goal);

  // Gamificação: níveis pelo total movimentado
  const NIVEIS = [
    { nome: "Começando", emoji: "🌱", meta: 0 },
    { nome: "Bronze", emoji: "🥉", meta: 1000 },
    { nome: "Prata", emoji: "🥈", meta: 2500 },
    { nome: "Ouro", emoji: "🥇", meta: 5000 },
    { nome: "Platina", emoji: "💎", meta: 10000 },
    { nome: "Diamante", emoji: "💠", meta: 25000 },
    { nome: "Lenda", emoji: "👑", meta: 50000 },
  ];
  const nivelIdx = NIVEIS.reduce((acc, n, i) => (faturamento >= n.meta ? i : acc), 0);
  const nivel = NIVEIS[nivelIdx];
  const proximoNivel = NIVEIS[nivelIdx + 1] ?? null;
  const pctNivel = proximoNivel
    ? Math.min(((faturamento - nivel.meta) / (proximoNivel.meta - nivel.meta)) * 100, 100)
    : 100;

  // Dinheiro "em jogo": selos que faltam nos cartões ativos × ticket
  const selosFaltando = cartoes.reduce((a, c) => a + Math.max(0, goal - c.selos), 0);
  const emJogo = selosFaltando * ticket;
  const valorCartaoCompleto = goal * ticket;

  // Aniversariantes dos próximos 7 dias
  const aniversariantes = cartoes
    .map((c) => ({
      nome: c.cliente.nome,
      data: c.cliente.aniversario,
      dias: c.cliente.aniversario ? diasAteAniversario(c.cliente.aniversario) : null,
    }))
    .filter((a): a is { nome: string; data: string; dias: number } => a.dias !== null && a.dias <= 7)
    .sort((a, b) => a.dias - b.dias);

  const topClientes = [...cartoes]
    .filter((c) => c.totalCarimbos > 0)
    .sort((a, b) => b.totalCarimbos - a.totalCarimbos)
    .slice(0, 5)
    .map((c) => ({ label: c.cliente.nome, valor: c.totalCarimbos }));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-300">Visão geral</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{lojista?.nomeNegocio}</h1>
          <p className="mt-1 text-sm text-zinc-400">Acompanhe e movimente seu programa de fidelidade.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <a href="/painel/resultados" className="rounded-full border border-cyan-300/25 bg-cyan-300/[.08] px-3 py-1.5 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/15">Ver resultados →</a>
          <a href="/painel/captacao" className="rounded-full border border-[#e9ff65]/25 bg-[#e9ff65]/[.08] px-3 py-1.5 text-xs font-black text-[#e9ff65] transition hover:bg-[#e9ff65]/15">Captação</a>
          <a href="/painel/automacoes" className="rounded-full border border-emerald-300/25 bg-emerald-300/[.08] px-3 py-1.5 text-xs font-black text-emerald-100 transition hover:bg-emerald-300/15">Automações</a>
          <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 sm:inline-flex">
            {cartoes.length} cliente{cartoes.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href="/painel/clientes"
          className="group rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 transition hover:-translate-y-0.5 hover:bg-violet-500/15"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500 text-lg font-bold text-white shadow-lg shadow-violet-500/20">+</span>
          <p className="mt-3 text-sm font-bold text-white">Dar selo</p>
          <p className="mt-1 text-[11px] leading-snug text-violet-200/70">Abra um cliente e registre a visita.</p>
        </a>
        <a
          href="/painel/qrcode"
          className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:bg-white/[0.07]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lg text-white">⌘</span>
          <p className="mt-3 text-sm font-bold text-white">Seu QR Code</p>
          <p className="mt-1 text-[11px] leading-snug text-zinc-500">Mostre no balcão e convide clientes.</p>
        </a>
      </div>

      {/* Onboarding — lojista novo sem clientes ainda */}
      {cartoes.length === 0 && (
        <Glass className="border-violet-500/25 p-6">
          <p className="text-lg font-bold text-white">🚀 Bem-vindo! Coloque seu cartão pra rodar em 3 passos</p>
          <div className="mt-4 space-y-3">
            <a href="/painel/config" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 transition hover:bg-white/10">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">1</span>
              <div>
                <p className="text-sm font-semibold text-white">Personalize seu cartão</p>
                <p className="text-xs text-zinc-400">Escolha o tema, a recompensa e quantos selos valem o prêmio</p>
              </div>
              <span className="ml-auto text-zinc-500">→</span>
            </a>
            <a href="/painel/qrcode" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 transition hover:bg-white/10">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">2</span>
              <div>
                <p className="text-sm font-semibold text-white">Imprima o QR code</p>
                <p className="text-xs text-zinc-400">Baixe o cartaz e cole no balcão ou no caixa</p>
              </div>
              <span className="ml-auto text-zinc-500">→</span>
            </a>
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 p-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-zinc-400">3</span>
              <div>
                <p className="text-sm font-semibold text-zinc-300">Peça pro cliente escanear</p>
                <p className="text-xs text-zinc-500">Ele se cadastra em 10 segundos — e aparece aqui pra você carimbar</p>
              </div>
            </div>
          </div>
        </Glass>
      )}

      {/* Aniversariantes da semana */}
      {aniversariantes.length > 0 && (
        <Glass className="border-pink-500/20 p-4">
          <p className="text-sm font-semibold text-pink-300">
            🎂 Aniversariante{aniversariantes.length !== 1 ? "s" : ""} da semana
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {aniversariantes.map((a) => (
              <span
                key={a.nome + a.data}
                className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-xs text-pink-200"
              >
                {a.nome} — {a.dias === 0 ? "HOJE! 🎉" : a.dias === 1 ? "amanhã" : `em ${a.dias} dias`} ({a.data})
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Manda um mimo ou desconto — aniversariante fidelizado volta o ano todo.
          </p>
        </Glass>
      )}

      {/* Linha 1 — cartão + métricas principais */}
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <CartaoSelos
          tema={lojista?.tema ?? "generico"}
          nomeNegocio={lojista?.nomeNegocio ?? ""}
          selos={Math.min(3, goal)}
          selosParaGanhar={goal}
          recompensa={lojista?.recompensa ?? ""}
          nomeCliente="Cliente exemplo"
          compacto
        />

        <div className="flex flex-col gap-4">
          <Glass className="border-violet-500/20 p-5">
            <p className="text-xs uppercase tracking-wider text-violet-300/80">
              {temValorReal ? "Faturamento" : "Faturamento estimado"}
            </p>
            <p className="mt-1 text-4xl font-extrabold text-white">{moeda(faturamento)}</p>
            <p className="mt-1 text-xs text-zinc-400">
              {temValorReal
                ? `${moeda(valorReal)} registrado em ${carimbosComValor} venda${carimbosComValor !== 1 ? "s" : ""}` +
                  (carimbosSemValor > 0 && ticket > 0
                    ? ` + ${carimbosSemValor} × ${moeda(ticket)} (ticket médio)`
                    : "")
                : ticket > 0
                  ? `${totalCarimbos} compras × ${moeda(ticket)}`
                  : "defina o ticket médio em Configurar"}
            </p>
          </Glass>
          <div className="grid grid-cols-2 gap-4">
            <Glass className="p-5">
              <p className="text-xs uppercase tracking-wider text-zinc-400">Clientes</p>
              <p className="mt-1 text-3xl font-bold">{cartoes.length}</p>
            </Glass>
            <Glass className="p-5">
              <p className="text-xs uppercase tracking-wider text-zinc-400">Carimbos dados</p>
              <p className="mt-1 text-3xl font-bold">{totalCarimbos}</p>
            </Glass>
          </div>
        </div>
      </div>

      {/* Potencial do programa — gamificação pro lojista */}
      {ticket > 0 && (
        <Glass className="border-amber-500/15 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-amber-300/80">Potencial do programa</p>
              <p className="mt-1 text-sm text-zinc-300">
                Cada cartão completo movimenta{" "}
                <strong className="text-white">{moeda(valorCartaoCompleto)}</strong>
                <span className="text-zinc-500"> ({goal} compras × {moeda(ticket)})</span>
              </p>
              {emJogo > 0 && (
                <p className="mt-1 text-sm text-zinc-300">
                  🔥 <strong className="text-amber-300">{moeda(emJogo)}</strong> em compras a caminho nos{" "}
                  {cartoes.length} cartõe{cartoes.length !== 1 ? "s" : ""} ativos
                </p>
              )}
            </div>
            <div className="text-center">
              <span className="text-4xl">{nivel.emoji}</span>
              <p className="mt-0.5 text-xs font-bold text-white">{nivel.nome}</p>
            </div>
          </div>

          {/* Barra até o próximo nível */}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              {proximoNivel ? (
                <>
                  <span className="text-zinc-400">
                    Próximo nível: {proximoNivel.emoji} <strong className="text-white">{proximoNivel.nome}</strong>
                  </span>
                  <span className="text-zinc-500">
                    falta {moeda(Math.max(0, proximoNivel.meta - faturamento))}
                  </span>
                </>
              ) : (
                <span className="font-semibold text-amber-300">👑 Nível máximo — seu programa é lenda!</span>
              )}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-700"
                style={{ width: `${pctNivel}%` }}
              />
            </div>
            {/* Marcos */}
            <div className="mt-2 flex justify-between text-sm">
              {NIVEIS.map((n, i) => (
                <span
                  key={n.nome}
                  title={`${n.nome} — ${moeda(n.meta)}`}
                  className={i <= nivelIdx ? "" : "opacity-30 grayscale"}
                >
                  {n.emoji}
                </span>
              ))}
            </div>
          </div>
        </Glass>
      )}

      {/* Linha 2 — cartões em uso / completos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Glass className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-300">Cartões em uso</p>
            <span className="text-2xl font-bold text-sky-400">{emUso.length}</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Clientes juntando selos agora
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-sky-500/80"
              style={{
                width: `${cartoes.length ? (emUso.length / cartoes.length) * 100 : 0}%`,
              }}
            />
          </div>
        </Glass>

        <Glass className="border-emerald-500/15 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-300">Cartões completos</p>
            <span className="text-2xl font-bold text-emerald-400">{completos.length}</span>
          </div>
          <p className="mb-3 mt-1 text-xs text-zinc-500">Aguardando resgate da recompensa</p>
          <CartoesCompletos
            completos={completos.map((c) => ({ clienteId: c.clienteId, nome: c.cliente.nome }))}
          />
        </Glass>
      </div>

      {/* Linha 3 — gráfico + recompensas */}
      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <Glass className="p-5">
          <p className="mb-4 text-sm font-semibold text-zinc-300">
            🏆 Clientes mais ativos
          </p>
          <GraficoBarras
            itens={topClientes}
            corBarra="bg-gradient-to-r from-violet-600 to-fuchsia-500"
            sufixo=" compras"
            vazio="Os clientes mais fiéis aparecem aqui"
          />
        </Glass>

        <Glass className="p-5">
          <p className="text-sm font-semibold text-zinc-300">Recompensas entregues</p>
          <p className="mt-2 text-5xl font-extrabold text-white">{totalResgates}</p>
          <p className="mt-1 text-xs text-zinc-500">desde o início</p>
        </Glass>
      </div>
    </div>
  );
}
