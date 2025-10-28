-- CreateTable laporan_jumat_files
CREATE TABLE "laporan_jumat_files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tanggal" TIMESTAMP(3) NOT NULL,
    "judul" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_by" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saldo_kas_awal" BIGINT NOT NULL,
    "total_pemasukan" BIGINT NOT NULL,
    "total_pengeluaran" BIGINT NOT NULL,
    "saldo_kas_akhir" BIGINT NOT NULL,
    "khatib" TEXT,
    "muadzdzin" TEXT,
    "imam" TEXT,
    "ketua_pengurus" TEXT,
    "bendahara" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laporan_jumat_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "laporan_jumat_files_tanggal_idx" ON "laporan_jumat_files"("tanggal");

-- CreateIndex
CREATE INDEX "laporan_jumat_files_is_public_idx" ON "laporan_jumat_files"("is_public");

-- CreateIndex
CREATE INDEX "laporan_jumat_files_uploaded_at_idx" ON "laporan_jumat_files"("uploaded_at");
