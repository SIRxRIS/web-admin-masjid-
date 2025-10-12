// src/components/admin/layout/inventaris/form/edit-inventaris.tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Swal from "sweetalert2";
import {
  InventarisData,
  KategoriInventaris,
  KondisiInventaris,
  SatuanInventaris,
} from "@/lib/schema/inventaris/schema";
import Image from "next/image";

interface EditInventarisProps {
  isOpen: boolean;
  onClose: () => void;
  data: InventarisData | null;
  onSave: (id: number, data: any, file?: File) => Promise<InventarisData>;
}

export function EditInventaris({
  isOpen,
  onClose,
  data,
  onSave,
}: EditInventarisProps) {
  const [formData, setFormData] = React.useState<InventarisData | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (data) {
      setFormData({ ...data });
      setImagePreview(data.fotoUrl || null);
    }
  }, [data]);

  const handleInputChange = (field: string, value: any) => {
    if (!formData) return;

    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (formData) {
      try {
        const idAsNumber =
          typeof formData.id === "string" ? parseInt(formData.id) : formData.id;

        const updateData = {
          namaBarang: formData.namaBarang,
          fotoUrl: formData.fotoUrl,
          kategori: formData.kategori,
          jumlah: formData.jumlah,
          satuan: formData.satuan,
          lokasi: formData.lokasi,
          kondisi: formData.kondisi,
          tanggalMasuk: new Date(formData.tanggalMasuk),
          keterangan: formData.keterangan,
        };

        // Menggunakan callback onSave yang diterima dari parent
        await onSave(idAsNumber, updateData, selectedFile || undefined);

        Swal.fire({
          title: "Berhasil!",
          text: "Data inventaris berhasil diperbarui",
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        onClose();
      } catch (err) {
        console.error("Error in handleSave:", err);
        Swal.fire({
          title: "Error!",
          text:
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan saat memperbarui data",
          icon: "error",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Edit Data Inventaris
          </DialogTitle>
        </DialogHeader>

        {formData && (
          <div className="grid gap-4 py-4">
            {/* Foto Preview */}
            <div className="flex flex-col items-center">
              {imagePreview && (
                <div className="mb-3 w-40 h-40 relative rounded-md overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileInput}
              >
                {imagePreview ? "Ganti Foto" : "Upload Foto"}
              </Button>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="namaBarang" className="text-right">
                Nama Barang
              </Label>
              <Input
                id="namaBarang"
                value={formData.namaBarang}
                onChange={(e) =>
                  handleInputChange("namaBarang", e.target.value)
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="kategori" className="text-right">
                Kategori
              </Label>
              <Select
                value={formData.kategori}
                onValueChange={(value) => handleInputChange("kategori", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(KategoriInventaris.Values).map((kategori) => (
                    <SelectItem key={kategori} value={kategori}>
                      {kategori}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jumlah" className="text-right">
                Jumlah
              </Label>
              <Input
                id="jumlah"
                type="number"
                value={formData.jumlah}
                onChange={(e) =>
                  handleInputChange("jumlah", Number(e.target.value))
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="satuan" className="text-right">
                Satuan
              </Label>
              <Select
                value={formData.satuan}
                onValueChange={(value) => handleInputChange("satuan", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih satuan" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SatuanInventaris.Values).map((satuan) => (
                    <SelectItem key={satuan} value={satuan}>
                      {satuan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lokasi" className="text-right">
                Lokasi
              </Label>
              <Input
                id="lokasi"
                value={formData.lokasi}
                onChange={(e) => handleInputChange("lokasi", e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="kondisi" className="text-right">
                Kondisi
              </Label>
              <Select
                value={formData.kondisi}
                onValueChange={(value) => handleInputChange("kondisi", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih kondisi" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(KondisiInventaris.Values).map((kondisi) => (
                    <SelectItem key={kondisi} value={kondisi}>
                      {kondisi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tanggalMasuk" className="text-right">
                Tanggal Masuk
              </Label>
              <Input
                id="tanggalMasuk"
                type="date"
                value={
                  formData.tanggalMasuk instanceof Date
                    ? formData.tanggalMasuk.toISOString().substring(0, 10)
                    : new Date(formData.tanggalMasuk)
                        .toISOString()
                        .substring(0, 10)
                }
                onChange={(e) =>
                  handleInputChange("tanggalMasuk", new Date(e.target.value))
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="keterangan" className="text-right">
                Keterangan
              </Label>
              <Textarea
                id="keterangan"
                value={formData.keterangan || ""}
                onChange={(e) =>
                  handleInputChange("keterangan", e.target.value)
                }
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-end">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button className="text-white" onClick={handleSave}>
              Simpan Perubahan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
