ALTER TABLE "Cliente"
  ADD COLUMN "aceitaComunicacoes" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "aceitouComunicacoesEm" TIMESTAMP(3);

CREATE TABLE "Automacao" (
  "id" TEXT NOT NULL,
  "lojistaId" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "ativa" BOOLEAN NOT NULL DEFAULT false,
  "assunto" TEXT NOT NULL,
  "mensagem" TEXT NOT NULL,
  "diasInativo" INTEGER NOT NULL DEFAULT 30,
  "iniciaEm" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Automacao_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EnvioAutomacao" (
  "id" TEXT NOT NULL,
  "chave" TEXT NOT NULL,
  "lojistaId" TEXT NOT NULL,
  "clienteId" TEXT NOT NULL,
  "automacaoId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDENTE',
  "erro" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "enviadoEm" TIMESTAMP(3),
  CONSTRAINT "EnvioAutomacao_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Automacao_lojistaId_tipo_key" ON "Automacao"("lojistaId", "tipo");
CREATE INDEX "Automacao_ativa_tipo_idx" ON "Automacao"("ativa", "tipo");
CREATE UNIQUE INDEX "EnvioAutomacao_chave_key" ON "EnvioAutomacao"("chave");
CREATE INDEX "EnvioAutomacao_lojistaId_createdAt_idx" ON "EnvioAutomacao"("lojistaId", "createdAt");
CREATE INDEX "EnvioAutomacao_clienteId_createdAt_idx" ON "EnvioAutomacao"("clienteId", "createdAt");
ALTER TABLE "Automacao" ADD CONSTRAINT "Automacao_lojistaId_fkey" FOREIGN KEY ("lojistaId") REFERENCES "Lojista"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EnvioAutomacao" ADD CONSTRAINT "EnvioAutomacao_lojistaId_fkey" FOREIGN KEY ("lojistaId") REFERENCES "Lojista"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EnvioAutomacao" ADD CONSTRAINT "EnvioAutomacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EnvioAutomacao" ADD CONSTRAINT "EnvioAutomacao_automacaoId_fkey" FOREIGN KEY ("automacaoId") REFERENCES "Automacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
