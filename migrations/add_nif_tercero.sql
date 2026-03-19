-- Add NIF_tercero column to HACK_CONTA_Operaciones
ALTER TABLE "HACK_CONTA_Operaciones"
  ADD COLUMN IF NOT EXISTS "NIF_tercero" TEXT;
