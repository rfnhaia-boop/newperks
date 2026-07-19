import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";

const PEPPER = process.env.CARTEIRA_OTP_SECRET ?? process.env.CARTEIRA_SESSION_SECRET ?? process.env.NEXTAUTH_SECRET;

function segredo() {
  if (!PEPPER) throw new Error("Defina CARTEIRA_OTP_SECRET, CARTEIRA_SESSION_SECRET ou NEXTAUTH_SECRET.");
  return PEPPER;
}

export function criarCodigoAcesso() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashCodigoAcesso(codigo: string) {
  return createHmac("sha256", segredo()).update(codigo).digest("hex");
}

export function codigoConfere(codigo: string, hash: string) {
  const esperado = Buffer.from(hashCodigoAcesso(codigo));
  const recebido = Buffer.from(hash);
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}

export function novoCodigoIndicacao() {
  return randomBytes(12).toString("base64url");
}

export function hashIp(req: NextRequest) {
  const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconhecido";
  return createHash("sha256").update(`${segredo()}:${ip}`).digest("hex");
}
