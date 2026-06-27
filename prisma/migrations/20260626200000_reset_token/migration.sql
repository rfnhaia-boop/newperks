-- AddColumn: resetToken e resetTokenExp na tabela Lojista
ALTER TABLE "Lojista" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "Lojista" ADD COLUMN "resetTokenExp" TIMESTAMP(3);
