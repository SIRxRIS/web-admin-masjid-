// src/app/admin/manajemen/visi-misi
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import VisiMisiManagement from '@/components/manajemen/visi-misi/VisiMisiManagement';
import { getVisiMisiData } from "@/lib/services/supabase/visi-misi"; // ✅ Server service di server component
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visi & Misi - Masjid Jawahiruzzarqa",
  description: "Kelola visi dan misi untuk Pengurus Masjid, Remas, dan Majlis Ta'lim",
};

// ✅ SERVER COMPONENT - menggunakan server service untuk fetching
export default async function VisiMisiPage() {
  // Fetch data menggunakan server service
  const { data: visiMisiData, error } = await getVisiMisiData();

  return (
    <div>
      <PageBreadcrumb pageTitle="Visi & Misi" />
      <main className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <section className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Pass data sebagai props ke client component */}
            <VisiMisiManagement 
              initialData={visiMisiData || []} 
              error={error} 
            />
          </section>
        </div>
      </main>
    </div>
  );
}