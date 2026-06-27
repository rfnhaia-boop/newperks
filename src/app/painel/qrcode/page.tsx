import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QRPoster from "./QRPoster";

export default async function QRCodePage() {
  const session = await auth();
  const lojista = await prisma.lojista.findUnique({
    where: { id: session!.user!.id },
    select: { slug: true, nomeNegocio: true, tema: true, recompensa: true },
  });

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3001";
  const url = `${base}/c/${lojista?.slug}`;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Seu QR Code</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Imprima e deixe no balcão. O cliente escaneia e começa a juntar selos.
        </p>
      </div>
      <QRPoster
        url={url}
        nomeNegocio={lojista?.nomeNegocio ?? ""}
        tema={lojista?.tema ?? "generico"}
        recompensa={lojista?.recompensa ?? ""}
      />
    </div>
  );
}
