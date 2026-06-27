import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CartaoSelos from "@/components/CartaoSelos";
import GraficoBarras from "./GraficoBarras";
import CartoesCompletos from "./CartoesCompletos";

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

  const goal = lojista?.selosParaGanhar ?? 10;
  const ticket = lojista?.ticketMedio ?? 0;
  const totalCarimbos = cartoes.reduce((a, c) => a + c.totalCarimbos, 0);
  const totalResgates = cartoes.reduce((a, c) => a + c.resgates, 0);
  const faturamento = totalCarimbos * ticket;

  const completos = cartoes.filter((c) => c.selos >= goal);
  const emUso = cartoes.filter((c) => c.selos > 0 && c.selos < goal);

  const topClientes = [...cartoes]
    .filter((c) => c.totalCarimbos > 0)
    .sort((a, b) => b.totalCarimbos - a.totalCarimbos)
    .slice(0, 5)
    .map((c) => ({ label: c.cliente.nome, valor: c.totalCarimbos }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{lojista?.nomeNegocio}</h1>
        <p className="mt-1 text-sm text-zinc-400">Visão geral do seu programa de fidelidade</p>
      </div>

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
          <div className="rounded-2xl border border-violet-500/40 bg-gradient-to-br from-violet-600/25 to-fuchsia-600/10 p-5">
            <p className="text-xs uppercase tracking-wider text-violet-300/80">
              Faturamento estimado
            </p>
            <p className="mt-1 text-4xl font-extrabold text-white">{moeda(faturamento)}</p>
            <p className="mt-1 text-xs text-zinc-400">
              {ticket > 0
                ? `${totalCarimbos} compras × ${moeda(ticket)}`
                : "defina o ticket médio em Configurar"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-xs uppercase tracking-wider text-zinc-400">Clientes</p>
              <p className="mt-1 text-3xl font-bold">{cartoes.length}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-xs uppercase tracking-wider text-zinc-400">Carimbos dados</p>
              <p className="mt-1 text-3xl font-bold">{totalCarimbos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Linha 2 — cartões em uso / completos */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-300">Cartões em uso</p>
            <span className="text-2xl font-bold text-sky-400">{emUso.length}</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Clientes juntando selos agora
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-sky-500"
              style={{
                width: `${cartoes.length ? (emUso.length / cartoes.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-700/40 bg-emerald-900/10 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-300">Cartões completos</p>
            <span className="text-2xl font-bold text-emerald-400">{completos.length}</span>
          </div>
          <p className="mb-3 mt-1 text-xs text-zinc-500">Aguardando resgate da recompensa</p>
          <CartoesCompletos
            completos={completos.map((c) => ({ clienteId: c.clienteId, nome: c.cliente.nome }))}
          />
        </div>
      </div>

      {/* Linha 3 — gráfico + recompensas */}
      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-4 text-sm font-semibold text-zinc-300">
            🏆 Clientes mais ativos
          </p>
          <GraficoBarras
            itens={topClientes}
            corBarra="bg-gradient-to-r from-violet-600 to-fuchsia-500"
            sufixo=" compras"
            vazio="Os clientes mais fiéis aparecem aqui"
          />
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm font-semibold text-zinc-300">Recompensas entregues</p>
          <p className="mt-2 text-5xl font-extrabold text-white">{totalResgates}</p>
          <p className="mt-1 text-xs text-zinc-500">desde o início</p>
        </div>
      </div>
    </div>
  );
}
