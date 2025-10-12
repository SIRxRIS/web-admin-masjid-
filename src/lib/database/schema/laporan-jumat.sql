-- Schema untuk tabel laporan_jumat
-- Menyimpan metadata laporan Jumat yang telah diekspor ke PDF

CREATE TABLE IF NOT EXISTS laporan_jumat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Metadata laporan
  tanggal_laporan DATE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  
  -- Data keuangan
  saldo_kas_jumat_lalu DECIMAL(15,2) NOT NULL DEFAULT 0,
  kotak_amal_jumat DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_sumbangan DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_pengeluaran DECIMAL(15,2) NOT NULL DEFAULT 0,
  saldo_kas_hari_ini DECIMAL(15,2) NOT NULL DEFAULT 0,
  kas_bsi DECIMAL(15,2) NOT NULL DEFAULT 0,
  kas_bank_sulselbar DECIMAL(15,2) NOT NULL DEFAULT 0,
  kas_tunai DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Petugas
  khatib VARCHAR(255),
  muadzdzin VARCHAR(255),
  imam VARCHAR(255),
  ketua_pengurus VARCHAR(255) DEFAULT 'Muhammad Arifin, SE',
  bendahara VARCHAR(255) DEFAULT 'Lalu Budiaksa',
  
  -- Pengaturan visibilitas
  is_public BOOLEAN DEFAULT FALSE,
  
  -- Metadata sistem
  uploaded_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_laporan_per_tanggal UNIQUE (tanggal_laporan),
  CONSTRAINT check_positive_amounts CHECK (
    saldo_kas_jumat_lalu >= 0 AND
    kotak_amal_jumat >= 0 AND
    total_sumbangan >= 0 AND
    total_pengeluaran >= 0 AND
    kas_bsi >= 0 AND
    kas_bank_sulselbar >= 0 AND
    kas_tunai >= 0
  )
);

-- Indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_laporan_jumat_tanggal ON laporan_jumat (tanggal_laporan DESC);
CREATE INDEX IF NOT EXISTS idx_laporan_jumat_public ON laporan_jumat (is_public, tanggal_laporan DESC);
CREATE INDEX IF NOT EXISTS idx_laporan_jumat_created_at ON laporan_jumat (created_at DESC);

-- Trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_laporan_jumat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_laporan_jumat_updated_at
  BEFORE UPDATE ON laporan_jumat
  FOR EACH ROW
  EXECUTE FUNCTION update_laporan_jumat_updated_at();

-- RLS (Row Level Security) policies
ALTER TABLE laporan_jumat ENABLE ROW LEVEL SECURITY;

-- Policy untuk membaca laporan publik (tanpa autentikasi)
CREATE POLICY "Public reports are viewable by everyone" ON laporan_jumat
  FOR SELECT USING (is_public = true);

-- Policy untuk admin/authenticated users (bisa melihat semua)
CREATE POLICY "Authenticated users can view all reports" ON laporan_jumat
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy untuk insert (hanya authenticated users)
CREATE POLICY "Authenticated users can insert reports" ON laporan_jumat
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy untuk update (hanya authenticated users)
CREATE POLICY "Authenticated users can update reports" ON laporan_jumat
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy untuk delete (hanya authenticated users)
CREATE POLICY "Authenticated users can delete reports" ON laporan_jumat
  FOR DELETE USING (auth.role() = 'authenticated');

-- Comments untuk dokumentasi
COMMENT ON TABLE laporan_jumat IS 'Tabel untuk menyimpan metadata laporan keuangan Jumat yang telah diekspor ke PDF';
COMMENT ON COLUMN laporan_jumat.tanggal_laporan IS 'Tanggal laporan Jumat (unik per tanggal)';
COMMENT ON COLUMN laporan_jumat.file_path IS 'Path file PDF di Supabase Storage';
COMMENT ON COLUMN laporan_jumat.is_public IS 'Apakah laporan ditampilkan di landing page publik';
COMMENT ON COLUMN laporan_jumat.uploaded_by IS 'User yang mengupload laporan';