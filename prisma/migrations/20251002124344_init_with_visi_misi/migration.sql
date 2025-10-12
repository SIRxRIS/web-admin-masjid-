-- CreateEnum
CREATE TYPE "Jabatan" AS ENUM ('DEVELOPER', 'MAINTENANCE', 'PENASEHAT', 'KETUA', 'SEKRETARIS', 'BENDAHARA', 'KOORDINATOR', 'PENGURUS');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'CONTENT', 'VIEWER', 'MANAGEMENT', 'INVENTORY');

-- CreateEnum
CREATE TYPE "Resource" AS ENUM ('KEUANGAN', 'MANAJEMEN', 'KONTEN', 'INVENTARIS', 'DASHBOARD', 'ADMIN');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('READ', 'WRITE', 'DELETE', 'APPROVE');

-- CreateEnum
CREATE TYPE "StatusKonten" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'REVIEWED');

-- CreateEnum
CREATE TYPE "KategoriInventaris" AS ENUM ('PERLENGKAPAN', 'ELEKTRONIK', 'KEBERSIHAN', 'DOKUMEN', 'LAINNYA');

-- CreateEnum
CREATE TYPE "KondisiInventaris" AS ENUM ('BAIK', 'CUKUP', 'RUSAK');

-- CreateEnum
CREATE TYPE "SatuanInventaris" AS ENUM ('UNIT', 'BUAH', 'LEMBAR', 'SET', 'LAINNYA');

-- CreateEnum
CREATE TYPE "KategoriVisiMisi" AS ENUM ('MASJID', 'REMAS', 'MAJLIS_TALIM');

-- CreateEnum
CREATE TYPE "JenisVisiMisi" AS ENUM ('VISI', 'MISI');

