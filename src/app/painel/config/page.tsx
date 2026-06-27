import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ConfigForm from "./ConfigForm";

export default async function ConfigPage() {
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Personalize o cartão de fidelidade do seu negócio
        </p>
      </div>
      <ConfigForm
        inicial={{
          nomeNegocio: lojista?.nomeNegocio ?? "",
          tema: lojista?.tema ?? "generico",
          selosParaGanhar: lojista?.selosParaGanhar ?? 10,
          recompensa: lojista?.recompensa ?? "",
          ticketMedio: lojista?.ticketMedio ?? 0,
        }}
      />
    </div>
  );
}
