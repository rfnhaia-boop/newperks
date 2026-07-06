-- CreateTable
CREATE TABLE "Carimbo" (
    "id" TEXT NOT NULL,
    "cartaoId" TEXT NOT NULL,
    "descricao" TEXT,
    "valor" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Carimbo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Carimbo" ADD CONSTRAINT "Carimbo_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "Cartao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
