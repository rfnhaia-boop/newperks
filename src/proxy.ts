import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLogado = !!req.auth;
  const isPainel = req.nextUrl.pathname.startsWith("/painel");

  if (isPainel && !isLogado) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/painel/:path*"],
};
