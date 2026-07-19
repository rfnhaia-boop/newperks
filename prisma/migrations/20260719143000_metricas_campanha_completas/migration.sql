ALTER TABLE "Campanha" ADD COLUMN "visualizacoes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Campanha" ADD COLUMN "primeirasVisitas" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Campanha" ADD COLUMN "retornos" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Cartao" ADD COLUMN "campanhaOrigemId" TEXT;
CREATE INDEX "Cartao_campanhaOrigemId_idx" ON "Cartao"("campanhaOrigemId");
ALTER TABLE "Cartao" ADD CONSTRAINT "Cartao_campanhaOrigemId_fkey" FOREIGN KEY ("campanhaOrigemId") REFERENCES "Campanha"("id") ON DELETE SET NULL ON UPDATE CASCADE;
