// src/app/(admin)/rekap-tahunan/page.tsx
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import { RekapTahunanTable } from "@/components/laporan-keuangan/rekap-tahunan-table";
import { 
  getRekapPemasukanTahunan, 
  getRekapPengeluaranTahunan 
} from "@/lib/services/supabase/rekap-tahunan";
import { type RekapPemasukan, type RekapPengeluaran } from "@/lib/schema/laporan/schema";

export const metadata: Metadata = {
  title: "Rekap Tahunan - Masjid Jawahiruzzarqa",
  description: "Rekap keuangan tahunan berdasarkan data pemasukan dan pengeluaran Masjid Jawahiruzzarqa.",
  keywords: ["rekap", "tahunan", "admin", "masjid", "keuangan", "jawahiruzzarqa"], 
};

// Server action untuk mendapatkan data rekap berdasarkan tahun
async function handleGetRekapData(year: number): Promise<{
  pemasukanData: RekapPemasukan[];
  pengeluaranData: RekapPengeluaran[];
}> {
  "use server";
  try {
    const [pemasukanResult, pengeluaranResult] = await Promise.all([
      getRekapPemasukanTahunan(year),
      getRekapPengeluaranTahunan(year)
    ]);
    
    return {
      pemasukanData: pemasukanResult,
      pengeluaranData: pengeluaranResult,
    };
  } catch (error) {
    console.error("Error mengambil data rekap:", error);
    return {
      pemasukanData: [],
      pengeluaranData: [],
    };
  }
}

// Fungsi untuk mendapatkan tahun-tahun yang tersedia
async function getAvailableYears(): Promise<string[]> {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  // Ambil 5 tahun terakhir
  for (let i = 0; i < 5; i++) {
    years.push((currentYear - i).toString());
  }
  
  return years;
}

interface PageProps {
  searchParams: Promise<{
    year?: string;
  }>;
}

// Main Component
export default async function RekapTahunanPage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedYear = resolvedSearchParams.year;
  const currentYear = selectedYear ? parseInt(selectedYear) : new Date().getFullYear();
  
  // Fetch data dan available years secara parallel
  const [rekapData, availableYears] = await Promise.all([
    handleGetRekapData(currentYear),
    getAvailableYears()
  ]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Rekap Tahunan" />
      <main className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <section className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <RekapTahunanTable
              pemasukanData={rekapData.pemasukanData}
              pengeluaranData={rekapData.pengeluaranData}
              availableYears={availableYears}
              currentYear={currentYear.toString()}
              onGetRekapData={handleGetRekapData}
            />
          </section>
        </div>
      </main>
    </div>
  );
}