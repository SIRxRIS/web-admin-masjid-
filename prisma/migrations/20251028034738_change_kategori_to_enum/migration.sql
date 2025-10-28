/*
  Warnings:

  - You are about to drop the column `kategoriId` on the `konten` table. All the data in the column will be lost.
  - You are about to drop the `kategori_konten` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `kategori` to the `konten` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "KategoriKontenEnum" AS ENUM ('KEGIATAN_MASJID', 'PENGUMUMAN', 'KAJIAN_RUTIN', 'KEGIATAN_TPQ_TPA', 'LOMBA_ACARA', 'RAMADHAN', 'IDUL_FITRI', 'IDUL_ADHA', 'BAKTI_SOSIAL');

-- DropForeignKey
ALTER TABLE "public"."konten" DROP CONSTRAINT "konten_kategoriId_fkey";

-- AlterTable
ALTER TABLE "konten" DROP COLUMN "kategoriId",
ADD COLUMN     "kategori" "KategoriKontenEnum" NOT NULL;

-- DropTable
DROP TABLE "public"."kategori_konten";
