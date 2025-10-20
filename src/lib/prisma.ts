// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Deklarasikan variabel global untuk menyimpan instance PrismaClient
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Gunakan instance yang ada atau buat yang baru. Ini mencegah pembuatan instance ganda
// selama hot-reload di lingkungan pengembangan.
export const prisma = global.prisma || new PrismaClient();

// Simpan instance di variabel global jika tidak dalam mode produksi.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}