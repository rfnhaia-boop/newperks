-- Cliente passa a logar por telefone + senha (além do Google)
ALTER TABLE "Cliente" ADD COLUMN "senha" TEXT;
CREATE UNIQUE INDEX "Cliente_telefone_key" ON "Cliente"("telefone");
