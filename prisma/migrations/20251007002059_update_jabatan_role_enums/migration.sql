/*
  Warnings:

  - The values [PENASEHAT,KOORDINATOR] on the enum `Jabatan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Jabatan_new" AS ENUM ('DEVELOPER', 'MAINTENANCE', 'KETUA', 'SEKRETARIS', 'BENDAHARA', 'PENGURUS', 'HUMAS', 'REMAS', 'MAJLIS_TALIM');
ALTER TABLE "email_whitelist" ALTER COLUMN "jabatan" TYPE "Jabatan_new" USING ("jabatan"::text::"Jabatan_new");
ALTER TABLE "profile" ALTER COLUMN "jabatan" TYPE "Jabatan_new" USING ("jabatan"::text::"Jabatan_new");
ALTER TYPE "Jabatan" RENAME TO "Jabatan_old";
ALTER TYPE "Jabatan_new" RENAME TO "Jabatan";
DROP TYPE "Jabatan_old";
COMMIT;

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PENGURUS';
