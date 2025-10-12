// src/components/finance/pemasukan/table-donation/kotak-amal/edit-kotak-amal
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
import InputField from "@/components/form/input/InputField";
import { Label } from "@/components/ui/label";
import { KotakAmalData } from "../schema";
import Swal from "sweetalert2";
import { createClient } from "@/lib/supabase/client";
import { formatAngkaInput, parseFormattedNumber } from "@/lib/utils";

interface MonthName {
  field: string;
  label: string;
}

const monthNames: MonthName[] = [
  { field: "jan", label: "Januari" },
  { field: "feb", label: "Februari" },
  { field: "mar", label: "Maret" },
  { field: "apr", label: "April" },
  { field: "mei", label: "Mei" },
  { field: "jun", label: "Juni" },
  { field: "jul", label: "Juli" },
  { field: "aug", label: "Agustus" },
  { field: "sep", label: "September" },
  { field: "okt", label: "Oktober" },
  { field: "nov", label: "November" },
  { field: "des", label: "Desember" },
];

interface EditKotakAmalProps {
  isOpen: boolean;
  onClose: () => void;
  kotakAmal: KotakAmalData | null;
  onSave: (updatedKotakAmal: KotakAmalData) => void;
  onDelete: (id: number) => void;
}

export function EditKotakAmal({
  isOpen,
  onClose,
  kotakAmal,
  onSave,
}: EditKotakAmalProps) {
  const [formData, setFormData] = React.useState<KotakAmalData | null>(null);
  const [displayValues, setDisplayValues] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (kotakAmal) {
      setFormData({ ...kotakAmal });
      // Initialize display values for all numeric fields
      const initialDisplayValues: Record<string, string> = {};
      monthNames.forEach(({ field }) => {
        const value = kotakAmal[field as keyof KotakAmalData] as number;
        initialDisplayValues[field] = value > 0 ? formatAngkaInput(value.toString()) : "";
      });
      setDisplayValues(initialDisplayValues);
    }
  }, [kotakAmal]);

  if (!formData) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      if (!prev) return null;

      if (field === "nama" || field === "lokasi") {
        return { ...prev, [field]: value };
      } else {
        // Handle numeric fields
        const formatted = formatAngkaInput(value);
        setDisplayValues(prevDisplay => ({ ...prevDisplay, [field]: formatted }));
        const numValue = Number(parseFormattedNumber(formatted));
        return { ...prev, [field]: numValue };
      }
    });
  };

  const handleSave = async () => {
    if (formData) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("KotakAmal")
          .update({
            nama: formData.nama,
            lokasi: formData.lokasi,
            jan: formData.jan,
            feb: formData.feb,
            mar: formData.mar,
            apr: formData.apr,
            mei: formData.mei,
            jun: formData.jun,
            jul: formData.jul,
            aug: formData.aug,
            sep: formData.sep,
            okt: formData.okt,
            nov: formData.nov,
            des: formData.des,
          })
          .eq("id", formData.id);

        if (error) {
          console.error("Error updating kotak amal:", error);
          Swal.fire({
            title: "Error!",
            text: "Gagal memperbarui data kotak amal",
            icon: "error",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }
        onSave(formData);
        Swal.fire({
          title: "Berhasil!",
          text: "Data kotak amal berhasil diperbarui",
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
          text: "Terjadi kesalahan saat memperbarui data",
          icon: "error",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Edit Data Kotak Amal
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama</Label>
            <InputField
              id="nama"
              value={formData.nama}
              onChange={(e) => handleInputChange("nama", e.target.value)}
              placeholder="Masukkan nama kotak amal"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lokasi">Lokasi</Label>
            <InputField
              id="lokasi"
              value={formData.lokasi}
              onChange={(e) => handleInputChange("lokasi", e.target.value)}
              placeholder="Masukkan lokasi"
            />
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Donasi Bulanan</h3>
            <div className="grid grid-cols-2 gap-4">
              {monthNames.map(({ field, label }) => (
                <div
                  key={field}
                  className="grid grid-cols-3 items-center gap-2"
                >
                  <Label htmlFor={field} className="col-span-1">
                    {label}
                  </Label>
                  <Input
                    id={field}
                    type="text"
                    value={displayValues[field] || ""}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="col-span-2"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave}>
              Simpan Perubahan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
