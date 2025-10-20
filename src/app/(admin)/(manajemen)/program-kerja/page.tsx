// File: src/app/admin/manajemen/program-kerja/page.tsx

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProgramKerjaManagement from '@/components/manajemen/program-kerja/ProgramKerjaManagement';
import { getProgramKerjaData } from "@/lib/services/supabase/program-kerja";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Program Kerja - Masjid Jawahiruzzarqa",
    description: "Kelola program kerja untuk Pengurus Masjid, Remas, dan Majlis Ta'lim",
};

// ✅ SERVER COMPONENT - menggunakan server service untuk fetching
export default async function ProgramKerjaPage() {
    // Fetch data menggunakan server service
    const { data: programKerjaData, error } = await getProgramKerjaData();

    // Normalize data: convert undefined tahun menjadi null
    const normalizedData = (programKerjaData || []).map(item => ({
        ...item,
        tahun: item.tahun ?? null
    }));

    return (
        <div>
            <PageBreadcrumb pageTitle="Program Kerja" />
            <main className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <section className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        {/* Pass data sebagai props ke client component */}
                        <ProgramKerjaManagement
                            initialData={normalizedData}
                            error={error}
                        />
                    </section>
                </div>
            </main>
        </div>
    );
}