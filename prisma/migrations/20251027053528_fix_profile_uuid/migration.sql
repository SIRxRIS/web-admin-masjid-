-- AlterTable
ALTER TABLE "UserActivity" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "laporan_jumat_files" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "profile" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
