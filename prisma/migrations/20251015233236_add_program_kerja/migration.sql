-- CreateEnum
CREATE TYPE "KategoriOrganisasi" AS ENUM ('PENGURUS_MASJID', 'REMAS', 'MAJLIS_TALIM');

-- CreateTable
CREATE TABLE "program_kerja" (
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

    CONSTRAINT "program_kerja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "program_kerja_kategori_seksi_idx" ON "program_kerja"("kategori", "seksi");

-- CreateIndex
CREATE UNIQUE INDEX "program_kerja_kategori_seksi_urutan_tahun_key" ON "program_kerja"("kategori", "seksi", "urutan", "tahun");
