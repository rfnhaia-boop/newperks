import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ClientesList from "../ClientesList";
import Link from "next/link";

export default async function ClientesPage() {
  const session = await auth();
  const lojista = await prisma.lojista.findUnique({
    where: { id: session!.user!.id },
    select: { tema: true, selosParaGanhar: true },
  });

  const cartoes = await prisma.cartao.findMany({
    where: { lojistaId: session!.user!.id },
    include: { cliente: true, carimbos: { orderBy: { createdAt: "desc" }, take: 20 }, feedback: true, campanhaOrigem: { select: { titulo: true } }, indicador: { include: { cliente: { select: { nome: true } } } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {cartoes.length} cliente{cartoes.length !== 1 ? "s" : ""} • carimbe ou entregue
          recompensas
        </p>
        <Link href="/painel/fidelidade" className="mt-3 inline-flex rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-xs font-bold text-[#e9ff65] transition hover:border-[#e9ff65]/50">Ver clientes VIP e indicações →</Link>
      </div>
      <ClientesList
        cartoes={cartoes}
        tema={lojista?.tema ?? "generico"}
        selosParaGanhar={lojista?.selosParaGanhar ?? 10}
      />
    </div>
  );
}
