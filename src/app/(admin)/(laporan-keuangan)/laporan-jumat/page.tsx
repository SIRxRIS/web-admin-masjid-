// src/app/(admin)/laporan-jumat/page.tsx
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import LaporanJumatTable from "@/components/laporan-keuangan/laporan-jumat-table";

export const metadata: Metadata = {
  title: "Laporan Jumat - Masjid Jawahiruzzarqa",
  description: "Laporan keuangan mingguan setiap hari Jumat Masjid Jawahiruzzarqa.",
  keywords: ["laporan", "jumat", "mingguan", "admin", "masjid", "keuangan", "jawahiruzzarqa"], 
};

// Main Component
export default function LaporanJumatPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Laporan Jumat" />
      <main className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <section className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <LaporanJumatTable />
          </section>
        </div>
      </main>
    </div>
  );
}