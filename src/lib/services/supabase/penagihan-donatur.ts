"use server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { syncPemasukanForDonatur } from "./pemasukan/sync-helpers";
import { createTransaksiDonaturSchema, type CreateTransaksiDonaturInput } from "@/lib/schemas/penagihan-donatur";

/**
 * Simpan transaksi penagihan donatur:
 * - Update kolom bulan (jan..des) pada tabel Donatur sesuai tahun
 * - Insert baris ke tabel Pemasukan via sync helper
 */
export async function createTransaksiDonatur(input: CreateTransaksiDonaturInput) {
  const parsed = createTransaksiDonaturSchema.safeParse(input);
  if (!parsed.success) {
    const errors = parsed.error.errors.map(e => e.message).join(", ");
    throw new Error(`Input tidak valid: ${errors}`);
  }
  const { donaturId, tahun, bulan, bulanList, jumlah, mode } = parsed.data;
  const supabase = supabaseAdmin;

  // Map bulan ke kolom
  const monthKeys = ["jan","feb","mar","apr","mei","jun","jul","aug","sep","okt","nov","des"] as const;
  const monthsToProcess = (bulanList && bulanList.length > 0)
    ? bulanList
    : (bulan ? [bulan] : []);
  const selectedMonthKeys = monthsToProcess.map((m) => monthKeys[m - 1]);

  // Ambil donatur untuk validasi tahun
  const { data: donatur, error: getErr } = await supabase
    .from("Donatur")
    .select("id, tahun, jan, feb, mar, apr, mei, jun, jul, aug, sep, okt, nov, des")
    .eq("id", donaturId)
    .single();
  if (getErr) {
    throw new Error("Donatur tidak ditemukan");
  }
  // Perjelas tipe data agar linter tidak menganggap error type
  type DonaturPartial = { id: number; tahun: number } & Record<string, number | null>;
  const donaturRow = donatur as unknown as DonaturPartial;
  if (!donaturRow || typeof donaturRow.tahun !== "number") {
    throw new Error("Data Donatur tidak valid");
  }
  if (donaturRow.tahun !== tahun) {
    throw new Error("Tahun tidak cocok dengan data Donatur");
  }

  // Siapkan update untuk multi-bulan dengan anti duplikasi
  const updatePayload: Record<string, number | null> = {};
  const savedMonths: number[] = [];
  const skippedMonths: number[] = [];

  for (const m of monthsToProcess) {
    const key = monthKeys[m - 1];
    const currentVal = (donaturRow[key] ?? 0) as number;

    if (mode === "skip") {
      if (currentVal && currentVal > 0) {
        skippedMonths.push(m);
        continue;
      }
      updatePayload[key] = jumlah;
      savedMonths.push(m);
    } else if (mode === "replace") {
      updatePayload[key] = jumlah;
      savedMonths.push(m);
    } else if (mode === "accumulate") {
      const newVal = (currentVal || 0) + jumlah;
      updatePayload[key] = newVal;
      savedMonths.push(m);
    }
  }

  if (Object.keys(updatePayload).length > 0) {
    const { error: upErr } = await supabase
      .from("Donatur")
      .update({ ...updatePayload, updatedAt: new Date().toISOString() })
      .eq("id", donaturId);
    if (upErr) {
      throw new Error("Gagal menyimpan transaksi");
    }
  }

  // Sinkronkan tabel Pemasukan agar rekap tahunan ikut ter-update
  if (savedMonths.length > 0) {
    try {
      await syncPemasukanForDonatur(donaturId);
    } catch (e) {
      console.error("Sync pemasukan gagal:", e);
      // lanjut tanpa throw agar UX tetap jalan
    }
  }

  return {
    success: true,
    jumlah,
    bulan: bulan ?? null,
    bulanList: monthsToProcess,
    savedMonths,
    skippedMonths,
    mode,
    tahun,
    donaturId,
  };
}