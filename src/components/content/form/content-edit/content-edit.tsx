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
import { toast } from "sonner";

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
  // New state for additional images
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);

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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Handle the first file as the main image
    const mainFile = files[0];
    const fileUrl = URL.createObjectURL(mainFile);
    setSelectedImage(fileUrl);
    setPreviewImage(fileUrl);
    setIsImageDeleted(false);

    // If there are multiple files, store the additional ones
    if (files.length > 1) {
      const newAdditionalImages: File[] = [];
      for (let i = 1; i < files.length; i++) {
        newAdditionalImages.push(files[i]);
      }

      // Add to existing additional images
      setAdditionalImages(prev => [...prev, ...newAdditionalImages]);

      // Show notification about additional images
      if (newAdditionalImages.length > 0) {
        toast.success(`${newAdditionalImages.length} gambar tambahan berhasil dipilih`, {
          description: "Gambar tambahan akan diunggah saat Anda menyimpan perubahan.",
          duration: 4000,
        });
      }
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

  const showSuccessAlert = (message: string = "Konten berhasil diperbarui") => {
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Berhasil!",
      text: message,
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
    // If it's not a blob URL (e.g., it's a remote URL or data URL), return undefined
    if (!imageUrl.startsWith("blob:")) return undefined;

    try {
      // Fetch the blob from the URL
      const response = await fetch(imageUrl);

      // Check if the fetch was successful
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Validate the blob type
      if (!blob.type.startsWith('image/')) {
        throw new Error(`Invalid image type: ${blob.type}`);
      }

      // Check file size (max 2MB)
      const fileSizeInMB = blob.size / (1024 * 1024);
      if (fileSizeInMB > 2) {
        throw new Error("Ukuran file terlalu besar (maksimal 2MB)");
      }

      // Create a file from the blob
      const fileName = `foto_${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`;
      return new File([blob], fileName, { type: blob.type });
    } catch (error) {
      console.error("Error saat memproses gambar:", error);
      throw new Error(error instanceof Error ?
        `Gagal memproses gambar: ${error.message}` :
        "Gagal memproses gambar");
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
        kategori: values.kategori,
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

      try {
        // Handle upload gambar baru
        if (selectedImage && selectedImage !== content.fotoUrl) {
          fileForUpload = await prepareFileForUpload(selectedImage);
        }
      } catch (imageError) {
        console.error("Error saat memproses gambar:", imageError);
        showErrorAlert(
          imageError instanceof Error
            ? imageError.message
            : "Terjadi kesalahan saat memproses gambar. Silakan coba lagi."
        );
        setIsSubmitting(false);
        return; // Stop execution if image processing fails
      }

      // Jika gambar dihapus, set undefined
      if (isImageDeleted) {
        fileForUpload = undefined;
      }

      try {
        // Panggil server action untuk update
        const updateResult = await updateKontenWithOptionalFoto(
          content.id,
          updatedContent,
          fileForUpload
        );

        // If there are additional images, upload them after the main content is updated
        if (additionalImages.length > 0) {
          try {
            // Import the uploadMultipleFotosKonten function
            const { uploadMultipleFotosKonten } = await import("@/actions/content");

            // Upload additional images
            await uploadMultipleFotosKonten(content.id, additionalImages);

            // Add a note about additional images in the success message
            showSuccessAlert("Konten dan semua gambar berhasil diperbarui");
          } catch (additionalImagesError) {
            console.error("Error saat upload gambar tambahan:", additionalImagesError);

            // Show success for the main content but warn about additional images
            Swal.fire({
              position: "center",
              icon: "warning",
              title: "Konten Berhasil Diperbarui",
              text: "Konten berhasil disimpan, tetapi beberapa gambar tambahan gagal diunggah.",
              showConfirmButton: true,
              confirmButtonText: "OK",
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
            return;
          }
        } else {
          // No additional images, just show regular success
          showSuccessAlert();
        }
      } catch (updateError) {
        console.error("Error saat update konten:", updateError);

        // Extract error message
        let errorMessage = "Terjadi kesalahan saat menyimpan perubahan. Silakan coba lagi.";

        if (updateError instanceof Error) {
          // Check for specific error types
          if (updateError.message.includes("Gagal memproses gambar")) {
            errorMessage = "Terjadi kesalahan saat memproses gambar. Silakan coba lagi dengan gambar yang berbeda.";
          } else if (updateError.message.includes("Ukuran file terlalu besar")) {
            errorMessage = "Ukuran file gambar terlalu besar. Maksimal 2MB.";
          } else if (updateError.message.includes("Format file tidak didukung")) {
            errorMessage = "Format file tidak didukung. Hanya JPG, JPEG, dan PNG yang diperbolehkan.";
          } else if (updateError.message.includes("<!DOCTYPE")) {
            errorMessage = "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
          } else {
            // Use the actual error message if available
            errorMessage = updateError.message;
          }
        }

        showErrorAlert(errorMessage);
      }
    } catch (error) {
      console.error("Error tidak terduga saat update konten:", error);
      showErrorAlert(
        "Terjadi kesalahan tidak terduga. Silakan coba lagi nanti."
      );
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