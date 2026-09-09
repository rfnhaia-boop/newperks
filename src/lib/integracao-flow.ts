import { randomBytes, createHash, timingSafeEqual } from "crypto";

const PREFIXO = "npflow_";

/** Gera uma chave nova pro lojista colar na configuração do Flow. Só é mostrada uma vez. */
export function gerarChaveIntegracao() {
  return PREFIXO + randomBytes(24).toString("base64url");
}

export function hashChave(chave: string) {
  return createHash("sha256").update(chave).digest("hex");
}

export function chaveConfere(recebida: string, hashSalvo: string) {
  const a = Buffer.from(hashChave(recebida));
  const b = Buffer.from(hashSalvo);
  return a.length === b.length && timingSafeEqual(a, b);
}
