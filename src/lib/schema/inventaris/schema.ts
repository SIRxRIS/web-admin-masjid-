// src/lib/services/supabase/schema/inventaris/schema.ts
import { z } from "zod";

export const KategoriInventaris = z.enum([
  "PERLENGKAPAN",
  "ELEKTRONIK",
  "KEBERSIHAN",
  "DOKUMEN",
  "LAINNYA"
]);

export const KondisiInventaris = z.enum([
  "BAIK",
  "CUKUP",
  "RUSAK"
]);

export const SatuanInventaris = z.enum([
  "UNIT",
  "BUAH",
  "LEMBAR",
  "SET",
  "LAINNYA"
]);

export const inventarisSchema = z.object({
  id: z.number(),
  no: z.number(),
  namaBarang: z.string(),
  fotoUrl: z.string().optional(),
  kategori: KategoriInventaris,
  jumlah: z.number(),
  satuan: SatuanInventaris,
  lokasi: z.string(),
  kondisi: KondisiInventaris,
  tanggalMasuk: z.date(),
  tahun: z.number(), 
  keterangan: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type InventarisData = z.infer<typeof inventarisSchema>;
