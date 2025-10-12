// src/components/content/form/content-form/content-form.tsx
"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { safeFormatDate } from "@/components/content/date-helper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ContentFormSchema,
  defaultValues,
  GambarKontenType,
} from "@/lib/schema/konten/schema";
import { GeneralTab } from "./form-tabs/general-tab";
import { GalleryTab } from "./form-tabs/gallery-tab";
import { AdvancedTab } from "./form-tabs/advanced-tab";

interface ContentFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
  onSubmitData?: (
    data: any,
    fileUtama: File | null,
    additionalFiles: File[]
  ) => Promise<void>;
}

export function ContentForm({
  onCancel,
  onSuccess,
  onSubmitData,
}: ContentFormProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [gambarKonten, setGambarKonten] = useState<GambarKontenType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("umum");
  const [isDragging, setIsDragging] = useState(false);

  const form = useForm({
    resolver: zodResolver(ContentFormSchema),
    defaultValues,
  });

  async function onSubmit(data: typeof defaultValues) {
    try {
      setIsSubmitting(true);
      const formattedDate = safeFormatDate(data.tanggal, "yyyy-MM-dd");

      const kontenData = {
        judul: data.judul,
        slug: data.judul
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w\-]+/g, ""),
        deskripsi: data.deskripsi,
        tanggal: formattedDate,
        waktu: data.waktu || undefined,
        lokasi: data.lokasi || undefined,
        penulis: data.penulis,
        kategoriId: Number(data.kategoriId),
        donaturId: data.donaturId || undefined,
        kotakAmalId: data.kotakAmalId || undefined,
        penting: data.penting,
        tampilkanDiBeranda: data.tampilkanDiBeranda,
        status: data.status,
        viewCount: 0,
      };

      const gambarUtama = gambarKonten.find((gambar) => gambar.isUtama);
      const fileUtama = gambarUtama?.file ?? null;

      const nonMainImageFiles = imageFiles.filter((file) => {
        if (!gambarUtama) return true;
        return file !== gambarUtama.file;
      });
      if (onSubmitData) {
        await onSubmitData(kontenData, fileUtama, nonMainImageFiles);
      } else {
        console.log("Form submitted but onSubmitData handler not provided", {
          kontenData,
          fileUtama,
          nonMainImageFiles,
        });
        toast.info("Form submitted in preview mode");
      }

      toast.success("Data konten berhasil disimpan!", {
        description: `Konten ${data.judul} telah ditambahkan dengan ${gambarKonten.length} foto.`,
      });

      form.reset(defaultValues);
      setImageFiles([]);
      setGambarKonten([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error("Gagal menyimpan konten", {
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menyimpan konten",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const newFiles = Array.from(files);

      const validFiles = newFiles.filter((file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} terlalu besar`, {
            description: "Maksimal 5MB per file.",
          });
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setImageFiles((prev) => [...prev, ...validFiles]);

        const newGambar: GambarKontenType[] = validFiles.map((file, index) => {
          const preview = URL.createObjectURL(file);

          return {
            filename: file.name,
            file: file,
            preview: preview,
            urutan: gambarKonten.length + index,
            isUtama: gambarKonten.length === 0 && index === 0,
            caption: "",
            url: "",
          };
        });

        setGambarKonten((prev) => [...prev, ...newGambar]);
        toast.success(`${validFiles.length} foto berhasil diunggah`);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (imageFiles.length === 0) {
        toast.error("Format file tidak valid", {
          description: "Hanya file gambar yang diperbolehkan.",
        });
        return;
      }

      const validFiles = imageFiles.filter((file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} terlalu besar`, {
            description: "Maksimal 5MB per file.",
          });
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setImageFiles((prev) => [...prev, ...validFiles]);

        const newGambar: GambarKontenType[] = validFiles.map((file, index) => {
          const preview = URL.createObjectURL(file);

          return {
            filename: file.name,
            file: file,
            preview: preview,
            urutan: gambarKonten.length + index,
            isUtama: gambarKonten.length === 0 && index === 0,
            caption: "",
            url: "", // tambahkan ini agar sesuai tipe GambarKontenType
          };
        });

        setGambarKonten((prev) => [...prev, ...newGambar]);
        toast.success(`${validFiles.length} foto berhasil diunggah`);
      }
    }
  };

  const removeImage = (index: number) => {
    if (gambarKonten[index]?.preview) {
      URL.revokeObjectURL(gambarKonten[index].preview);
    }

    setGambarKonten((prev) => {
      const newGambar = [...prev];

      if (newGambar[index].isUtama && newGambar.length > 1) {
        const nextIndex = index === newGambar.length - 1 ? 0 : index + 1;
        newGambar[nextIndex].isUtama = true;
      }

      newGambar.splice(index, 1);

      return newGambar.map((gambar, idx) => ({
        ...gambar,
        urutan: idx,
      }));
    });

    setImageFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });

    toast.info("Foto telah dihapus");
  };

  const setGambarUtama = (index: number) => {
    setGambarKonten((prev) => {
      return prev.map((gambar, idx) => ({
        ...gambar,
        isUtama: idx === index,
      }));
    });

    toast.success("Foto utama telah diubah");
  };

  const updateCaption = (index: number, caption: string) => {
    setGambarKonten((prev) => {
      const newGambar = [...prev];
      newGambar[index].caption = caption;
      return newGambar;
    });
  };

  const removeAllImages = () => {
    if (gambarKonten.length > 0) {
      gambarKonten.forEach((gambar) => {
        if (gambar.preview) {
          URL.revokeObjectURL(gambar.preview);
        }
      });

      setGambarKonten([]);
      setImageFiles([]);
      toast.info("Semua foto telah dihapus");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-0 py-0 mb-4"
    >
      <Card className="shadow-lg border border-gray-200 dark:border-gray-800">
        <CardHeader className="border-b py-0.5">
          <CardTitle className="text-xl sm:text-2xl font-bold">
            Tambah Konten Masjid
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Tambahkan konten kegiatan, pengumuman, dan informasi masjid
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs
            defaultValue="umum"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              {/* Mobile View */}
              <div className="w-full sm:hidden">
                <Select defaultValue="umum" onValueChange={setActiveTab}>
                  <SelectTrigger className="w-full border-gray-300 dark:border-gray-700">
                    <SelectValue placeholder="Pilih tab" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="umum" className="text-base">
                      Informasi Umum
                    </SelectItem>
                    <SelectItem value="galeri" className="text-base">
                      Galeri Foto
                    </SelectItem>
                    <SelectItem value="lanjutan" className="text-base">
                      Pengaturan Lanjutan
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop View */}
              <TabsList className="hidden sm:flex w-full sm:w-auto bg-muted/50 p-1 rounded-lg">
                <TabsTrigger
                  value="umum"
                  title="Informasi umum konten"
                  className="flex-1 sm:flex-none text-sm sm:text-base px-6 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all"
                >
                  Informasi Umum
                </TabsTrigger>
                <TabsTrigger
                  value="galeri"
                  title="Galeri foto konten"
                  className="flex-1 sm:flex-none text-sm sm:text-base px-6 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all"
                >
                  Galeri Foto
                </TabsTrigger>
                <TabsTrigger
                  value="lanjutan"
                  title="Pengaturan lanjutan"
                  className="flex-1 sm:flex-none text-sm sm:text-base px-6 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all"
                >
                  Pengaturan Lanjutan
                </TabsTrigger>
              </TabsList>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <GeneralTab form={form} isSubmitting={isSubmitting} />

                <GalleryTab
                  gambarKonten={gambarKonten}
                  isSubmitting={isSubmitting}
                  isDragging={isDragging}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                  handleImageUpload={handleImageUpload}
                  removeImage={removeImage}
                  removeAllImages={removeAllImages}
                  setGambarUtama={setGambarUtama}
                  updateCaption={updateCaption}
                />

                <AdvancedTab form={form} isSubmitting={isSubmitting} />

                <CardFooter className="flex justify-end gap-4 px-0">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => {
                      gambarKonten.forEach((gambar) => {
                        if (gambar.preview) {
                          URL.revokeObjectURL(gambar.preview);
                        }
                      });

                      form.reset(defaultValues);
                      setImageFiles([]);
                      setGambarKonten([]);
                      setActiveTab("umum");
                      toast.info("Form telah direset");
                      onCancel();
                    }}
                    className="w-full sm:w-auto"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white" size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        <span>Simpan Konten</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