-- CreateTable
CREATE TABLE "email_whitelist" (
    "id" UUID NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "jabatan" "Jabatan" NOT NULL,
    "role" "Role" NOT NULL,
    "addedBy" UUID,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_whitelist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" "Jabatan" NOT NULL,
    "role" "Role" NOT NULL,
    "fotoUrl" TEXT,
    "phone" TEXT,
    "alamat" TEXT,
    "is_profile_complete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "profileId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL,
    "profileId" UUID NOT NULL,
    "resource" "Resource" NOT NULL,
    "permission" "Permission" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donatur" (
    "id" SERIAL NOT NULL,
    "no" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "jan" INTEGER NOT NULL DEFAULT 0,
    "feb" INTEGER NOT NULL DEFAULT 0,
    "mar" INTEGER NOT NULL DEFAULT 0,
    "apr" INTEGER NOT NULL DEFAULT 0,
    "mei" INTEGER NOT NULL DEFAULT 0,
    "jun" INTEGER NOT NULL DEFAULT 0,
    "jul" INTEGER NOT NULL DEFAULT 0,
    "aug" INTEGER NOT NULL DEFAULT 0,
    "sep" INTEGER NOT NULL DEFAULT 0,
    "okt" INTEGER NOT NULL DEFAULT 0,
    "nov" INTEGER NOT NULL DEFAULT 0,
    "des" INTEGER NOT NULL DEFAULT 0,
    "infaq" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donatur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KotakAmal" (
    "id" SERIAL NOT NULL,
    "no" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "jan" INTEGER NOT NULL DEFAULT 0,
    "feb" INTEGER NOT NULL DEFAULT 0,
    "mar" INTEGER NOT NULL DEFAULT 0,
    "apr" INTEGER NOT NULL DEFAULT 0,
    "mei" INTEGER NOT NULL DEFAULT 0,
    "jun" INTEGER NOT NULL DEFAULT 0,
    "jul" INTEGER NOT NULL DEFAULT 0,
    "aug" INTEGER NOT NULL DEFAULT 0,
    "sep" INTEGER NOT NULL DEFAULT 0,
    "okt" INTEGER NOT NULL DEFAULT 0,
    "nov" INTEGER NOT NULL DEFAULT 0,
    "des" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KotakAmal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KotakAmalMasjid" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KotakAmalMasjid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KotakAmalJumat" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KotakAmalJumat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonasiKhusus" (
    "id" SERIAL NOT NULL,
    "no" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "keterangan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DonasiKhusus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengeluaran" (
    "id" SERIAL NOT NULL,
    "no" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "nama" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "keterangan" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pengeluaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengurus" (
    "id" SERIAL NOT NULL,
    "no" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'MASJID',
    "fotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pengurus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori_konten" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deskripsi" TEXT,
    "warna" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kategori_konten_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "konten" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "waktu" TEXT,
    "lokasi" TEXT,
    "penulis" TEXT,
    "kategoriId" INTEGER NOT NULL,
    "donaturId" INTEGER,
    "kotakAmalId" INTEGER,
    "penting" BOOLEAN NOT NULL DEFAULT false,
    "tampilkanDiBeranda" BOOLEAN NOT NULL DEFAULT true,
    "status" "StatusKonten" NOT NULL DEFAULT 'PUBLISHED',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "fotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "konten_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gambar_konten" (
    "id" SERIAL NOT NULL,
    "kontenId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "caption" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "isUtama" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gambar_konten_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_konten" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_konten_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "konten_tag_konten" (
    "id" SERIAL NOT NULL,
    "kontenId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "konten_tag_konten_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventaris" (
    "id" SERIAL NOT NULL,
    "no" INTEGER NOT NULL,
    "namaBarang" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "kategori" "KategoriInventaris" NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "satuan" "SatuanInventaris" NOT NULL,
    "lokasi" TEXT NOT NULL,
    "kondisi" "KondisiInventaris" NOT NULL,
    "tanggalMasuk" TIMESTAMP(3) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inventaris_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "target_pemasukan" (
    "id" SERIAL NOT NULL,
    "tahun" INTEGER NOT NULL,
    "bulan" INTEGER NOT NULL,
    "target" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "target_pemasukan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visi_misi" (
    "id" SERIAL NOT NULL,
    "kategori" "KategoriVisiMisi" NOT NULL,
    "jenis" "JenisVisiMisi" NOT NULL,
    "konten" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visi_misi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_whitelist_email_key" ON "email_whitelist"("email");

-- CreateIndex
CREATE INDEX "email_whitelist_email_idx" ON "email_whitelist"("email");

-- CreateIndex
CREATE INDEX "email_whitelist_isActive_idx" ON "email_whitelist"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "profile_userId_key" ON "profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_profileId_resource_permission_key" ON "UserPermission"("profileId", "resource", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_konten_nama_key" ON "kategori_konten"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_konten_slug_key" ON "kategori_konten"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "konten_slug_key" ON "konten"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tag_konten_nama_key" ON "tag_konten"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "tag_konten_slug_key" ON "tag_konten"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "konten_tag_konten_kontenId_tagId_key" ON "konten_tag_konten"("kontenId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "site_config_key_key" ON "site_config"("key");

-- CreateIndex
CREATE UNIQUE INDEX "target_pemasukan_tahun_bulan_key" ON "target_pemasukan"("tahun", "bulan");

-- CreateIndex
CREATE UNIQUE INDEX "visi_misi_kategori_jenis_urutan_key" ON "visi_misi"("kategori", "jenis", "urutan");

-- AddForeignKey
ALTER TABLE "email_whitelist" ADD CONSTRAINT "email_whitelist_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konten" ADD CONSTRAINT "konten_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "kategori_konten"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konten" ADD CONSTRAINT "konten_donaturId_fkey" FOREIGN KEY ("donaturId") REFERENCES "Donatur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konten" ADD CONSTRAINT "konten_kotakAmalId_fkey" FOREIGN KEY ("kotakAmalId") REFERENCES "KotakAmal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gambar_konten" ADD CONSTRAINT "gambar_konten_kontenId_fkey" FOREIGN KEY ("kontenId") REFERENCES "konten"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konten_tag_konten" ADD CONSTRAINT "konten_tag_konten_kontenId_fkey" FOREIGN KEY ("kontenId") REFERENCES "konten"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konten_tag_konten" ADD CONSTRAINT "konten_tag_konten_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag_konten"("id") ON DELETE CASCADE ON UPDATE CASCADE;
