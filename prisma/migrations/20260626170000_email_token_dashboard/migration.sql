-- Lojista: ticket médio (faturamento estimado)
ALTER TABLE "Lojista" ADD COLUMN "ticketMedio" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Cliente: email como identificador, telefone opcional
DROP INDEX IF EXISTS "Cliente_telefone_key";
ALTER TABLE "Cliente" ALTER COLUMN "telefone" DROP NOT NULL;
ALTER TABLE "Cliente" ADD COLUMN "email" TEXT;
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- Cartao: token de acesso pessoal + contador de carimbos
ALTER TABLE "Cartao" ADD COLUMN "token" TEXT NOT NULL;
ALTER TABLE "Cartao" ADD COLUMN "totalCarimbos" INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX "Cartao_token_key" ON "Cartao"("token");
