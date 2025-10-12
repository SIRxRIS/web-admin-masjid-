import { z } from "zod"

export const FormPengurusSchema = z.object({
  nama: z.string().min(2, { message: "Nama minimal 2 karakter." }),
  no: z.coerce.number().min(1, { message: "Nomor urut wajib diisi." }),
  jabatan: z.string().min(2, { message: "Jabatan wajib dipilih." }),
  periode: z.string().min(4, { message: "Periode contoh: 2023-2027." }),
  kategori: z.enum(["MASJID", "REMAS", "MAJLIS_TALIM"]),
})

export const jabatanToNoMap: Record<string, number> = {
  "Penasehat": 1,
  "Ketua": 2,
  "Sekretaris": 3,
  "Bendahara": 4,
  "Koordinator Ibadah dan Dakwah": 5,
  "Koordinator Penggalangan Dana": 6,
  "Koordinator Humas dan Infokom": 7,
  "Koordinator Pembantu Umum": 8,
  "Koordinator Perlengkapan dan Pemeliharaan": 9,
  "Koordinator Pembinaan Remaja dan TPQ": 10,
  "Koordinator Pembangunan Masjid": 11,
}

export type FormPengurusType = z.infer<typeof FormPengurusSchema>