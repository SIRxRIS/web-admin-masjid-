// src/components/content/form/content-edit/content-edit.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormFields } from "./form-fields";
import {
  ContentFormSchema,
  ContentFormValues,
  StatusKonten,
  KontenData,
  createContentEditForm,
  KontenDataWithTags,
} from "@/lib/schema/konten/schema";
import { updateKontenWithOptionalFoto } from "@/actions/content";
import Swal from "sweetalert2";

interface ContentEditProps {
  content: KontenDataWithTags;
  onCancel: () => void;
  onSuccess: () => void;
}

export function ContentEdit({
  content,
  onCancel,
  onSuccess,
}: ContentEditProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    content.fotoUrl || null
  );
  const [previewImage, setPreviewImage] = useState<string | null>(
    content.fotoUrl || null
  );
  const [isImageDeleted, setIsImageDeleted] = useState(false);

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(ContentFormSchema),
    defaultValues: createContentEditForm(content),
    mode: "onChange",
  });

  useEffect(() => {
    const animateCssLink = document.createElement("link");
    animateCssLink.rel = "stylesheet";
    animateCssLink.href =
      "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css";
    document.head.appendChild(animateCssLink);

    return () => {
      if (document.head.contains(animateCssLink)) {
        document.head.removeChild(animateCssLink);
      }
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setSelectedImage(fileUrl);
      setPreviewImage(fileUrl);
      setIsImageDeleted(false);
    }
  };

  const handleDeleteImage = () => {
    Swal.fire({
      title: "Hapus Foto?",
      text: "Anda yakin ingin menghapus foto ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedImage(null);
        setPreviewImage(null);
        setIsImageDeleted(true);

        Swal.fire({
          position: "center",
          icon: "success",
          title: "Foto berhasil dihapus",
          showConfirmButton: false,
          timer: 1500,
          showClass: {
            popup: "animate__animated animate__fadeInDown",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOutUp",
          },
        });
      }
    });
  };

  const showLoadingAlert = () => {
    Swal.fire({
      title: "Menyimpan...",
      html: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
    });
  };

  const showSuccessAlert = () => {
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Berhasil!",
      text: "Konten berhasil diperbarui",
      showConfirmButton: false,
      timer: 1500,
      showClass: {
        popup: "animate__animated animate__zoomIn",
      },
      hideClass: {
        popup: "animate__animated animate__zoomOut",
      },
      didClose: () => {
        onSuccess();
      },
    });
  };

  const showErrorAlert = (
    message: string = "Terjadi kesalahan saat menyimpan perubahan. Silakan coba lagi."
  ) => {
    Swal.fire({
      icon: "error",
      title: "Gagal Menyimpan",
      text: message,
      confirmButtonText: "Tutup",
      showClass: {
        popup: "animate__animated animate__shakeX",
      },
    });
  };

  const prepareFileForUpload = async (
    imageUrl: string
  ): Promise<File | undefined> => {
    if (!imageUrl.startsWith("blob:")) return undefined;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new File([blob], "foto.jpg", { type: blob.type });
    } catch (error) {
      console.error("Error saat memproses gambar:", error);
      throw new Error("Gagal memproses gambar");
    }
  };

  const onSubmit = async (values: ContentFormValues) => {
    try {
      setIsSubmitting(true);
      showLoadingAlert();

      // ✅ Persiapkan data untuk update - pastikan semua field sesuai tipe
      const updatedContent: Partial<ContentFormValues> = {
        judul: values.judul,
        deskripsi: values.deskripsi,
        kategoriId: values.kategoriId,
        penting: values.penting,
        tanggal: values.tanggal,
        waktu: values.waktu || null,
        lokasi: values.lokasi || null,
        penulis: values.penulis || null,
        tampilkanDiBeranda: values.tampilkanDiBeranda,
        status: values.status,
        donaturId: values.donaturId,
        kotakAmalId: values.kotakAmalId,
        tags: values.tags,
      };

      let fileForUpload: File | undefined;

      // Handle upload gambar baru
      if (selectedImage && selectedImage !== content.fotoUrl) {
        fileForUpload = await prepareFileForUpload(selectedImage);
      }

      // Jika gambar dihapus, set undefined
      if (isImageDeleted) {
        fileForUpload = undefined;
      }

      // Panggil server action untuk update
      await updateKontenWithOptionalFoto(
        content.id,
        updatedContent,
        fileForUpload
      );

      showSuccessAlert();
    } catch (error) {
      console.error("Error saat update konten:", error);

      if (
        error instanceof Error &&
        error.message === "Gagal memproses gambar"
      ) {
        showErrorAlert(
          "Terjadi kesalahan saat memproses gambar. Silakan coba lagi."
        );
      } else {
        showErrorAlert();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTags = content.tags || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden p-6 mb-4"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col gap-4">
          <Button variant="ghost" onClick={onCancel} className="w-fit">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Edit Konten</h1>
        </div>
      </div>

      <Separator className="mb-6" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormFields
            form={form}
            isSubmitting={isSubmitting}
            tags={availableTags}
            previewImage={previewImage}
            onImageChange={handleImageChange}
            onDeleteImage={handleDeleteImage}
          />

          <Separator />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}