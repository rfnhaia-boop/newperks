-- Idempotência do carimbo vindo do Flow (agendamento concluído)
ALTER TABLE "Carimbo" ADD COLUMN "flowAppointmentId" TEXT;
CREATE UNIQUE INDEX "Carimbo_flowAppointmentId_key" ON "Carimbo"("flowAppointmentId");
