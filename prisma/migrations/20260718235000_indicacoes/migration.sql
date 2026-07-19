-- Permite saber qual cliente indicou um novo cartão no mesmo negócio.
ALTER TABLE "Cartao" ADD COLUMN "indicadorId" TEXT;

CREATE INDEX "Cartao_indicadorId_idx" ON "Cartao"("indicadorId");

ALTER TABLE "Cartao"
ADD CONSTRAINT "Cartao_indicadorId_fkey"
FOREIGN KEY ("indicadorId") REFERENCES "Cartao"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
