import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_CARTEIRA = "fidelix_carteira";

type SessaoCarteira = {
  clienteId: string;
  expiraEm: number;
};

function segredo() {
  const value = process.env.CARTEIRA_SESSION_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error("Defina CARTEIRA_SESSION_SECRET ou NEXTAUTH_SECRET para usar a carteira.");
  return value;
}

function assinar(value: string) {
  return createHmac("sha256", segredo()).update(value).digest("base64url");
}

export function criarTokenCarteira(clienteId: string, duracaoMs: number) {
  const conteudo = Buffer.from(
    JSON.stringify({ clienteId, expiraEm: Date.now() + duracaoMs })
  ).toString("base64url");
  return `${conteudo}.${assinar(conteudo)}`;
}

export function validarTokenCarteira(token?: string | null): SessaoCarteira | null {
  if (!token) return null;
  const [conteudo, assinatura] = token.split(".");
  if (!conteudo || !assinatura) return null;

  try {
    const esperada = Buffer.from(assinar(conteudo));
    const recebida = Buffer.from(assinatura);
    if (esperada.length !== recebida.length || !timingSafeEqual(esperada, recebida)) return null;

    const dados = JSON.parse(Buffer.from(conteudo, "base64url").toString("utf8")) as SessaoCarteira;
    if (!dados.clienteId || !Number.isFinite(dados.expiraEm) || dados.expiraEm <= Date.now()) return null;
    return dados;
  } catch {
    return null;
  }
}

export const cookieCarteira = COOKIE_CARTEIRA;
