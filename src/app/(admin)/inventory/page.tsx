import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import { DataTable } from "@/components/inventaris";
import { 
  getInventarisData,
  getAvailableTahun,
  createInventaris,
  updateInventaris,
  deleteInventaris
} from "@/lib/services/supabase/inventaris/inventaris";
import { type InventarisData } from "@/lib/schema/inventaris/schema";

export const metadata: Metadata = {
  title: "Inventaris - Masjid Jawahiruzzarqa",
  description: "Portal admin terpadu untuk mengelola keuangan dan operasional harian Masjid Jawahiruzzarqa.",
  keywords: ["inventaris", "admin", "masjid", "jawahiruzzarqa"],
};

// Wrapper functions untuk client component
async function handleCreateInventaris(data: any, file?: File): Promise<InventarisData> {
  "use server";
  return await createInventaris(data, file);
}

async function handleUpdateInventaris(id: number, data: any, file?: File): Promise<InventarisData> {
  "use server";
  return await updateInventaris(id, data, file);
}

async function handleDeleteInventaris(id: number): Promise<boolean> {
  "use server";
  try {
    await deleteInventaris(id);
    return true;
  } catch (error) {
    console.error("Error deleting inventaris:", error);
    return false;
  }
}

// Main Component
export default async function DaftarInventaris() {
  // Fetch data dan available years secara parallel
  const [rawInventarisData, availableYears] = await Promise.all([
    getInventarisData(),
    getAvailableTahun(),
  ]);

  // Transform data dengan nomor urut
  const inventarisData = rawInventarisData.map((item, index) => ({
    ...item,
    no: index + 1,
  }));

  // Convert tahun ke string array
  const yearsData = availableYears.map((year) => year.toString());
  
  return (
    <div>
      <PageBreadcrumb pageTitle="Daftar Inventaris" />
      <main className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <section className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <DataTable 
              data={inventarisData}
              availableYears={yearsData}
              onCreateInventaris={handleCreateInventaris}
              onUpdateInventaris={handleUpdateInventaris}
              onDeleteInventaris={handleDeleteInventaris}
            />
          </section>
        </div>
      </main>
    </div>
  );
}