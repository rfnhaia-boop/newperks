-- Idempotência do provisionamento automático (Flow -> NewPerks)
ALTER TABLE "Lojista" ADD COLUMN "flowBarberProfileId" TEXT;
CREATE UNIQUE INDEX "Lojista_flowBarberProfileId_key" ON "Lojista"("flowBarberProfileId");
