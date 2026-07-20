-- Parches aditivos idempotentes para entornos con historial de migraciones inconsistente.
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "company_agreement_rut" TEXT;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "company_agreement_name" TEXT;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "company_agreement_discount" DOUBLE PRECISION;

ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "lat" DOUBLE PRECISION;
ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "lng" DOUBLE PRECISION;
ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "location_source" TEXT;
ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "location_updated_at" TIMESTAMP(3);

-- Modalidad comercial del plan (preferente / libre elección / cerrado)
DO $$ BEGIN
  CREATE TYPE "PlanType" AS ENUM ('preferred', 'free_choice', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "plan_type" "PlanType";

UPDATE "plans"
SET "plan_type" = 'preferred'
WHERE "plan_type" IS NULL
  AND (
    "has_top" = true
    OR lower("plan_name") LIKE '%preferente%'
    OR lower(coalesce("additional_notes", '')) LIKE '%preferente%'
  );

UPDATE "plans"
SET "plan_type" = 'closed'
WHERE "plan_type" IS NULL
  AND (
    lower("plan_name") LIKE '%cerrado%'
    OR lower("plan_name") LIKE '%-sf%'
    OR lower(coalesce("additional_notes", '')) LIKE '%cerrado%'
  );

UPDATE "plans"
SET "plan_type" = 'free_choice'
WHERE "plan_type" IS NULL;

ALTER TABLE "plans" ALTER COLUMN "plan_type" SET DEFAULT 'free_choice';

DO $$ BEGIN
  ALTER TABLE "plans" ALTER COLUMN "plan_type" SET NOT NULL;
EXCEPTION
  WHEN others THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "plans_plan_type_idx" ON "plans"("plan_type");
