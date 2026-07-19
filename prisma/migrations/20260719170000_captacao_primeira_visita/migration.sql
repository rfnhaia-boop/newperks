ALTER TABLE "Lojista"
  ADD COLUMN "ofertaPrimeiraVisita" TEXT,
  ADD COLUMN "ofertaPrimeiraVisitaAtiva" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "ofertaPrimeiraVisitaRegras" TEXT;

ALTER TABLE "Cartao"
  ADD COLUMN "origemCadastro" TEXT,
  ADD COLUMN "ofertaPrimeiraVisita" TEXT,
  ADD COLUMN "ofertaPrimeiraVisitaUsada" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Cartao_lojistaId_origemCadastro_idx" ON "Cartao"("lojistaId", "origemCadastro");
