// File: src/lib/schema/konten/schema.ts
import { z } from "zod";

export enum StatusKonten {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED", 
  ARCHIVED = "ARCHIVED",
  REVIEWED = "REVIEWED",
}

// ✅ Main Schema - Simple & Effective
export const ContentFormSchema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter").max(200).trim(),
  kategoriId: z.number().min(1, "Kategori wajib dipilih"),
  tanggal: z.date(),
  deskripsi: z.string().min(10, "Deskripsi minimal 10 karakter").max(5000).trim(),
  penulis: z.string().max(100).trim().nullable().optional(),
  waktu: z.string().max(50).nullable().optional(),
  lokasi: z.string().max(200).nullable().optional(),
  donaturId: z.number().nullable().optional(),
  kotakAmalId: z.number().nullable().optional(),
  tampilkanDiBeranda: z.boolean(),
  penting: z.boolean(),
  status: z.nativeEnum(StatusKonten),
  tags: z.array(z.number().min(1)),
  slug: z.string().optional(),
  viewCount: z.number().min(0),
  fotoUrl: z.string().nullable().optional(),
});

// ✅ Helper function untuk convert data dari database ke form values
export function convertKontenDataToFormValues(content: KontenData): ContentFormValues {
  return {
    judul: content.judul,
    kategoriId: content.kategoriId,
    tanggal: new Date(content.tanggal),
    deskripsi: content.deskripsi,
    penulis: content.penulis,
    waktu: content.waktu,
    lokasi: content.lokasi,
    donaturId: content.donaturId,
    kotakAmalId: content.kotakAmalId,
    tampilkanDiBeranda: content.tampilkanDiBeranda,
    penting: content.penting,
    status: content.status,
    tags: [],
    slug: content.slug,
    viewCount: content.viewCount,
    fotoUrl: content.fotoUrl,
  };
}

// ✅ Type untuk KontenDataWithTags
export interface KontenDataWithTags extends KontenData {
  tags?: { id: number; nama: string }[];
}

// ✅ Fixed useForm implementation untuk ContentEdit
export function createContentEditForm(content: KontenDataWithTags): ContentFormValues {
  return {
    judul: content.judul,
    kategoriId: content.kategoriId,
    tanggal: new Date(content.tanggal),
    deskripsi: content.deskripsi,
    penulis: content.penulis,
    waktu: content.waktu,
    lokasi: content.lokasi,
    donaturId: content.donaturId,
    kotakAmalId: content.kotakAmalId,
    tampilkanDiBeranda: content.tampilkanDiBeranda,
    penting: content.penting,
    status: content.status,
    tags: content.tags?.map((tag) => tag.id) || [],
    slug: content.slug,
    viewCount: content.viewCount,
    fotoUrl: content.fotoUrl,
  };
}

// ✅ Form Input Schema with Transformations
export const ContentFormInputSchema = ContentFormSchema.extend({
  kategoriId: z.union([
    z.string().transform(val => parseInt(val, 10)),
    z.number()
  ]).pipe(z.number().min(1)),
  
  tanggal: z.union([
    z.string().transform(val => new Date(val)),
    z.date()
  ]).pipe(z.date()),
  
  tampilkanDiBeranda: z.union([
    z.string().transform(val => val === "true"),
    z.boolean()
  ]).pipe(z.boolean()),
  
  penting: z.union([
    z.string().transform(val => val === "true"),
    z.boolean()
  ]).pipe(z.boolean()),

  donaturId: z.union([
    z.string().transform(val => val === "" ? null : parseInt(val, 10)),
    z.number(),
    z.null()
  ]).nullable(),
  
  kotakAmalId: z.union([
    z.string().transform(val => val === "" ? null : parseInt(val, 10)),
    z.number(),
    z.null()
  ]).nullable(),
});

export type ContentFormValues = z.infer<typeof ContentFormSchema>;
export type ContentFormInputValues = z.infer<typeof ContentFormInputSchema>;

// ✅ Clean Default Values
export const defaultValues: ContentFormValues = {
  judul: "",
  kategoriId: 1,
  tanggal: new Date(),
  deskripsi: "",
  penulis: null,
  waktu: null,
  lokasi: null,
  donaturId: null,
  kotakAmalId: null,
  tampilkanDiBeranda: true,
  penting: false,
  status: StatusKonten.PUBLISHED,
  tags: [],
  slug: "",
  viewCount: 0,
  fotoUrl: null,
};

// ✅ Interface matching Prisma exactly
export interface KontenData {
  id: number;
  judul: string;
  slug: string;
  deskripsi: string;
  tanggal: Date;
  waktu: string | null;
  lokasi: string | null;
  penulis: string | null;
  kategoriId: number;
  donaturId: number | null;
  kotakAmalId: number | null;
  penting: boolean;
  tampilkanDiBeranda: boolean;
  status: StatusKonten;
  viewCount: number;
  fotoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  kategori?: { id: number; nama: string; slug: string };
  donatur?: { id: number; nama: string } | null;
  kotakAmal?: { id: number; nama: string } | null;
  gambar?: Array<{
    id: number;
    url: string;
    filename: string;
    caption: string | null;
    urutan: number;
    isUtama: boolean;
  }>;
  kontenTags?: { tagKonten: { id: number; nama: string; slug: string } }[];
}

export type GambarKontenType = {
  id?: number;
  url: string;
  filename: string;
  file?: File; 
  preview?: string;
  urutan: number;
  isUtama: boolean;
  caption: string;
};

// ✅ Utility Functions - Only Essential Ones
export function generateSlug(judul: string): string {
  return judul
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractTags(konten: KontenData) {
  return konten.kontenTags?.map(kt => kt.tagKonten) || [];
}

export function processFormData(data: ContentFormInputValues): ContentFormValues {
  return {
    ...data,
    slug: data.slug || generateSlug(data.judul),
    penulis: data.penulis?.trim() || null,
    waktu: data.waktu?.trim() || null,
    lokasi: data.lokasi?.trim() || null,
    fotoUrl: data.fotoUrl?.trim() || null,
  };
}

// ✅ Options for forms
export const statusOptions = [
  { value: StatusKonten.DRAFT, label: "Draft" },
  { value: StatusKonten.REVIEWED, label: "Direview" },
  { value: StatusKonten.PUBLISHED, label: "Dipublikasi" },
  { value: StatusKonten.ARCHIVED, label: "Diarsipkan" },
];

export const kategoriKontenContoh = [
  { id: 1, label: "Kegiatan Masjid" },
  { id: 2, label: "Pengumuman" },
  { id: 3, label: "Kajian Rutin" },
  { id: 4, label: "Kegiatan TPQ/TPA" },
  { id: 5, label: "Lomba dan Acara" },
  { id: 6, label: "Program Ramadhan" },
  { id: 7, label: "Idul Fitri" },
  { id: 8, label: "Idul Adha" },
  { id: 9, label: "Bakti Sosial" },
];
