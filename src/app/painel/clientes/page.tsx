import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ClientesList from "../ClientesList";

export default async function ClientesPage() {
  const session = await auth();
  const lojista = await prisma.lojista.findUnique({
    where: { id: session!.user!.id },
    select: { tema: true, selosParaGanhar: true },
  });

  const cartoes = await prisma.cartao.findMany({
    where: { lojistaId: session!.user!.id },
    include: { cliente: true },
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
      </div>
      <ClientesList
        cartoes={cartoes}
        tema={lojista?.tema ?? "generico"}
        selosParaGanhar={lojista?.selosParaGanhar ?? 10}
      />
    </div>
  );
}
