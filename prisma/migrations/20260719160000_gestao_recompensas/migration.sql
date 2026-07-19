ALTER TABLE "Lojista"
  ADD COLUMN "recompensaEstoque" INTEGER,
  ADD COLUMN "recompensaValidaAte" TIMESTAMP(3),
  ADD COLUMN "recompensaRegras" TEXT;

CREATE TABLE "Resgate" (
  "id" TEXT NOT NULL,
  "lojistaId" TEXT NOT NULL,
  "cartaoId" TEXT NOT NULL,
  "recompensa" TEXT NOT NULL,
  "estoqueAntes" INTEGER,
  "estoqueDepois" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Resgate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Resgate_lojistaId_createdAt_idx" ON "Resgate"("lojistaId", "createdAt");
CREATE INDEX "Resgate_cartaoId_createdAt_idx" ON "Resgate"("cartaoId", "createdAt");
ALTER TABLE "Resgate" ADD CONSTRAINT "Resgate_lojistaId_fkey" FOREIGN KEY ("lojistaId") REFERENCES "Lojista"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Resgate" ADD CONSTRAINT "Resgate_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "Cartao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
