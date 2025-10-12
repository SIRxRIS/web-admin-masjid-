// src/app/admin/manajemen/daftar-pengurus
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { PengurusCards } from "@/components/manajemen/daftar-pengurus/pengurus-cards";
import { getPengurusData } from "@/lib/services/supabase/pengurus"; // ✅ Server service di server component
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Pengurus - Masjid Jawahiruzzarqa",
  description: "Kelola data pengurus masjid",
};

// ✅ SERVER COMPONENT - menggunakan server service untuk fetching
export default async function DaftarPengurusPage() {
  // Fetch data menggunakan server service
  const { data: pengurusData, error } = await getPengurusData();

  return (
    <div>
      <PageBreadcrumb pageTitle="Daftar Pengurus" />
      <main className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <section className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Pass data sebagai props ke client component */}
            <PengurusCards 
              initialData={pengurusData || []} 
              error={error} 
            />
          </section>
        </div>
      </main>
    </div>
  );
}