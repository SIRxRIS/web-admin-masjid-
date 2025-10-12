// src/lib/schema/pemasukan/schema.ts
import { z } from "zod";

// Enum untuk sumber pemasukan
export const SUMBER_PEMASUKAN = [
  "DONATUR",
  "KOTAK_AMAL_LUAR",
  "KOTAK_AMAL_MASJID",
  "DONASI_KHUSUS",
  "LAINNYA",
] as const;

export type SumberPemasukan = (typeof SUMBER_PEMASUKAN)[number];

// Schema untuk data pemasukan lengkap dari database
export const pemasukanSchema = z.object({
  id: z.number().int().positive(),
  tanggal: z.union([z.string(), z.date()]),
  sumber: z.enum(SUMBER_PEMASUKAN),
  jumlah: z.number().min(0),
  keterangan: z.string().trim().default(""),
  tahun: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  // Foreign keys - semua optional karena hanya salah satu yang akan diisi
  donaturId: z.number().int().positive().nullable().optional(),
  kotakAmalId: z.number().int().positive().nullable().optional(),
  kotakMasjidId: z.number().int().positive().nullable().optional(),
  donasiKhususId: z.number().int().positive().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});

// Schema untuk input create pemasukan (tanpa id, createdAt, updatedAt)
export const createPemasukanSchema = pemasukanSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema untuk input update pemasukan (semua field optional kecuali id)
export const updatePemasukanSchema = pemasukanSchema.partial().required({
  id: true,
});

// Schema untuk filter dan query pemasukan
export const pemasukanFilterSchema = z.object({
  tahun: z.number().int().min(2000).optional(),
  sumber: z.enum(SUMBER_PEMASUKAN).optional(),
  donaturId: z.number().int().positive().optional(),
  kotakAmalId: z.number().int().positive().optional(),
  kotakMasjidId: z.number().int().positive().optional(),
  donasiKhususId: z.number().int().positive().optional(),
});

// Schema untuk pemasukan dengan detail relasi
export const pemasukanWithDetailSchema = pemasukanSchema.extend({
  donatur: z.object({
    id: z.number(),
    nama: z.string(),
    alamat: z.string(),
  }).nullable().optional(),
});

// Type exports
export type PemasukanData = z.infer<typeof pemasukanSchema>;
export type CreatePemasukanInput = z.infer<typeof createPemasukanSchema>;
export type UpdatePemasukanInput = z.infer<typeof updatePemasukanSchema>;
export type PemasukanFilter = z.infer<typeof pemasukanFilterSchema>;
export type PemasukanWithDetail = z.infer<typeof pemasukanWithDetailSchema>;

// Schema lengkap untuk data donatur dari database
export const donaturSchema = z.object({
  id: z.number().int().positive(),
  no: z.number().int().positive(),
  nama: z.string().min(1, "Nama donatur tidak boleh kosong").trim(),
  alamat: z.string().min(1, "Alamat tidak boleh kosong").trim(),
  tahun: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  jan: z.number().min(0).default(0),
  feb: z.number().min(0).default(0),
  mar: z.number().min(0).default(0),
  apr: z.number().min(0).default(0),
  mei: z.number().min(0).default(0),
  jun: z.number().min(0).default(0),
  jul: z.number().min(0).default(0),
  aug: z.number().min(0).default(0),
  sep: z.number().min(0).default(0),
  okt: z.number().min(0).default(0),
  nov: z.number().min(0).default(0),
  des: z.number().min(0).default(0),
  infaq: z.number().min(0).default(0),
  createdAt: z.union([z.string(), z.date().optional()]),
  updatedAt: z.union([z.string(), z.date().optional()]),
});

// Schema untuk input create donatur (tanpa id, createdAt, updatedAt)
export const createDonaturSchema = donaturSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  no: true, // Auto-generated
});

// Schema untuk input update donatur (semua field optional kecuali id)
export const updateDonaturSchema = donaturSchema.partial().required({
  id: true,
});

// Schema untuk filter dan query
export const donaturFilterSchema = z.object({
  tahun: z.number().int().min(2000).optional(),
  id: z.number().int().positive().optional(),
});

// Backward compatibility - gunakan nama yang sama dengan kode existing
export const schema = donaturSchema;

export const donasiKhususSchema = z.object({
  id: z.number().int().positive(),
  no: z.number().int().positive(),
  nama: z.string().min(1, "Nama tidak boleh kosong").trim(),
  tanggal: z.union([z.string(), z.date()]),
  tahun: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  bulan: z.number().int().min(1).max(12), // Ubah menjadi opsional
  jumlah: z.number().min(0),
  keterangan: z.string().trim().default(""),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});

export const kotakAmalSchema = z.object({
  id: z.number().int().positive(),
  no: z.number().int().positive(),
  nama: z.string().min(1, "Nama kotak amal tidak boleh kosong").trim(),
  lokasi: z.string().min(1, "Lokasi tidak boleh kosong").trim(),
  tahun: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  jan: z.number().min(0).default(0),
  feb: z.number().min(0).default(0),
  mar: z.number().min(0).default(0),
  apr: z.number().min(0).default(0),
  mei: z.number().min(0).default(0),
  jun: z.number().min(0).default(0),
  jul: z.number().min(0).default(0),
  aug: z.number().min(0).default(0),
  sep: z.number().min(0).default(0),
  okt: z.number().min(0).default(0),
  nov: z.number().min(0).default(0),
  des: z.number().min(0).default(0),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});

export const kotakAmalMasjidSchema = z.object({
  id: z.number().int().positive(),
  tanggal: z.union([z.string(), z.date()]),
  jumlah: z.number().min(0),
  tahun: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});

export const kotakAmalJumatSchema = z.object({
  id: z.number().int().positive(),
  tanggal: z.union([z.string(), z.date()]),
  jumlah: z.number().min(0),
  tahun: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});

// Type exports untuk semua schema
export type DonaturData = z.infer<typeof donaturSchema>;
export type CreateDonaturInput = z.infer<typeof createDonaturSchema>;
export type UpdateDonaturInput = z.infer<typeof updateDonaturSchema>;
export type DonaturFilter = z.infer<typeof donaturFilterSchema>;
export type KotakAmalData = z.infer<typeof kotakAmalSchema>;
export type DonasiKhususData = z.infer<typeof donasiKhususSchema>;
export type KotakAmalMasjidData = z.infer<typeof kotakAmalMasjidSchema>;
export type KotakAmalJumatData = z.infer<typeof kotakAmalJumatSchema>;