/*
  Warnings:

  - A unique constraint covering the columns `[kategori,jenis,divisi,urutan]` on the table `visi_misi` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "visi_misi_kategori_jenis_urutan_key";

-- AlterTable
ALTER TABLE "visi_misi" ADD COLUMN     "divisi" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "visi_misi_kategori_jenis_divisi_urutan_key" ON "visi_misi"("kategori", "jenis", "divisi", "urutan");
