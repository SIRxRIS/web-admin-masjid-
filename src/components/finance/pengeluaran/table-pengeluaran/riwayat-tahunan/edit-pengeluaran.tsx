// src/components/finance/pengeluaran/table-pengeluaran-bulanan/edit-pengeluaran.tsx
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
import InputField from "@/components/form/input/InputField";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";
import { createClient } from "@/lib/supabase/client";
import { PengeluaranTahunanData } from "@/lib/schema/pengeluaran/schema";
import { formatAngkaInput, parseFormattedNumber } from "@/lib/utils";

interface EditPengeluaranProps {
  isOpen: boolean;
  onClose: () => void;
  data: PengeluaranTahunanData | null;
  onSave: (updatedData: PengeluaranTahunanData) => void;
  onDelete: (id: number) => void;
  year: string;
}

export function EditPengeluaran({
  isOpen,
  onClose,
  data,
  onSave,
  onDelete,
  year,
}: EditPengeluaranProps) {
  const [formData, setFormData] = React.useState<PengeluaranTahunanData | null>(null);

  React.useEffect(() => {
    if (data) {
      setFormData({ ...data });
    }
  }, [data]);

  if (!formData) return null;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => {
      if (!prev) return null;

      if (field === "pengeluaran") {
        return { ...prev, [field]: value as string };
      } else if (["jan", "feb", "mar", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "des"].includes(field)) {
        const numValue = typeof value === "string" ? Number(parseFormattedNumber(value)) : value as number;
        return { ...prev, [field]: numValue };
      }
      return prev;
    });
  };

  const handleMonthlyChange = (month: string, value: string) => {
    handleInputChange(month, value);
  };

  const handleSave = async () => {
    if (formData) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("PengeluaranTahunan")
          .update({
            pengeluaran: formData.pengeluaran,
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
          console.error("Error updating pengeluaran:", error);
          Swal.fire({
            title: "Error!",
            text: "Gagal memperbarui data pengeluaran",
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
          text: "Data pengeluaran berhasil diperbarui",
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Data Pengeluaran</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pengeluaran">Nama Pengeluaran</Label>
            <InputField
              id="pengeluaran"
              value={formData.pengeluaran}
              onChange={(e) => handleInputChange("pengeluaran", e.target.value)}
              placeholder="Masukkan nama pengeluaran"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "jan", label: "Januari" },
              { key: "feb", label: "Februari" },
              { key: "mar", label: "Maret" },
              { key: "apr", label: "April" },
              { key: "mei", label: "Mei" },
              { key: "jun", label: "Juni" },
              { key: "jul", label: "Juli" },
              { key: "aug", label: "Agustus" },
              { key: "sep", label: "September" },
              { key: "okt", label: "Oktober" },
              { key: "nov", label: "November" },
              { key: "des", label: "Desember" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <InputField
                  id={key}
                  type="text"
                  value={formatAngkaInput(formData[key as keyof PengeluaranTahunanData]?.toString() || "0")}
                  onChange={(e) => handleMonthlyChange(key, e.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}