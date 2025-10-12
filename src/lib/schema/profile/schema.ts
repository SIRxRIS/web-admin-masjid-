// src/lib/schema/profile/schema.ts
import { z } from "zod";
import { Jabatan, Role } from "@prisma/client";

// Schema utama untuk Profile
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  nama: z.string().min(1, "Nama harus diisi"),
  jabatan: z.nativeEnum(Jabatan),
  role: z.nativeEnum(Role),
  fotoUrl: z.string().url("URL foto tidak valid").nullable().optional(),
  phone: z.string().nullable().optional(),
  alamat: z.string().nullable().optional(),
  is_profile_complete: z.boolean(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
});

export type ProfileData = z.infer<typeof ProfileSchema>;

// Schema untuk membuat profile baru
export const CreateProfileSchema = ProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  is_profile_complete: z.boolean().default(false),
});

export type CreateProfilePayload = z.infer<typeof CreateProfileSchema>;

// Schema untuk update profile
export const UpdateProfileSchema = ProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type UpdateProfilePayload = z.infer<typeof UpdateProfileSchema>;

// Schema untuk validasi form profile
export const ProfileFormSchema = z.object({
  userId: z.string().min(1, "User ID harus diisi"),
  nama: z.string().min(1, "Nama harus diisi"),
  jabatan: z.nativeEnum(Jabatan, {
    errorMap: () => ({ message: "Pilih jabatan yang valid" }),
  }),
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: "Pilih role yang valid" }),
  }),
  fotoUrl: z.string().url("URL foto tidak valid").optional().or(z.literal("")),
  phone: z.string().optional(),
  alamat: z.string().optional(),
  is_profile_complete: z.boolean().default(false),
});

export type ProfileFormData = z.infer<typeof ProfileFormSchema>;

// Schema untuk update profile form (semua field opsional kecuali yang required)
export const UpdateProfileFormSchema = ProfileFormSchema.omit({
  userId: true,
})
  .partial()
  .extend({
    nama: z.string().min(1, "Nama harus diisi").optional(),
  });

export type UpdateProfileFormData = z.infer<typeof UpdateProfileFormSchema>;
