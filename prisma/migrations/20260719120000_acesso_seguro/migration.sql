-- Código público de indicação: não é a chave de acesso do cartão.
ALTER TABLE "Cartao" ADD COLUMN "codigoIndicacao" TEXT;
UPDATE "Cartao"
SET "codigoIndicacao" = substr(md5(random()::text || clock_timestamp()::text || "id"), 1, 18)
WHERE "codigoIndicacao" IS NULL;
ALTER TABLE "Cartao" ALTER COLUMN "codigoIndicacao" SET NOT NULL;
CREATE UNIQUE INDEX "Cartao_codigoIndicacao_key" ON "Cartao"("codigoIndicacao");

-- Um código ativo por cliente, com validade e contador de tentativas.
CREATE TABLE "CodigoAcessoCarteira" (
  "id" TEXT NOT NULL,
  "clienteId" TEXT NOT NULL,
  "codigoHash" TEXT NOT NULL,
  "expiraEm" TIMESTAMP(3) NOT NULL,
  "tentativas" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CodigoAcessoCarteira_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CodigoAcessoCarteira_clienteId_key" ON "CodigoAcessoCarteira"("clienteId");
CREATE INDEX "CodigoAcessoCarteira_expiraEm_idx" ON "CodigoAcessoCarteira"("expiraEm");
ALTER TABLE "CodigoAcessoCarteira" ADD CONSTRAINT "CodigoAcessoCarteira_clienteId_fkey"
  FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Auditoria mínima para tentativas de acesso, sem guardar códigos ou IP em claro.
CREATE TABLE "EventoSeguranca" (
  "id" TEXT NOT NULL,
  "clienteId" TEXT,
  "tipo" TEXT NOT NULL,
  "ipHash" TEXT,
  "dados" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventoSeguranca_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EventoSeguranca_clienteId_createdAt_idx" ON "EventoSeguranca"("clienteId", "createdAt");
CREATE INDEX "EventoSeguranca_tipo_createdAt_idx" ON "EventoSeguranca"("tipo", "createdAt");
ALTER TABLE "EventoSeguranca" ADD CONSTRAINT "EventoSeguranca_clienteId_fkey"
  FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
