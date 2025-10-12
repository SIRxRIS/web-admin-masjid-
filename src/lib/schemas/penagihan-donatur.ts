import { z } from "zod";

export const createTransaksiDonaturSchema = z
  .object({
    donaturId: z.number().int().positive(),
    tahun: z.number().int().min(2000),
    jumlah: z.number().min(0),
    bulan: z.number().int().min(1).max(12).optional(),
    bulanList: z.array(z.number().int().min(1).max(12)).optional(),
    mode: z.enum(["skip", "replace", "accumulate"]).default("skip"),
  })
  .refine(
    (d) => !!d.bulan || (!!d.bulanList && d.bulanList.length > 0),
    { message: "Minimal satu bulan", path: ["bulan"] }
  );

export type CreateTransaksiDonaturInput = z.infer<typeof createTransaksiDonaturSchema>;