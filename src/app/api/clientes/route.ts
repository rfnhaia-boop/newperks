import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const busca = searchParams.get("busca") ?? "";

  const cartoes = await prisma.cartao.findMany({
    where: {
      lojistaId: session.user.id,
      cliente: busca
        ? {
            OR: [
              { nome: { contains: busca, mode: "insensitive" } },
              { telefone: { contains: busca } },
            ],
          }
        : undefined,
    },
    include: { cliente: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(cartoes);
}
