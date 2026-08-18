import { NextRequest, NextResponse } from "next/server";
import { hashIp } from "@/lib/acesso-carteira";
import { cookieCarteira, criarTokenCarteira } from "@/lib/carteira-session";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const TRINTA_DIAS = 30 * 24 * 60 * 60 * 1000;

type GoogleTokenInfo = {
  aud?: string;
  email?: string;
  email_verified?: string;
  exp?: string;
};

export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, { max: 10, windowSec: 60 });
  if (blocked) return blocked;

  const { idToken } = await req.json().catch(() => ({}));
  if (typeof idToken !== "string" || !idToken) {
    return NextResponse.json({ error: "Token do Google ausente." }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Login com Google não está configurado." }, { status: 503 });
  }

  let info: GoogleTokenInfo;
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!res.ok) throw new Error("token inválido");
    info = await res.json();
  } catch {
    return NextResponse.json({ error: "Não foi possível validar o Google. Tente de novo." }, { status: 401 });
  }

  if (info.aud !== clientId || info.email_verified !== "true" || !info.email) {
    return NextResponse.json({ error: "Token do Google inválido." }, { status: 401 });
  }

  const cliente = await prisma.cliente.findUnique({
    where: { email: info.email.trim().toLowerCase() },
    select: { id: true },
  });

  if (!cliente) {
    return NextResponse.json(
      { error: "Nenhum cartão encontrado com esse e-mail. Escaneie o QR code de um estabelecimento pra criar o seu." },
      { status: 404 }
    );
  }

  await prisma.eventoSeguranca.create({
    data: { clienteId: cliente.id, tipo: "carteira_autenticada_google", ipHash: hashIp(req) },
  });

  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(cookieCarteira, criarTokenCarteira(cliente.id, TRINTA_DIAS), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: TRINTA_DIAS / 1000,
  });
  return resposta;
}
