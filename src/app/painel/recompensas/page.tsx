import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RecompensasManager from "./RecompensasManager";

export default async function RecompensasPage() {
  const session = await auth(); const lojistaId = session!.user!.id;
  const [lojista, resgates] = await Promise.all([
    prisma.lojista.findUnique({ where: { id: lojistaId }, select: { recompensa: true, recompensaEstoque: true, recompensaValidaAte: true, recompensaRegras: true } }),
    prisma.resgate.findMany({ where: { lojistaId }, orderBy: { createdAt: "desc" }, take: 12, include: { cartao: { include: { cliente: { select: { nome: true } } } } } }),
  ]);
  return <div className="mx-auto max-w-6xl space-y-7 pb-8"><header><p className="text-xs font-black uppercase tracking-[.2em] text-amber-200">Gestão de recompensas</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Seu prêmio, sob controle.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Defina disponibilidade e validade. Cada entrega confirmada entra no histórico automaticamente.</p></header><RecompensasManager inicial={{ recompensa: lojista?.recompensa ?? "1 item grátis", recompensaEstoque: lojista?.recompensaEstoque ?? null, recompensaValidaAte: lojista?.recompensaValidaAte ?? null, recompensaRegras: lojista?.recompensaRegras ?? null }} resgates={resgates} /></div>;
}
