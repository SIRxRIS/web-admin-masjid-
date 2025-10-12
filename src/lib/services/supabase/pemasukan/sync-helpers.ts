// src/lib/services/supabase/pemasukan/sync-helpers.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getDonaturById, getKotakAmalData, getDonasiKhususById, getKotakAmalMasjidData, getDonaturData, getDonasiKhususData } from "./pemasukan";

/**
 * Auto-sync pemasukan untuk donatur tertentu
 * Dipanggil ketika data donatur diupdate/dibuat/dihapus
 */
export async function syncPemasukanForDonatur(donaturId: number): Promise<void> {
  try {
    const supabase = supabaseAdmin;
    
    // Ambil data donatur
    const donatur = await getDonaturById(donaturId);
    if (!donatur) {
      console.warn(`Donatur dengan ID ${donaturId} tidak ditemukan`);
      return;
    }

    // Hapus data pemasukan lama untuk donatur ini
    await supabase
      .from("Pemasukan")
      .delete()
      .eq("donaturId", donaturId);

    // Buat data pemasukan baru berdasarkan data donatur
    const pemasukanData = [];
    const bulanNames = [
      "jan", "feb", "mar", "apr", "mei", "jun",
      "jul", "aug", "sep", "okt", "nov", "des"
    ];

    for (let i = 0; i < 12; i++) {
      const bulan = i + 1;
      const bulanKey = bulanNames[i] as keyof typeof donatur;
      const jumlah = donatur[bulanKey] as number;

      if (jumlah && jumlah > 0) {
        pemasukanData.push({
          sumber: "Donatur",
          donaturId: donatur.id,
          kotakAmalId: null,
          kotakMasjidId: null,
          donasiKhususId: null,
          jumlah: jumlah,
          bulan: bulan,
          tahun: donatur.tahun,
          tanggal: new Date(donatur.tahun, i, 1).toISOString().split('T')[0],
          keterangan: `Donasi dari ${donatur.nama} - ${bulanNames[i].toUpperCase()} ${donatur.tahun}`
        });
      }
    }

    // Insert data pemasukan baru
    if (pemasukanData.length > 0) {
      const { error } = await supabase
        .from("Pemasukan")
        .insert(pemasukanData);

      if (error) {
        console.error("Error sync pemasukan untuk donatur:", error);
        throw error;
      }
    }

    console.log(`Sync pemasukan untuk donatur ${donatur.nama} berhasil`);
  } catch (error) {
    console.error("Error dalam syncPemasukanForDonatur:", error);
    throw error;
  }
}

/**
 * Auto-sync pemasukan untuk kotak amal tertentu
 * Dipanggil ketika data kotak amal diupdate/dibuat/dihapus
 */
export async function syncPemasukanForKotakAmal(kotakAmalId: number): Promise<void> {
  try {
    const supabase = supabaseAdmin;
    
    // Ambil data kotak amal berdasarkan ID
    const kotakAmalData = await getKotakAmalData();
    const kotakAmal = kotakAmalData.find(item => item.id === kotakAmalId);
    
    if (!kotakAmal) {
      console.warn(`Kotak Amal dengan ID ${kotakAmalId} tidak ditemukan`);
      return;
    }

    // Hapus data pemasukan lama untuk kotak amal ini
    await supabase
      .from("Pemasukan")
      .delete()
      .eq("kotakAmalId", kotakAmalId);

    // Buat data pemasukan baru berdasarkan data kotak amal
    const pemasukanData = [];
    const bulanNames = [
      "jan", "feb", "mar", "apr", "mei", "jun",
      "jul", "aug", "sep", "okt", "nov", "des"
    ];

    for (let i = 0; i < 12; i++) {
      const bulan = i + 1;
      const bulanKey = bulanNames[i] as keyof typeof kotakAmal;
      const jumlah = kotakAmal[bulanKey] as number;

      if (jumlah && jumlah > 0) {
        pemasukanData.push({
          sumber: "Kotak Amal",
          donaturId: null,
          kotakAmalId: kotakAmal.id,
          kotakMasjidId: null,
          donasiKhususId: null,
          jumlah: jumlah,
          bulan: bulan,
          tahun: kotakAmal.tahun,
          tanggal: new Date(kotakAmal.tahun, i, 1).toISOString().split('T')[0],
          keterangan: `Kotak Amal ${kotakAmal.lokasi} - ${bulanNames[i].toUpperCase()} ${kotakAmal.tahun}`
        });
      }
    }

    // Insert data pemasukan baru
    if (pemasukanData.length > 0) {
      const { error } = await supabase
        .from("Pemasukan")
        .insert(pemasukanData);

      if (error) {
        console.error("Error sync pemasukan untuk kotak amal:", error);
        throw error;
      }
    }

    console.log(`Sync pemasukan untuk kotak amal ${kotakAmal.lokasi} berhasil`);
  } catch (error) {
    console.error("Error dalam syncPemasukanForKotakAmal:", error);
    throw error;
  }
}

/**
 * Auto-sync pemasukan untuk donasi khusus tertentu
 * Dipanggil ketika data donasi khusus diupdate/dibuat/dihapus
 */
