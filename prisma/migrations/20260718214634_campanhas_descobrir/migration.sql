-- AlterTable
ALTER TABLE "Lojista" ADD COLUMN     "cidade" TEXT;

-- CreateTable
CREATE TABLE "Campanha" (
    "id" TEXT NOT NULL,
    "lojistaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "beneficio" TEXT NOT NULL,
    "descricao" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "iniciaEm" TIMESTAMP(3),
    "terminaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campanha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Campanha_lojistaId_ativa_idx" ON "Campanha"("lojistaId", "ativa");

-- CreateIndex
CREATE INDEX "Campanha_ativa_terminaEm_idx" ON "Campanha"("ativa", "terminaEm");

-- AddForeignKey
ALTER TABLE "Campanha" ADD CONSTRAINT "Campanha_lojistaId_fkey" FOREIGN KEY ("lojistaId") REFERENCES "Lojista"("id") ON DELETE CASCADE ON UPDATE CASCADE;
