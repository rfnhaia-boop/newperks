import { NextRequest, NextResponse } from "next/server";
import { criarCodigoAcesso, hashCodigoAcesso, hashIp } from "@/lib/acesso-carteira";
import { enviarCodigoCarteira } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const DEZ_MINUTOS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, { max: 5, windowSec: 60 });
  if (blocked) return blocked;

  const { email } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !/.+@.+\..+/.test(email.trim())) {
    return NextResponse.json({ error: "Digite um e-mail válido." }, { status: 400 });
  }

  const cliente = await prisma.cliente.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, nome: true, email: true },
  });

  if (!cliente?.email) return NextResponse.json({ ok: true });

  const codigo = criarCodigoAcesso();
  await prisma.$transaction([
    prisma.codigoAcessoCarteira.upsert({
      where: { clienteId: cliente.id },
      create: { clienteId: cliente.id, codigoHash: hashCodigoAcesso(codigo), expiraEm: new Date(Date.now() + DEZ_MINUTOS) },
      update: { codigoHash: hashCodigoAcesso(codigo), expiraEm: new Date(Date.now() + DEZ_MINUTOS), tentativas: 0, createdAt: new Date() },
    }),
    prisma.eventoSeguranca.create({ data: { clienteId: cliente.id, tipo: "codigo_carteira_solicitado", ipHash: hashIp(req) } }),
  ]);
  const envio = await enviarCodigoCarteira({ para: cliente.email, nome: cliente.nome, codigo });

  // Ajuda somente no ambiente local; produção nunca recebe código nem link na resposta.
  const codigoTeste = process.env.NODE_ENV === "production" ? undefined : codigo;
  return NextResponse.json({ ok: true, emailEnviado: envio.enviado, codigoTeste });
}
