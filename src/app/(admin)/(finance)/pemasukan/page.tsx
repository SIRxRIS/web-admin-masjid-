import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/finance/pemasukan/table-donation";
import { Metadata } from "next";
import React from "react";
import {
  getDonaturData,
  getAvailableTahun as getDonaturYears,
} from "@/lib/services/supabase/donatur";
import {
  getDonasiKhusus,
  getAvailableTahun as getDonasiKhususYears,
} from "@/lib/services/supabase/donasi-khusus";
import {
  getKotakAmalData,
  getAvailableTahun as getKotakAmalYears,
} from "@/lib/services/supabase/kotak-amal";
import {
  getKotakAmalMasjidData,
  getAvailableTahun as getKotakAmalMasjidYears,
} from "@/lib/services/supabase/kotak-amal-masjid";
import {
  getKotakAmalJumatData,
  getAvailableTahun as getKotakAmalJumatYears,
} from "@/lib/services/supabase/kotak-amal-jumat";

export const metadata: Metadata = {
  title: "Pemasukan - Masjid Jawahiruzzarqa",
  description: "Portal admin terpadu untuk mengelola keuangan dan operasional harian Masjid Jawahiruzzarqa.",
  keywords: ["pemasukan", "admin", "masjid", "keuangan", "laporan", "jawahiruzzarqa"],
};

// Types
interface AvailableYears {
  donatur: number[];
  donasiKhusus: number[];
  kotakAmal: number[];
  kotakAmalMasjid: number[];
  kotakAmalJumat: number[];
  riwayatTahunan: number[];
}

interface FinanceData {
  donaturData: any[];
  donasiKhususData: any[];
  kotakAmalData: any[];
  kotakAmalMasjidData: any[];
  kotakAmalJumatData: any[];
  availableYears: AvailableYears;
}

// Utility Functions
const extractYearsFromPromise = (
  result: PromiseSettledResult<number[]>,
  fallbackYear: number
): number[] => {
  if (result.status === "fulfilled" && Array.isArray(result.value)) {
    return result.value.filter(
      (year): year is number => typeof year === "number" && year > 0
    );
  }
  return [fallbackYear];
};

const getCurrentYear = (): number => new Date().getFullYear();

// Data Fetching Functions
async function fetchAvailableYears(): Promise<AvailableYears> {
  const currentYear = getCurrentYear();

  try {
    const yearPromises = await Promise.allSettled([
      getDonaturYears(),
      getKotakAmalYears(),
      getDonasiKhususYears(),
      getKotakAmalMasjidYears(),
      getKotakAmalJumatYears(),
    ]);

    const [
      donaturResult,
      kotakAmalResult,
      donasiKhususResult,
      kotakAmalMasjidResult,
      kotakAmalJumatResult,
    ] = yearPromises;

    const donatur = extractYearsFromPromise(donaturResult, currentYear);
    const kotakAmal = extractYearsFromPromise(kotakAmalResult, currentYear);
    const donasiKhusus = extractYearsFromPromise(
      donasiKhususResult,
      currentYear
    );
    const kotakAmalMasjid = extractYearsFromPromise(
      kotakAmalMasjidResult,
      currentYear
    );
    const kotakAmalJumat = extractYearsFromPromise(
      kotakAmalJumatResult,
      currentYear
    );

    // Gabungkan dan deduplikasi semua tahun
    const allYears = [
      ...donatur,
      ...kotakAmal,
      ...donasiKhusus,
      ...kotakAmalMasjid,
      ...kotakAmalJumat,
    ];
    const uniqueYears = [...new Set(allYears)].sort((a, b) => b - a);

    return {
      donatur: donatur.length > 0 ? donatur : [currentYear],
      donasiKhusus: donasiKhusus.length > 0 ? donasiKhusus : [currentYear],
      kotakAmal: kotakAmal.length > 0 ? kotakAmal : [currentYear],
      kotakAmalMasjid:
        kotakAmalMasjid.length > 0 ? kotakAmalMasjid : [currentYear],
      kotakAmalJumat:
        kotakAmalJumat.length > 0 ? kotakAmalJumat : [currentYear],
      riwayatTahunan: uniqueYears.length > 0 ? uniqueYears : [currentYear],
    };
  } catch (error) {
    console.error("Error mengambil data tahun:", error);

    // Return default data dengan tahun saat ini
    return {
      donatur: [currentYear],
      donasiKhusus: [currentYear],
      kotakAmal: [currentYear],
      kotakAmalMasjid: [currentYear],
      kotakAmalJumat: [currentYear],
      riwayatTahunan: [currentYear],
    };
  }
}

async function fetchFinanceData(): Promise<FinanceData> {
  try {
    const [
      donaturData,
      donasiKhususData,
      kotakAmalData,
      kotakAmalMasjidData,
      kotakAmalJumatData,
      availableYears,
    ] = await Promise.all([
      getDonaturData(),
      getDonasiKhusus(),
      getKotakAmalData(),
      getKotakAmalMasjidData(),
      getKotakAmalJumatData(),
      fetchAvailableYears(),
    ]);

    return {
      donaturData: donaturData || [],
      donasiKhususData: donasiKhususData || [],
      kotakAmalData: kotakAmalData || [],
      kotakAmalMasjidData: kotakAmalMasjidData || [],
      kotakAmalJumatData: kotakAmalJumatData || [],
      availableYears,
    };
  } catch (error) {
    console.error("Error mengambil data keuangan:", error);

    // Return default data jika terjadi error
    const currentYear = getCurrentYear();
    return {
      donaturData: [],
      donasiKhususData: [],
      kotakAmalData: [],
      kotakAmalMasjidData: [],
      kotakAmalJumatData: [],
      availableYears: {
        donatur: [currentYear],
        donasiKhusus: [currentYear],
        kotakAmal: [currentYear],
        kotakAmalMasjid: [currentYear],
        kotakAmalJumat: [currentYear],
        riwayatTahunan: [currentYear],
      },
    };
  }
}

// Main Component
export default async function Pemasukan() {
  const financeData = await fetchFinanceData();

  return (
    <div>
      <PageBreadcrumb pageTitle="Pemasukan" />
      <main className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <section className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <DataTable
              data={financeData.donaturData}
              kotakAmalData={financeData.kotakAmalData}
              donasiKhususData={financeData.donasiKhususData}
              kotakAmalMasjidData={financeData.kotakAmalMasjidData}
              kotakAmalJumatData={financeData.kotakAmalJumatData}
              availableYears={financeData.availableYears}
            />
          </section>
        </div>
      </main>
    </div>
  );
}