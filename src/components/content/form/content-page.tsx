// src/components/content/form/content-page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ContentForm } from "./content-form/content-form";
import { ContentGallery } from "./content-gallery";
import { ContentDetail } from "./content-detail";
import { ContentEdit } from "./content-edit/content-edit";
import { Search, PlusCircle, Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentListItem } from "./types";
import {
  KontenData,
  KontenDataWithTags,
  StatusKonten,
  kategoriKontenContoh,
  ContentFormValues,
  GambarKontenType
} from "@/lib/schema/konten/schema";
import { safeFormatDate, toValidDate } from "@/lib/date-helper";

// Extended form type that includes gambarKonten for form submission
interface ExtendedContentFormValues extends ContentFormValues {
  gambarKonten?: GambarKontenType[];
}

interface ContentPageClientProps {
  initialKontenData: ContentListItem[];
  initialError?: string | null;
  deleteContentAction: (
    id: string
  ) => Promise<{ success: boolean; error?: string }>;
  refreshContentData: () => Promise<{
    success: boolean;
    data?: ContentListItem[];
    error?: string;
  }>;
}

const KATEGORI_OPTIONS = [
  { value: "all", label: "Semua Kategori" },
  ...kategoriKontenContoh.map(kat => ({
    value: String(kat.value),
    label: kat.label
  }))
];

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "name_asc", label: "Nama (A-Z)" },
  { value: "name_desc", label: "Nama (Z-A)" },
];

export function ContentPageClient({
  initialKontenData,
  initialError,
  deleteContentAction,
  refreshContentData,
}: ContentPageClientProps) {
  const router = useRouter();
  const [view, setView] = useState<"gallery" | "form" | "detail" | "edit">(
    "gallery"
  );
  const [selectedContent, setSelectedContent] = useState<ContentListItem | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(false);

  const handleViewDetail = (content: ContentListItem) => {
    setSelectedContent(content);
    setView("detail");
  };

  const handleEditContent = (content: ContentListItem) => {
    setSelectedContent(content);
    setView("edit");
  };

  const handleBackToGallery = () => {
    setView("gallery");
    setSelectedContent(null);
  };

  const handleFormSuccess = () => {
    setView("gallery");
  };

  // ✅ Handler untuk submit data konten
  const handleSubmitData = async (
    data: any,
    fileUtama: File | null,
    additionalFiles: File[]
  ) => {
    try {
      setIsLoading(true);

      // Construct FormData for submission
      const formData = new FormData();

      // Add basic form fields
      formData.append("judul", data.judul);
      formData.append("kategori", String(data.kategori));

      const tanggalValue = data.tanggal instanceof Date
        ? data.tanggal
        : new Date(data.tanggal);

      if (Number.isNaN(tanggalValue.getTime())) {
        throw new Error("Tanggal konten tidak valid. Pastikan format tanggal benar.");
      }

      formData.append("tanggal", tanggalValue.toISOString());
      formData.append("deskripsi", data.deskripsi);
      formData.append("status", data.status);
      formData.append("tags", JSON.stringify(data.tags || []));

      // Add optional fields
      if (data.penulis) formData.append("penulis", data.penulis);
      if (data.waktu) formData.append("waktu", data.waktu);
      if (data.lokasi) formData.append("lokasi", data.lokasi);
      if (data.donaturId) formData.append("donaturId", data.donaturId.toString());
      if (data.kotakAmalId) formData.append("kotakAmalId", data.kotakAmalId.toString());

      formData.append("tampilkanDiBeranda", data.tampilkanDiBeranda.toString());
      formData.append("penting", data.penting.toString());

      // Add main file if exists
      if (fileUtama) {
        formData.append("file", fileUtama);
      }

      // Add additional files
      additionalFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/konten", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Konten berhasil disimpan!");
        // Refresh content data
        await refreshContentData();
        router.push("/admin/content");
      } else {
        toast.error(result.error || "Gagal menyimpan konten");
      }
    } catch (error) {
      console.error("Error submitting content:", error);
      toast.error("Terjadi kesalahan saat menyimpan konten");
    } finally {
      setIsLoading(false);
    }
  };

  const toSchemaKonten = (c: ContentListItem): KontenData => {
    const validDate = toValidDate(c.tanggal) || new Date();

    return {
      id: c.id,
      judul: c.judul,
      slug: "",
      deskripsi: c.deskripsi,
      tanggal: validDate,
      waktu: c.waktu || null,
      lokasi: null,
      penulis: c.penulis || null,
      kategori: c.kategori as any,
      donaturId: null,
      kotakAmalId: null,
      penting: c.penting,
      tampilkanDiBeranda: true,
      status: StatusKonten.PUBLISHED,
      viewCount: 0,
      fotoUrl: c.fotoUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  // ✅ Konversi ke KontenDataWithTags
  const toSchemaKontenWithTags = (c: ContentListItem): KontenDataWithTags => ({
    ...toSchemaKonten(c),
    tags: [], // Empty tags for now
  });

  // ✅ Helper functions using date-helper
  const getFormattedDate = (tanggal: unknown): string => {
    return safeFormatDate(tanggal, "dd MMMM yyyy");
  };

  const sortContentByDate = (contents: ContentListItem[], order: 'asc' | 'desc') => {
    return [...contents].sort((a, b) => {
      const dateA = toValidDate(a.tanggal);
      const dateB = toValidDate(b.tanggal);

      if (!dateA || !dateB) return 0;

      return order === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });
  };

  return (
    <div className="py-6">
      <AnimatePresence mode="wait">
        {view === "form" && (
          <motion.div
            key="form-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-4xl"
          >
            <ContentForm
              onCancel={handleBackToGallery}
              onSuccess={handleFormSuccess}
              onSubmitData={handleSubmitData}
            />
          </motion.div>
        )}

        {view === "detail" && selectedContent && (
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-4xl"
          >
            <ContentDetail
              content={toSchemaKonten(selectedContent)}
              onBack={handleBackToGallery}
            />
          </motion.div>
        )}

        {view === "edit" && selectedContent && (
          <motion.div
            key="edit-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-4xl"
          >
            <ContentEdit
              content={toSchemaKontenWithTags(selectedContent)}
              onCancel={handleBackToGallery}
              onSuccess={handleFormSuccess}
            />
          </motion.div>
        )}

        {view === "gallery" && (
          <motion.div
            key="gallery-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >

            {/* Search and Filters */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Cari konten berdasarkan judul atau deskripsi..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Select
                  value={kategoriFilter}
                  onValueChange={setKategoriFilter}
                >
                  <SelectTrigger className="w-[200px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {KATEGORI_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => setView("form")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="default"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Konten
                </Button>
              </div>
            </motion.div>

            {/* Content Gallery */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <ContentGallery
                onViewDetail={handleViewDetail}
                onEditContent={handleEditContent}
                searchQuery={searchQuery}
                kategoriFilter={kategoriFilter}
                sortBy={sortBy}
                initialContents={initialKontenData}
                initialError={initialError}
                deleteContentAction={deleteContentAction}
                refreshContentData={refreshContentData}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}