CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE "UserActivity"
ALTER COLUMN "id" TYPE UUID USING "id"::uuid;

ALTER TABLE "UserActivity"
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
