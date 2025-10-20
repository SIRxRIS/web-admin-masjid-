/*
  Warnings:

  - You are about to drop the `program_kerja` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `visi_misi` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "program_kerja";

-- DropTable
DROP TABLE "visi_misi";

-- DropEnum
DROP TYPE "JenisVisiMisi";

-- DropEnum
DROP TYPE "KategoriVisiMisi";

-- CreateTable
CREATE TABLE "programkerja" (
    "id" SERIAL NOT NULL,
    "kategori" "KategoriOrganisasi" NOT NULL,
    "seksi" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 1,
    "tahun" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programkerja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "programkerja_kategori_seksi_idx" ON "programkerja"("kategori", "seksi");

-- CreateIndex
CREATE UNIQUE INDEX "programkerja_kategori_seksi_urutan_tahun_key" ON "programkerja"("kategori", "seksi", "urutan", "tahun");
