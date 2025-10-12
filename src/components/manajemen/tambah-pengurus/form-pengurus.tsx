// src/components/manajemen/tambah-pengurus/form-pengurus.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { Save, Loader2 } from "lucide-react";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormPengurusSchema, type FormPengurusType } from "./pengurus-schema";
import { createPengurusAction } from "@/actions/pengurus";
import { FormDataTab, FormFotoTab } from "./form-tabs";

interface FormPengurusProps {
  onSuccess?: () => void;
}

export function FormPengurus({ onSuccess }: FormPengurusProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("form");

  const form = useForm<FormPengurusType>({
    resolver: zodResolver(FormPengurusSchema),
    defaultValues: { nama: "", no: 0, jabatan: "", periode: "", kategori: "MASJID" },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar", {
        description: "Maksimal 5MB.",
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
    toast.success("Foto berhasil diunggah", { description: `${file.name}` });
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

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    } else {
      toast.error("Format file tidak valid", {
        description: "Hanya file gambar yang diperbolehkan.",
      });
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    toast.info("Foto telah dihapus");
  };

  const onSubmit = async (data: FormPengurusType) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("nama", data.nama);
      formData.append("no", data.no.toString());
      formData.append("jabatan", data.jabatan);
      formData.append("periode", data.periode);
      formData.append("kategori", data.kategori);

      if (selectedFile) {
        formData.append("foto", selectedFile);
      }

      const result = await createPengurusAction(formData);

      if (!result.success) {
        throw new Error(result.error || "Gagal menyimpan data");
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data pengurus berhasil disimpan.",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        customClass: {
          popup: "animate__animated animate__fadeInUp",
          title: "text-primary text-xl",
          htmlContainer: "text-base",
        },
      });

      form.reset();
      setPreviewImage(null);
      setSelectedFile(null);
      
      onSuccess?.();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan!",
        text:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan. Silakan coba lagi.",
        confirmButtonText: "Tutup",
        customClass: {
          confirmButton: "bg-primary text-white rounded-md px-4 py-2",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Tabs
          defaultValue="form"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-full sm:hidden">
              <Select defaultValue="form" onValueChange={setActiveTab}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="form">Formulir Data</SelectItem>
                  <SelectItem value="foto">Upload Foto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TabsList className="hidden sm:flex w-full sm:w-auto">
              <TabsTrigger
                value="form"
                title="Form data lengkap pengurus masjid"
                className="text-sm sm:text-base px-4 py-2"
              >
                Formulir Data
              </TabsTrigger>
              <TabsTrigger
                value="foto"
                title="Upload foto pengurus"
                className="text-sm sm:text-base px-4 py-2"
              >
                Upload Foto
              </TabsTrigger>
            </TabsList>
          </div>

          <FormDataTab form={form} isSubmitting={isSubmitting} />

          <FormFotoTab
            selectedFile={selectedFile}
            previewImage={previewImage}
            isSubmitting={isSubmitting}
            isDragging={isDragging}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleFileChange={handleFileChange}
            removeImage={removeImage}
          />
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white" size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Simpan Data
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}