import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import PenagihanDonaturPage from "@/components/finance/penagihan-donatur/PenagihanDonaturPage";
import { getDonaturData } from "@/lib/services/supabase/donatur";
import { DonaturData } from "@/lib/schema/pemasukan/schema";

export const metadata: Metadata = {
  title: "Penagihan Donatur - Masjid Jawahiruzzarqa",
  description: "Form penagihan bulanan donatur rutin oleh Remas.",
  keywords: ["penagihan", "donatur", "admin", "masjid", "keuangan"],
};

export default async function PenagihanDonatur() {
  const tahun = new Date().getFullYear();
  let donaturList: DonaturData[] = [];
  try {
    donaturList = await getDonaturData(tahun);
  } catch (e) {
    console.error("Gagal memuat donatur:", e);
  }
  return (
    <div>
      <PageBreadcrumb pageTitle="Penagihan Donatur" />
      <main className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <section className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <PenagihanDonaturPage initialDonaturList={donaturList} initialTahun={tahun} />
          </section>
        </div>
      </main>
    </div>
  );
}