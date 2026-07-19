import { NextRequest, NextResponse } from "next/server";
import { cookieCarteira, criarTokenCarteira, validarTokenCarteira } from "@/lib/carteira-session";

const TRINTA_DIAS = 30 * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const sessao = validarTokenCarteira(req.nextUrl.searchParams.get("token"));
  const destino = new URL(sessao ? "/carteira" : "/carteira?acesso=expirado", req.url);
  const resposta = NextResponse.redirect(destino);

  if (sessao) {
    resposta.cookies.set(cookieCarteira, criarTokenCarteira(sessao.clienteId, TRINTA_DIAS), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: TRINTA_DIAS / 1000,
    });
  }

  return resposta;
}
