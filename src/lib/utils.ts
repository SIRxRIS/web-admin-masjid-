// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// ===== TAILWIND UTILITY =====
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ===== FORMAT CURRENCY =====

/**
 * Format angka ke mata uang Rupiah
 */
export function formatRupiah(angka: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
}

/**
 * Format currency short (untuk display yang lebih pendek)
 * Mengkonversi angka besar ke format yang lebih mudah dibaca
 * Contoh: 61875000000 → "61.9M", 5000000 → "5Jt", 750000 → "750K"
 */
export function formatCurrencyShort(amount: number): string {
  if (amount >= 1000000000) {
    // Untuk miliar, tampilkan 1 decimal jika ada sisa yang signifikan
    const milyar = amount / 1000000000;
    return `${milyar % 1 === 0 ? milyar.toFixed(0) : milyar.toFixed(1)}M`;
  } else if (amount >= 1000000) {
    // Untuk juta, tampilkan tanpa decimal untuk kesederhanaan
    const juta = amount / 1000000;
    return `${juta % 1 === 0 ? juta.toFixed(0) : juta.toFixed(1)}Jt`;
  } else if (amount >= 1000) {
    // Untuk ribu, tampilkan tanpa decimal
    const ribu = amount / 1000;
    return `${ribu % 1 === 0 ? ribu.toFixed(0) : ribu.toFixed(1)}K`;
  }
  // Jika kurang dari 1000, tampilkan format rupiah normal
  return formatRupiah(amount);
}

// ===== FORMAT ANGKA =====

/**
 * Format angka dengan pemisah ribuan (Indonesia)
 */
export function formatAngka(angka: number): string {
  return new Intl.NumberFormat('id-ID').format(angka);
}

/**
 * Format angka untuk input field dengan separator ribuan yang user-friendly
 * Menghindari angka yang terlalu panjang dan sulit dibaca
 * Contoh: 61875000000 → "61.875.000.000" (bukan "6.187.500.000.000.001")
 */
export function formatAngkaInput(value: string): string {
  // Hapus semua karakter non-digit
  const numericValue = value.replace(/\D/g, '');
  
  // Jika kosong, return empty string
  if (!numericValue) return '';
  
  // Parse ke number dan format dengan separator ribuan Indonesia
  const number = parseInt(numericValue);
  return number.toLocaleString('id-ID');
}

/**
 * Parse input yang sudah diformat kembali ke string angka murni
 * Menghapus semua separator untuk mendapatkan nilai numerik
 */
export function parseFormattedNumber(value: string): string {
  return value.replace(/\./g, ''); // Hapus titik separator ribuan
}

/**
 * Format persentase dengan opsi desimal
 */
export function formatPersentase(angka: number, desimal: number = 1): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'percent',
    minimumFractionDigits: desimal,
    maximumFractionDigits: desimal,
  }).format(angka / 100);
}

/**
 * Format persentase dengan tanda plus/minus (untuk perubahan)
 */
export function formatPerubahan(angka: number): string {
  return `${angka >= 0 ? '+' : ''}${angka.toFixed(1)}%`;
}

// ===== FORMAT TANGGAL =====

/**
 * Format tanggal lengkap dalam bahasa Indonesia
 * Contoh: "Senin, 25 Desember 2023"
 */
export function formatTanggalIndonesia(tanggal: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(tanggal);
}

/**
 * Format tanggal singkat dalam bahasa Indonesia
 * Contoh: "25 Des 2023"
 */
export function formatTanggalSingkat(tanggal: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(tanggal);
}