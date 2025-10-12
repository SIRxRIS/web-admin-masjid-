// src/actions/data-integration.ts
"use server";

import { 
  integrateData, 
  getSourceDetail, 
  updateIntegratedData,
  IntegratedData 
} from "@/lib/services/supabase/data-integration";
import { 
  DonaturData, 
  KotakAmalData, 
  DonasiKhususData, 
  KotakAmalMasjidData,
  KotakAmalJumatData 
} from "@/lib/schema/pemasukan/schema";

// Server Action untuk mengintegrasikan semua data donasi
export async function getIntegratedData(
  donaturData: DonaturData[],
  kotakAmalData: KotakAmalData[],
  donasiKhususData: DonasiKhususData[],
  kotakAmalMasjidData: KotakAmalMasjidData[],
  kotakAmalJumatData: KotakAmalJumatData[],
  year: string
): Promise<IntegratedData[]> {
  try {
    if (!year) {
      throw new Error("Tahun tidak boleh kosong");
    }

    const integratedData = integrateData(
      donaturData,
      kotakAmalData,
      donasiKhususData,
      kotakAmalMasjidData,
      kotakAmalJumatData,
      year
    );

    return integratedData;
  } catch (error) {
    console.error("Server Action - Error mengintegrasikan data:", error);
    throw new Error("Gagal mengintegrasikan data donasi");
  }
}

// Server Action untuk mendapatkan detail sumber data
export async function getSourceDataDetail(
  sourceType: 'donatur' | 'kotakAmal' | 'donasiKhusus' | 'kotakAmalMasjid' | 'kotakAmalJumat',
  sourceId: number,
  donaturData: DonaturData[],
  kotakAmalData: KotakAmalData[],
  donasiKhususData: DonasiKhususData[],
  kotakAmalMasjidData: KotakAmalMasjidData[],
  kotakAmalJumatData: KotakAmalJumatData[]
) {
  try {
    if (!sourceType || sourceId === undefined) {
      throw new Error("Parameter sourceType dan sourceId diperlukan");
    }

    const sourceDetail = getSourceDetail(
      sourceType,
      sourceId,
      donaturData,
      kotakAmalData,
      donasiKhususData,
      kotakAmalMasjidData,
      kotakAmalJumatData
    );

    return sourceDetail;
  } catch (error) {
    console.error("Server Action - Error mendapatkan detail sumber:", error);
    throw new Error("Gagal mendapatkan detail sumber data");
  }
}

// Server Action untuk mengupdate data terintegrasi
export async function updateIntegratedDataAction(
  updatedItem: IntegratedData,
  donaturData: DonaturData[],
  kotakAmalData: KotakAmalData[],
  donasiKhususData: DonasiKhususData[],
  kotakAmalMasjidData: KotakAmalMasjidData[],
  kotakAmalJumatData: KotakAmalJumatData[]
) {
  try {
    if (!updatedItem) {
      throw new Error("Data yang akan diupdate tidak boleh kosong");
    }

    const result = updateIntegratedData(
      updatedItem,
      donaturData,
      kotakAmalData,
      donasiKhususData,
      kotakAmalMasjidData,
      kotakAmalJumatData
    );

    return result;
  } catch (error) {
    console.error("Server Action - Error mengupdate data terintegrasi:", error);
    throw new Error("Gagal mengupdate data terintegrasi");
  }
}

// Server Action untuk memvalidasi data integrasi
export async function validateIntegrationData(
  donaturData: DonaturData[],
  kotakAmalData: KotakAmalData[],
  donasiKhususData: DonasiKhususData[],
  kotakAmalMasjidData: KotakAmalMasjidData[],
  kotakAmalJumatData: KotakAmalJumatData[],
  year: string
): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
}> {
  try {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validasi tahun
    if (!year || isNaN(parseInt(year))) {
      errors.push("Tahun tidak valid");
    }

    // Validasi data donatur
    if (donaturData.length === 0) {
      warnings.push("Tidak ada data donatur untuk tahun ini");
    }

    // Validasi data kotak amal
    if (kotakAmalData.length === 0) {
      warnings.push("Tidak ada data kotak amal untuk tahun ini");
    }

    // Validasi data donasi khusus berdasarkan tahun
    const validDonasiKhusus = donasiKhususData.filter(donasi => {
      const date = donasi.tanggal instanceof Date ? donasi.tanggal : new Date(donasi.tanggal);
      return date.getFullYear().toString() === year;
    });

    if (validDonasiKhusus.length === 0) {
      warnings.push("Tidak ada data donasi khusus untuk tahun ini");
    }

    // Validasi data kotak amal masjid berdasarkan tahun
    const validKotakAmalMasjid = kotakAmalMasjidData.filter(item => {
      return item.tahun.toString() === year;
    });

    if (validKotakAmalMasjid.length === 0) {
      warnings.push("Tidak ada data kotak amal masjid untuk tahun ini");
    }

    // Validasi data kotak amal jumat berdasarkan tahun
    const validKotakAmalJumat = kotakAmalJumatData.filter(item => {
      return item.tahun.toString() === year;
    });

    if (validKotakAmalJumat.length === 0) {
      warnings.push("Tidak ada data kotak amal jumat untuk tahun ini");
    }

    // Validasi konsistensi data
    donaturData.forEach((donatur, index) => {
      if (!donatur.nama || donatur.nama.trim() === "") {
        errors.push(`Donatur ke-${index + 1} tidak memiliki nama`);
      }
      
      const monthlyValues = [
        donatur.jan, donatur.feb, donatur.mar, donatur.apr,
        donatur.mei, donatur.jun, donatur.jul, donatur.aug,
        donatur.sep, donatur.okt, donatur.nov, donatur.des, donatur.infaq
      ];
      
      if (monthlyValues.some(val => val < 0)) {
        errors.push(`Donatur ${donatur.nama} memiliki nilai negatif`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    console.error("Server Action - Error validasi data integrasi:", error);
    return {
      isValid: false,
      errors: ["Gagal melakukan validasi data"],
      warnings: []
    };
  }
}
