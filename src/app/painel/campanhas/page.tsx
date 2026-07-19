import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CampanhasManager from "./CampanhasManager";

export default async function CampanhasPage() {
  const session = await auth();
  const [campanhas, lojista] = await Promise.all([
    prisma.campanha.findMany({ where: { lojistaId: session!.user!.id }, orderBy: [{ ativa: "desc" }, { destaque: "desc" }, { createdAt: "desc" }] }),
    prisma.lojista.findUnique({ where: { id: session!.user!.id }, select: { slug: true } }),
  ]);
  const adesoes = campanhas.reduce((total, campanha) => total + campanha.adesoes, 0);
  return <div className="mx-auto max-w-2xl space-y-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e9ff65]">Ofertas locais</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white">Campanhas</h1><p className="mt-2 text-sm leading-6 text-zinc-400">Transforme sua fidelidade em descoberta de novos clientes.</p></div><div className="rounded-2xl border border-[#e9ff65]/20 bg-[#e9ff65]/10 p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#e9ff65]">Novos cartões por campanha</p><p className="mt-1 text-3xl font-black text-white">{adesoes}</p></div><CampanhasManager slug={lojista?.slug ?? ""} iniciais={campanhas.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))} /></div>;
}
