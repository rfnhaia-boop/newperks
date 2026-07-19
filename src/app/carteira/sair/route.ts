import { NextRequest, NextResponse } from "next/server";
import { cookieCarteira } from "@/lib/carteira-session";

export async function POST(req: NextRequest) {
  const resposta = NextResponse.redirect(new URL("/carteira", req.url));
  resposta.cookies.set(cookieCarteira, "", { path: "/", maxAge: 0 });
  return resposta;
}
