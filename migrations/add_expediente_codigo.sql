-- Add expediente_codigo column to HACK_CONTA_Operaciones
ALTER TABLE "HACK_CONTA_Operaciones"
  ADD COLUMN IF NOT EXISTS "expediente_codigo" TEXT;
