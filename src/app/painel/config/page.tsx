import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ConfigForm from "./ConfigForm";
import { Settings } from "lucide-react";

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
      whatsapp: true,
      instagram: true,
      site: true,
      linksExtra: true,
      regras: true,
      horario: true,
      endereco: true,
      cidade: true,
      beneficioVipOuro: true,
      beneficioVipDiamante: true,
    },
  });

  // Garante que linksExtra seja um array válido para o formulário
  const linksParsed = Array.isArray(lojista?.linksExtra) ? lojista.linksExtra as { titulo: string, url: string }[] : [];

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
          <Settings className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Configurações</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Personalize o visual e as regras do seu programa de fidelidade.
          </p>
        </div>
      </div>
      
      {/* Formulário - não restringimos o max-w para que possa expandir no desktop (grid) */}
      <ConfigForm
        inicial={{
          nomeNegocio: lojista?.nomeNegocio ?? "",
          tema: lojista?.tema ?? "generico",
          selosParaGanhar: lojista?.selosParaGanhar ?? 10,
          recompensa: lojista?.recompensa ?? "",
          ticketMedio: lojista?.ticketMedio ?? 0,
          whatsapp: lojista?.whatsapp ?? "",
          instagram: lojista?.instagram ?? "",
          site: lojista?.site ?? "",
          linksExtra: linksParsed,
          regras: lojista?.regras ?? "",
          horario: lojista?.horario ?? "",
          endereco: lojista?.endereco ?? "",
          cidade: lojista?.cidade ?? "",
          beneficioVipOuro: lojista?.beneficioVipOuro ?? "",
          beneficioVipDiamante: lojista?.beneficioVipDiamante ?? "",
        }}
      />
    </div>
  );
}
