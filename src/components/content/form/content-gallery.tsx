// src/components/content/form/content-gallery.tsx
"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  Calendar,
  Clock,
  Tag,
  User,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ContentListItem } from "./types";
import { safeFormatDate } from "@/lib/date-helper";

interface ContentGalleryProps {
  onViewDetail: (content: ContentListItem) => void;
  onEditContent: (content: ContentListItem) => void;
  searchQuery?: string;
  kategoriFilter?: string;
  sortBy?: string;
  initialContents: ContentListItem[];
  initialError?: string | null;
  deleteContentAction: (
    id: string
  ) => Promise<{ success: boolean; error?: string }>;
  refreshContentData: () => Promise<{
    success: boolean;
    data?: ContentListItem[];
    error?: string;
  }>;
  sortByDate?: (contents: ContentListItem[], order: 'asc' | 'desc') => ContentListItem[];
}

const KATEGORI_CONFIG = {
  KEGIATAN_MASJID: { label: "Kegiatan Masjid", color: "bg-blue-500 text-blue-50" },
  PENGUMUMAN: { label: "Pengumuman", color: "bg-purple-500 text-purple-50" },
  KAJIAN_RUTIN: { label: "Kajian Rutin", color: "bg-green-500 text-green-50" },
  KEGIATAN_TPQ_TPA: { label: "Kegiatan TPQ/TPA", color: "bg-yellow-500 text-yellow-50" },
  LOMBA_DAN_ACARA: { label: "Lomba dan Acara", color: "bg-pink-500 text-pink-50" },
  PROGRAM_RAMADHAN: { label: "Program Ramadhan", color: "bg-indigo-500 text-indigo-50" },
  IDUL_FITRI: { label: "Idul Fitri", color: "bg-teal-500 text-teal-50" },
  IDUL_ADHA: { label: "Idul Adha", color: "bg-orange-500 text-orange-50" },
  BAKTI_SOSIAL: { label: "Bakti Sosial", color: "bg-red-500 text-red-50" },
} as const;

const getKategoriInfo = (kategori: string) => {
  return (
    (KATEGORI_CONFIG as any)[kategori] || {
      label: "Lainnya",
      color: "bg-gray-500 text-gray-50",
    }
  );
};

const ContentCard = ({
  content,
  onViewDetail,
  onEditContent,
  onDelete,
  index,
}: {
  content: ContentListItem;
  onViewDetail: (content: ContentListItem) => void;
  onEditContent: (content: ContentListItem) => void;
  onDelete: (id: string) => void;
  index: number;
}) => {
  const kategoriInfo = getKategoriInfo(content.kategori);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group h-full overflow-hidden border transition-all duration-300 hover:border-primary/20 hover:shadow-lg">
        <div className="relative h-48 overflow-hidden">
          <img
            src={content.fotoUrl || "/api/placeholder/600/400"}
            alt={content.judul}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {content.penting && (
            <div className="absolute right-3 top-3">
              <Badge variant="destructive" className="px-3 py-1 font-medium">
                Penting
              </Badge>
            </div>
          )}

          <div className="absolute bottom-3 left-3">
            <Badge className={`${kategoriInfo.color} px-3 py-1 font-medium`}>
              {kategoriInfo.label}
            </Badge>
          </div>
        </div>

        <CardHeader className="px-4 py-3">
          <CardTitle className="line-clamp-2 text-xl">
            {content.judul}
          </CardTitle>
          <CardDescription className="mt-2 flex flex-col gap-1">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{safeFormatDate(content.tanggal)}</span>
            </div>
            {content.waktu && (
              <div className="flex items-center text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>{content.waktu}</span>
              </div>
            )}
            <div className="flex items-center text-muted-foreground">
              <User className="mr-2 h-4 w-4" />
              <span>{content.penulis}</span>
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow px-4 py-2">
          <p className="line-clamp-3 text-muted-foreground">
            {content.deskripsi}
          </p>
        </CardContent>

        <CardFooter className="mt-auto flex justify-between gap-2 border-t border-border px-4 py-1">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => onViewDetail(content)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Lihat
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => onEditContent(content)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Konten
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="lg"
                className="flex-1"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Konten</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus konten "{content.judul}"?
                  Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => onDelete(content.id.toString())}
                >
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <Card key={index} className="h-full overflow-hidden">
        <div className="h-48">
          <Skeleton className="h-full w-full" />
        </div>
        <CardHeader>
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-6 w-full" />
          <div className="mt-2 flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

const EmptyState = ({
  hasFilters,
  searchQuery,
  kategoriFilter,
}: {
  hasFilters: boolean;
  searchQuery: string;
  kategoriFilter: string;
}) => (
  <motion.div
    className="col-span-full flex flex-col items-center justify-center py-16 text-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="rounded-full bg-muted p-6">
      <Tag className="h-10 w-10 text-muted-foreground" />
    </div>
    <h3 className="mt-4 text-xl font-medium">Tidak ada konten</h3>
    <p className="mt-2 max-w-md text-muted-foreground">
      {hasFilters
        ? "Tidak ada konten yang sesuai dengan filter yang dipilih. Coba ubah kriteria pencarian Anda."
        : 'Belum ada konten yang ditambahkan. Silakan tambahkan konten baru dengan mengklik tombol "Tambah Konten".'}
    </p>
  </motion.div>
);

export function ContentGallery({
  onViewDetail,
  onEditContent,
  searchQuery = "",
  kategoriFilter = "all",
  sortBy = "newest",
  initialContents,
  initialError,
  deleteContentAction,
  refreshContentData,
}: ContentGalleryProps) {
  const [contents, setContents] = useState<ContentListItem[]>(initialContents);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  const filteredAndSortedContents = useMemo(() => {
    let filtered = contents.filter((content) => {
      const matchesSearch =
        !searchQuery ||
        content.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        kategoriFilter === "all" ||
        String(content.kategori) === kategoriFilter;

      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
        case "name_asc":
          return a.judul.localeCompare(b.judul, "id");
        case "name_desc":
          return b.judul.localeCompare(a.judul, "id");
        case "newest":
        default:
          return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
      }
    });
  }, [contents, searchQuery, kategoriFilter, sortBy]);

  const handleDeleteContent = async (id: string) => {
    try {
      setIsLoading(true);
      const result = await deleteContentAction(id);

      if (result.success) {
        setContents((prev) =>
          prev.filter((content) => content.id.toString() !== id)
        );
        toast.success("Konten berhasil dihapus");
      } else {
        toast.error(result.error || "Gagal menghapus konten");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus konten");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/20">
          <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="mt-4 text-xl font-semibold">Terjadi Kesalahan</h3>
        <p className="mt-2 max-w-md text-muted-foreground">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-6"
          variant="outline"
        >
          Muat Ulang
        </Button>
      </div>
    );
  }

  if (filteredAndSortedContents.length === 0) {
    return (
      <EmptyState
        hasFilters={searchQuery !== "" || kategoriFilter !== "all"}
        searchQuery={searchQuery}
        kategoriFilter={kategoriFilter}
      />
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {filteredAndSortedContents.map((content, index) => (
        <ContentCard
          key={content.id}
          content={content}
          onViewDetail={onViewDetail}
          onEditContent={onEditContent}
          onDelete={handleDeleteContent}
          index={index}
        />
      ))}
    </motion.div>
  );
}
