// src/app/(admin)/content/page.tsx
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ContentPageClient } from "@/components/content/form/content-page";
import { ContentListItem } from "@/components/content/form/types";
import {
  getKontenData,
  deleteKonten,
  KontenData,
} from "@/lib/services/supabase/konten";
import { safeFormatDate } from "@/lib/date-helper";
import { revalidatePath } from "next/cache";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Konten - Masjid Jawahiruzzarqa",
  description: "Portal admin terpadu untuk mengelola keuangan dan operasional harian Masjid Jawahiruzzarqa.",
  keywords: ["konten", "admin", "masjid", "dokumentasi", "jawahiruzzarqa"],
};

// Helper function to transform KontenData to ContentListItem
function transformKontenToContentListItem(konten: KontenData, index: number): ContentListItem {
  return {
    id: konten.id,
    judul: konten.judul,
    deskripsi: konten.deskripsi,
    tanggal: safeFormatDate(konten.tanggal, "dd/MM/yyyy"),
    waktu: konten.waktu || undefined,
    penulis: konten.penulis || "",
    kategoriId: konten.kategoriId,
    fotoUrl: konten.fotoUrl || undefined,
    penting: konten.penting,
    no: index + 1,
  };
}

// Server Actions
async function deleteContentAction(id: string) {
  "use server";

  try {
    await deleteKonten(Number(id));
    revalidatePath("/content");
    return { success: true };
  } catch (error) {
    console.error("Error deleting content:", error);
    return {
      success: false,
      error: "Gagal menghapus konten. Silakan coba lagi nanti.",
    };
  }
}

async function refreshContentData() {
  "use server";

  try {
    const data = await getKontenData();
    const transformedData = data.map((item, index) => 
      transformKontenToContentListItem(item, index)
    );
    revalidatePath("/content");
    return { success: true, data: transformedData };
  } catch (error) {
    console.error("Error refreshing content data:", error);
    return {
      success: false,
      error: "Gagal memuat data konten. Silakan coba lagi nanti.",
    };
  }
}

interface ContentPageData {
  initialKontenData: ContentListItem[];
  error: string | null;
}

async function getContentPageData(): Promise<ContentPageData> {
  try {
    const data = await getKontenData();
    const transformedData = data.map((item, index) => 
      transformKontenToContentListItem(item, index)
    );

    return {
      initialKontenData: transformedData,
      error: null,
    };
  } catch (error) {
    console.error("Error loading content data:", error);
    return {
      initialKontenData: [],
      error: "Gagal memuat data konten. Silakan coba lagi nanti.",
    };
  }
}

// Main Component
export default async function Content() {
  const { initialKontenData, error } = await getContentPageData();

  return (
    <div>
      <PageBreadcrumb pageTitle="Konten" />
      <main className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <section className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <ContentPageClient
              initialKontenData={initialKontenData}
              initialError={error}
              deleteContentAction={deleteContentAction}
              refreshContentData={refreshContentData}
            />
          </section>
        </div>
      </main>
    </div>
  );
}