-- Migration: Update Role enum to new set without SUPER_ADMIN
-- Create new enum type with desired values
CREATE TYPE "Role_new" AS ENUM (
  'ADMIN',
  'KETUA',
  'SEKRETARIS',
  'BENDAHARA',
  'HUMAS_MEDIA',
  'REMAS_ADMIN',
  'MAJLIS_TALIM_ADMIN'
);

-- Email Whitelist: alter column with CASE mapping from old values to new
ALTER TABLE "email_whitelist"
  ALTER COLUMN "role" TYPE "Role_new"
  USING (
    CASE ("role"::text)
      WHEN 'SUPER_ADMIN' THEN 'ADMIN'
      WHEN 'ADMIN' THEN 'ADMIN'
      WHEN 'FINANCE' THEN 'BENDAHARA'
      WHEN 'CONTENT' THEN 'HUMAS_MEDIA'
      WHEN 'VIEWER' THEN 'KETUA'
      WHEN 'MANAGEMENT' THEN 'KETUA'
      WHEN 'INVENTORY' THEN 'SEKRETARIS'
      ELSE 'ADMIN'
    END
  )::"Role_new";

-- Profile: alter column with same CASE mapping
ALTER TABLE "profile"
  ALTER COLUMN "role" TYPE "Role_new"
  USING (
    CASE ("role"::text)
      WHEN 'SUPER_ADMIN' THEN 'ADMIN'
      WHEN 'ADMIN' THEN 'ADMIN'
      WHEN 'FINANCE' THEN 'BENDAHARA'
      WHEN 'CONTENT' THEN 'HUMAS_MEDIA'
      WHEN 'VIEWER' THEN 'KETUA'
      WHEN 'MANAGEMENT' THEN 'KETUA'
      WHEN 'INVENTORY' THEN 'SEKRETARIS'
      ELSE 'ADMIN'
    END
  )::"Role_new";

-- Drop old type and rename new one
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
    DROP TYPE "Role";
  END IF;
END$$;

ALTER TYPE "Role_new" RENAME TO "Role";