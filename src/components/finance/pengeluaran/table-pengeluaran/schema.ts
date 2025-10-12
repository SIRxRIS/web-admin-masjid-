import { z } from "zod";

export const pengeluaranSchema = z.object({
  id: z.number(),
  no: z.number(),
  nama: z.string(),
  tanggal: z.date(),
  tahun: z.number(),
  jumlah: z.number(),
  keterangan: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type PengeluaranData = z.infer<typeof pengeluaranSchema>;

export const pengeluaranTahunanSchema = z.object({
  id: z.number(),
  no: z.number(),
  pengeluaran: z.string(),
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
  des: z.number()
});

export type PengeluaranTahunanData = z.infer<typeof pengeluaranTahunanSchema>;
