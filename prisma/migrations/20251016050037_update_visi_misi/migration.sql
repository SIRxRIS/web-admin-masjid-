/*
  Warnings:

  - You are about to drop the column `deskripsi` on the `programkerja` table. All the data in the column will be lost.
  - You are about to drop the column `judul` on the `programkerja` table. All the data in the column will be lost.
  - Added the required column `programKerja` to the `programkerja` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "programkerja" DROP COLUMN "deskripsi",
DROP COLUMN "judul",
ADD COLUMN     "programKerja" TEXT NOT NULL;
