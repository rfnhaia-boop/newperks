-- Integração servidor-a-servidor com parceiros (ex: Flow/agendamento)
ALTER TABLE "Lojista" ADD COLUMN "integracaoFlowChaveHash" TEXT;
ALTER TABLE "Lojista" ADD COLUMN "integracaoFlowAtiva" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX "Lojista_integracaoFlowChaveHash_key" ON "Lojista"("integracaoFlowChaveHash");
