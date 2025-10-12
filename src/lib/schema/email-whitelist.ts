import { z } from "zod";
import { Jabatan, Role } from "@prisma/client";

// Schema untuk validasi data email whitelist
export const emailWhitelistSchema = z.object({
  id: z.string().uuid().optional(),
  nama: z.string().min(1, "Nama tidak boleh kosong").max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Format email tidak valid"),
  isActive: z.boolean().default(true),
  jabatan: z.nativeEnum(Jabatan, {
    errorMap: () => ({ message: "Jabatan tidak valid" })
  }),
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: "Role tidak valid" })
  }),
  addedBy: z.string().uuid().optional(),
  addedAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Type untuk data email whitelist
export type EmailWhitelistData = z.infer<typeof emailWhitelistSchema>;

// Schema untuk form input (tanpa field yang auto-generated)
export const emailWhitelistFormSchema = emailWhitelistSchema.omit({
  id: true,
  addedBy: true,
  addedAt: true,
  updatedAt: true,
});

export type EmailWhitelistFormData = z.infer<typeof emailWhitelistFormSchema>;

// Schema untuk update (semua field optional kecuali id)
export const emailWhitelistUpdateSchema = emailWhitelistSchema.partial().extend({
  id: z.string().uuid(),
});

export type EmailWhitelistUpdateData = z.infer<typeof emailWhitelistUpdateSchema>;

// Enum options untuk form select
export const jabatanOptions = [
  { value: Jabatan.DEVELOPER, label: "Developer" },
  { value: Jabatan.MAINTENANCE, label: "Maintenance" },
  { value: Jabatan.KETUA, label: "Ketua" },
  { value: Jabatan.SEKRETARIS, label: "Sekretaris" },
  { value: Jabatan.BENDAHARA, label: "Bendahara" },
  { value: Jabatan.PENGURUS, label: "Pengurus" },
  { value: Jabatan.HUMAS, label: "Humas" },
  { value: Jabatan.REMAS, label: "Remas" },
  { value: Jabatan.MAJLIS_TALIM, label: "Majlis Ta'lim" },
];

export const roleOptions = [
  { value: Role.ADMIN, label: "Admin" },
  { value: Role.KETUA, label: "Ketua" },
  { value: Role.SEKRETARIS, label: "Sekretaris" },
  { value: Role.BENDAHARA, label: "Bendahara" },
  { value: Role.PENGURUS, label: "Pengurus" },
  { value: Role.HUMAS_MEDIA, label: "Humas & Media" },
  { value: Role.REMAS_ADMIN, label: "Remas Admin" },
  { value: Role.MAJLIS_TALIM_ADMIN, label: "Majlis Ta'lim Admin" },
];