import { z } from "zod";

// Sumber kas harian untuk Closing Kas
export const SUMBER_CLOSING_KAS = [
  "DONATUR",
  "KOTAK_AMAL_LUAR",
  "KOTAK_AMAL_MASJID",
  "DONASI_KHUSUS",
  "LAINNYA",
  "TRANSFER",
] as const;

export type SumberClosingKas = (typeof SUMBER_CLOSING_KAS)[number];

// Schema baris Closing Kas harian
export const closingKasSchema = z.object({
  id: z.number().int().positive(),
  tanggal: z.union([z.string(), z.date()]),
  sumber: z.enum(SUMBER_CLOSING_KAS),
  jumlah: z.number().min(0),
  keterangan: z.string().trim().default(""),
  tahun: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  bulan: z.number().int().min(1).max(12),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});

export const createClosingKasSchema = closingKasSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const closingKasFilterSchema = z.object({
  tahun: z.number().int().min(2000).optional(),
  bulan: z.number().int().min(1).max(12).optional(),
  tanggal: z.string().optional(),
  sumber: z.enum(SUMBER_CLOSING_KAS).optional(),
});

// Bentuk rekap bulanan (group by bulan)
export const closingKasMonthlyRecapSchema = z.object({
  bulan: z.number().int().min(1).max(12),
  tahun: z.number().int().min(2000),
  total: z.number().min(0),
  perSumber: z.record(z.string(), z.number().min(0)),
});

export type ClosingKasData = z.infer<typeof closingKasSchema>;
export type CreateClosingKasInput = z.infer<typeof createClosingKasSchema>;
export type ClosingKasFilter = z.infer<typeof closingKasFilterSchema>;
export type ClosingKasMonthlyRecap = z.infer<typeof closingKasMonthlyRecapSchema>;