export async function syncPemasukanForDonasiKhusus(donasiKhususId: number): Promise<void> {
  try {
    const supabase = supabaseAdmin;
    
    // Ambil data donasi khusus
    const donasiKhusus = await getDonasiKhususById(donasiKhususId);
    if (!donasiKhusus) {
      console.warn(`Donasi Khusus dengan ID ${donasiKhususId} tidak ditemukan`);
      return;
    }

    // Hapus data pemasukan lama untuk donasi khusus ini
    await supabase
      .from("Pemasukan")
      .delete()
      .eq("donasiKhususId", donasiKhususId);

    // Buat data pemasukan baru berdasarkan data donasi khusus
    const pemasukanData = {
      sumber: "Donasi Khusus",
      donaturId: null,
      kotakAmalId: null,
      kotakMasjidId: null,
      donasiKhususId: donasiKhusus.id,
      jumlah: donasiKhusus.jumlah,
      bulan: donasiKhusus.bulan,
      tahun: donasiKhusus.tahun,
      tanggal: donasiKhusus.tanggal,
      keterangan: `Donasi Khusus: ${donasiKhusus.keterangan || 'Donasi khusus'}`
    };

    // Insert data pemasukan baru
    const { error } = await supabase
      .from("Pemasukan")
      .insert([pemasukanData]);

    if (error) {
      console.error("Error sync pemasukan untuk donasi khusus:", error);
      throw error;
    }

    console.log(`Sync pemasukan untuk donasi khusus berhasil`);
  } catch (error) {
    console.error("Error dalam syncPemasukanForDonasiKhusus:", error);
    throw error;
  }
}

/**
 * Auto-sync pemasukan untuk kotak amal masjid tertentu
 * Dipanggil ketika data kotak amal masjid diupdate/dibuat/dihapus
 */
export async function syncPemasukanForKotakAmalMasjid(kotakMasjidId: number): Promise<void> {
  try {
    const supabase = supabaseAdmin;
    
    // Ambil data kotak amal masjid berdasarkan ID
    const kotakAmalMasjidData = await getKotakAmalMasjidData();
    const kotakMasjid = kotakAmalMasjidData.find(item => item.id === kotakMasjidId);
    
    if (!kotakMasjid) {
      console.warn(`Kotak Amal Masjid dengan ID ${kotakMasjidId} tidak ditemukan`);
      return;
    }

    // Hapus data pemasukan lama untuk kotak amal masjid ini
    await supabase
      .from("Pemasukan")
      .delete()
      .eq("kotakMasjidId", kotakMasjidId);

    // Buat data pemasukan baru berdasarkan data kotak amal masjid
    const tanggalObj = new Date(kotakMasjid.tanggal);
    const pemasukanData = {
      sumber: "Kotak Amal Masjid",
      donaturId: null,
      kotakAmalId: null,
      kotakMasjidId: kotakMasjid.id,
      donasiKhususId: null,
      jumlah: kotakMasjid.jumlah,
      bulan: tanggalObj.getMonth() + 1,
      tahun: kotakMasjid.tahun,
      tanggal: kotakMasjid.tanggal,
      keterangan: `Kotak Amal Masjid - ${kotakMasjid.tanggal}`
    };

    // Insert data pemasukan baru
    const { error } = await supabase
      .from("Pemasukan")
      .insert([pemasukanData]);

    if (error) {
      console.error("Error sync pemasukan untuk kotak amal masjid:", error);
      throw error;
    }

    console.log(`Sync pemasukan untuk kotak amal masjid berhasil`);
  } catch (error) {
    console.error("Error dalam syncPemasukanForKotakAmalMasjid:", error);
    throw error;
  }
}

/**
 * Sync semua pemasukan - untuk keperluan manual jika diperlukan
 */
export async function syncAllPemasukan(): Promise<boolean> {
  try {
    const supabase = supabaseAdmin;
    
    // Hapus semua data pemasukan
    await supabase.from("Pemasukan").delete().neq("id", 0);
    
    // Sync semua donatur
    const donaturData = await getDonaturData();
    for (const donatur of donaturData) {
      await syncPemasukanForDonatur(donatur.id);
    }
    
    // Sync semua kotak amal
    const kotakAmalData = await getKotakAmalData();
    for (const kotakAmal of kotakAmalData) {
      await syncPemasukanForKotakAmal(kotakAmal.id);
    }
    
    // Sync semua donasi khusus
    const donasiKhususData = await getDonasiKhususData();
    for (const donasiKhusus of donasiKhususData) {
      await syncPemasukanForDonasiKhusus(donasiKhusus.id);
    }
    
    // Sync semua kotak amal masjid
    const kotakAmalMasjidData = await getKotakAmalMasjidData();
    for (const kotakMasjid of kotakAmalMasjidData) {
      await syncPemasukanForKotakAmalMasjid(kotakMasjid.id);
    }
    
    console.log("Sync semua pemasukan berhasil");
    return true;
  } catch (error) {
    console.error("Error dalam syncAllPemasukan:", error);
    return false;
  }
}