// src/lib/schema/laporan/laporan-jumat-schema.ts
import { z } from "zod";

// Schema untuk data Laporan Jumat
export const laporanJumatSchema = z.object({
  id: z.number().optional(),
  tanggalLaporan: z.date(),
  
  // Bagian A: Saldo Kas Jum'at lalu
  saldoKasJumatLalu: z.number().min(0),
  
  // Bagian B: Penerimaan (otomatis)
  penerimaan: z.object({
    kotakAmalJumat: z.number().min(0),
    kotakAmalJumatTanggal: z.string().optional(), // Date information for kotak amal jumat
    sumbangan: z.array(z.object({
      nama: z.string(),
      jumlah: z.number().min(0),
    })),
    totalPenerimaan: z.number().min(0),
  }),
  
  // Bagian C: Pengeluaran (otomatis)
  pengeluaran: z.array(z.object({
    nama: z.string(),
    jumlah: z.number().min(0),
  })),
  totalPengeluaran: z.number().min(0),
  
  // Bagian D: Saldo Kas Hari ini (manual input)
  saldoKasHariIni: z.object({
    total: z.number().min(0),
    breakdown: z.object({
      kasBsi: z.number().min(0),
      kasBankSulselbar: z.number().min(0),
      kasTunai: z.number().min(0),
    }),
  }),
  
  // Bagian Penandatangan
  penandatangan: z.object({
    khatib: z.string().optional(),
    muadzdzin: z.string().optional(),
    imam: z.string().optional(),
    ketuaPengurus: z.string().default("Muhammad Arifin, SE"),
    bendahara: z.string().default("Lalu Budiaksa"),
  }),
  
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Schema untuk input create laporan jumat
export const createLaporanJumatSchema = laporanJumatSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema untuk input update laporan jumat
export const updateLaporanJumatSchema = laporanJumatSchema.partial().required({
  id: true,
});

// Schema untuk filter laporan jumat
export const laporanJumatFilterSchema = z.object({
  tahun: z.number().int().min(2000).optional(),
  bulan: z.number().int().min(1).max(12).optional(),
  tanggalMulai: z.date().optional(),
  tanggalSelesai: z.date().optional(),
});

// Schema untuk data yang akan diekspor ke Excel
export const laporanJumatExportSchema = z.object({
  tanggalLaporan: z.date(),
  saldoKasJumatLalu: z.number(),
  kotakAmalJumat: z.number(),
  kotakAmalJumatTanggal: z.string().optional(),
  sumbangan: z.array(z.object({
    nama: z.string(),
    jumlah: z.number(),
  })),
  totalPenerimaan: z.number(),
  pengeluaran: z.array(z.object({
    nama: z.string(),
    jumlah: z.number(),
  })),
  totalPengeluaran: z.number(),
  saldoKasHariIni: z.number(),
  kasBsi: z.number(),
  kasBankSulselbar: z.number(),
  kasTunai: z.number(),
  khatib: z.string().optional(),
  muadzdzin: z.string().optional(),
  imam: z.string().optional(),
  ketuaPengurus: z.string(),
  bendahara: z.string(),
});

// Type exports
export type LaporanJumatData = z.infer<typeof laporanJumatSchema>;
export type CreateLaporanJumatInput = z.infer<typeof createLaporanJumatSchema>;
export type UpdateLaporanJumatInput = z.infer<typeof updateLaporanJumatSchema>;
export type LaporanJumatFilter = z.infer<typeof laporanJumatFilterSchema>;
export type LaporanJumatExport = z.infer<typeof laporanJumatExportSchema>;

// Helper untuk mendapatkan tanggal Jumat terdekat
export function getNextFriday(date: Date = new Date()): Date {
  const result = new Date(date);
  const dayOfWeek = result.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  result.setDate(result.getDate() + daysUntilFriday);
  return result;
}

// Helper untuk mendapatkan tanggal Jumat sebelumnya
export function getPreviousFriday(date: Date = new Date()): Date {
  const result = new Date(date);
  const dayOfWeek = result.getDay();
  const daysSinceFriday = (dayOfWeek - 5 + 7) % 7;
  if (daysSinceFriday === 0 && result.getTime() === date.getTime()) {
    // Jika hari ini Jumat, ambil Jumat sebelumnya
    result.setDate(result.getDate() - 7);
  } else {
    result.setDate(result.getDate() - daysSinceFriday);
  }
  return result;
}

// Helper untuk mendapatkan range tanggal dalam seminggu
export function getWeekRange(friday: Date): { start: Date; end: Date } {
  const start = new Date(friday);
  start.setDate(friday.getDate() - 6); // Sabtu minggu lalu
  
  const end = new Date(friday);
  // Jumat ini
  
  return { start, end };
}