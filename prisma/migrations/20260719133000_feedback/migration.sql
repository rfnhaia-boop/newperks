ALTER TABLE "Lojista" ADD COLUMN "googleReviewUrl" TEXT;
ALTER TABLE "Lojista" ADD COLUMN "seloPorFeedback" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "Feedback" (
  "id" TEXT NOT NULL,
  "lojistaId" TEXT NOT NULL,
  "cartaoId" TEXT NOT NULL,
  "nota" INTEGER NOT NULL,
  "comentario" TEXT,
  "seloBonusConcedido" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Feedback_cartaoId_key" ON "Feedback"("cartaoId");
CREATE INDEX "Feedback_lojistaId_createdAt_idx" ON "Feedback"("lojistaId", "createdAt");
CREATE INDEX "Feedback_lojistaId_nota_idx" ON "Feedback"("lojistaId", "nota");
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_lojistaId_fkey" FOREIGN KEY ("lojistaId") REFERENCES "Lojista"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "Cartao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
