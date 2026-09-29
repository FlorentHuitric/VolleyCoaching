-- Additive upgrade for installations initialized with prisma db push.
-- Run against the intended database before deploying the training-plan feature.
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS plan JSONB;

ALTER TABLE players ADD COLUMN IF NOT EXISTS "experienceLevel" TEXT, ADD COLUMN IF NOT EXISTS "notes" TEXT, ADD COLUMN IF NOT EXISTS "medicalNotes" TEXT, ADD COLUMN IF NOT EXISTS "emergencyContact" TEXT, ADD COLUMN IF NOT EXISTS "emergencyPhone" TEXT;
