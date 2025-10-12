import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import { DataTable } from "@/components/finance/pengeluaran/table-pengeluaran";
import {
  getPengeluaranData,
  getAvailableTahun,
} from "@/lib/services/supabase/pengeluaran/pengeluaran";

// Metadata harus di level top module
export const metadata: Metadata = {
  title: "Pengeluaran - Masjid Jawahiruzzarqa",
  description: "Portal admin terpadu untuk mengelola keuangan dan operasional harian Masjid Jawahiruzzarqa.",
  keywords: ["pengeluaran", "admin", "masjid", "keuangan", "laporan", "jawahiruzzarqa"],
};

// Hanya satu export default function
export default async function Page() {
  const [rawPengeluaranData, availableYears] = await Promise.all([
    getPengeluaranData(),
    getAvailableTahun(),
  ]);

  const pengeluaranData = rawPengeluaranData.map((item, index) => ({
    ...item,
    no: index + 1,
    // Perbaikan: Hapus `|| undefined` karena `keterangan` harus berupa string
    keterangan: item.keterangan,
  }));

  // Convert tahun ke string array
  const yearsData = availableYears.map((year) => year.toString());

  return (
    <div>
      <PageBreadcrumb pageTitle="Pengeluaran" />
      <main className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <section className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <DataTable data={pengeluaranData} availableYears={yearsData} />
          </section>
        </div>
      </main>
    </div>
  );
}