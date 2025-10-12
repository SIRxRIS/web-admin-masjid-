// src/lib/schema/pengeluaran/schema.ts
import { z } from "zod";

// Skema utama untuk data pengeluaran dari database
export const pengeluaranSchema = z.object({
  id: z.number(),
  no: z.number(),
  nama: z.string().min(1, "Nama tidak boleh kosong"),
  // Menggunakan z.coerce.date() untuk konversi yang andal dari string database ke objek Date
  tanggal: z.coerce.date(), 
  tahun: z.number().int().min(2000).max(2100),
  jumlah: z.number().int().min(0, "Jumlah tidak boleh negatif"),
  // Menggunakan nullable dan transform untuk memastikan selalu ada nilai string
  keterangan: z.string().nullable().transform(val => val || ""),
  // Menggunakan z.coerce.date()
  createdAt: z.coerce.date(), 
  // Menggunakan z.coerce.date()
  updatedAt: z.coerce.date()  
});

// Skema untuk input create (dari form/API)
export const createPengeluaranSchema = z.object({
  no: z.number().int().min(1),
  nama: z.string().min(1, "Nama tidak boleh kosong"),
  tanggal: z.coerce.date(),
  tahun: z.number().int().min(2000).max(2100),
  jumlah: z.number().int().min(0, "Jumlah tidak boleh negatif"),
  keterangan: z.string().optional().default("")
});

// Skema untuk input update
export const updatePengeluaranSchema = createPengeluaranSchema.partial().extend({
  id: z.number()
});

// Skema untuk pengeluaran tahunan dari database
export const pengeluaranTahunanSchema = z.object({
  id: z.number(),
  no: z.number(),
  pengeluaran: z.string().min(1, "Nama pengeluaran tidak boleh kosong"),
  jan: z.number().int().min(0).default(0),
  feb: z.number().int().min(0).default(0),
  mar: z.number().int().min(0).default(0),
  apr: z.number().int().min(0).default(0),
  mei: z.number().int().min(0).default(0),
  jun: z.number().int().min(0).default(0),
  jul: z.number().int().min(0).default(0),
  aug: z.number().int().min(0).default(0),
  sep: z.number().int().min(0).default(0),
  okt: z.number().int().min(0).default(0),
  nov: z.number().int().min(0).default(0),
  des: z.number().int().min(0).default(0)
});

// Skema untuk input create pengeluaran tahunan
export const createPengeluaranTahunanSchema = pengeluaranTahunanSchema.omit({ 
  id: true 
});

// Skema untuk input update pengeluaran tahunan
export const updatePengeluaranTahunanSchema = createPengeluaranTahunanSchema.partial().extend({
  id: z.number()
});

// Export tipe-tipe TypeScript
export type PengeluaranData = z.infer<typeof pengeluaranSchema>;
export type CreatePengeluaranInput = z.infer<typeof createPengeluaranSchema>;
export type UpdatePengeluaranInput = z.infer<typeof updatePengeluaranSchema>;
export type PengeluaranTahunanData = z.infer<typeof pengeluaranTahunanSchema>;
export type CreatePengeluaranTahunanInput = z.infer<typeof createPengeluaranTahunanSchema>;
export type UpdatePengeluaranTahunanInput = z.infer<typeof updatePengeluaranTahunanSchema>;
