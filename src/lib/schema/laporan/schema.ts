import { z } from "zod";

export const rekapPemasukanSchema = z.object({
  id: z.number(),
  sumber: z.enum([
    "DONATUR",
    "KOTAK_AMAL_LUAR",
    "KOTAK_AMAL_MASJID",
    "KOTAK_AMAL_JUMAT",
    "DONASI_KHUSUS",
    "LAINNYA",
  ]),
  tahun: z.number(),
  jan: z.number(),
  feb: z.number(),
  mar: z.number(),
  apr: z.number(),
  mei: z.number(),
  jun: z.number(),
  jul: z.number(),
  aug: z.number(),
  sep: z.number(),
  okt: z.number(),
  nov: z.number(),
  des: z.number(),
  total: z.number(),
});

export const rekapPengeluaranSchema = z.object({
  id: z.number(),
  nama: z.string(),
  tahun: z.number(),
  jan: z.number(),
  feb: z.number(),
  mar: z.number(),
  apr: z.number(),
  mei: z.number(),
  jun: z.number(),
  jul: z.number(),
  aug: z.number(),
  sep: z.number(),
  okt: z.number(),
  nov: z.number(),
  des: z.number(),
  total: z.number(),
});

export type RekapPemasukan = z.infer<typeof rekapPemasukanSchema>;
export type RekapPengeluaran = z.infer<typeof rekapPengeluaranSchema>;
