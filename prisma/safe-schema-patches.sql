-- Parches aditivos idempotentes para entornos con historial de migraciones inconsistente.
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "company_agreement_rut" TEXT;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "company_agreement_name" TEXT;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "company_agreement_discount" DOUBLE PRECISION;

ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "lat" DOUBLE PRECISION;
ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "lng" DOUBLE PRECISION;
ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "location_source" TEXT;
ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "location_updated_at" TIMESTAMP(3);
