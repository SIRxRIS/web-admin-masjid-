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
import Swal from "sweetalert2";
import { type IntegratedData } from "@/lib/services/supabase/data-integration";
import { formatAngkaInput, parseFormattedNumber } from "@/lib/utils";
import { updateDonatur } from "@/actions/donatur";
import { updateKotakAmalAction } from "@/actions/kotak-amal";
import { updateDonasiKhususAction } from "@/actions/donasi-khusus";

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

interface EditDonaturProps {
  isOpen: boolean;
  onClose: () => void;
  data: IntegratedData | null;
  onSave: (updatedData: IntegratedData) => void;
  onDelete: (id: number) => void;
  year: string;
}

export function EditDonatur({
  isOpen,
  onClose,
  data,
  onSave,
  onDelete,
  year,
}: EditDonaturProps) {
  const [formData, setFormData] = React.useState<IntegratedData | null>(null);
  const [displayValues, setDisplayValues] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (data) {
      setFormData({ ...data });
      // Initialize display values for all numeric fields
      const initialDisplayValues: Record<string, string> = {};
      monthNames.forEach(({ field }) => {
        const value = data[field as keyof IntegratedData] as number;
        initialDisplayValues[field] = value > 0 ? formatAngkaInput(value.toString()) : "";
      });
      initialDisplayValues.infaq = data.infaq > 0 ? formatAngkaInput(data.infaq.toString()) : "";
      setDisplayValues(initialDisplayValues);
    }
  }, [data]);

  const handleInputChange = (field: string, value: string) => {
    if (!formData) return;

    if (field === "nama" || field === "alamat") {
      setFormData({
        ...formData,
        [field]: value,
        total: calculateTotal({
          ...formData,
          [field]: value,
        }),
      });
    } else {
      // Handle numeric fields
      const formatted = formatAngkaInput(value);
      setDisplayValues(prev => ({ ...prev, [field]: formatted }));
      
      const numericValue = Number(parseFormattedNumber(formatted));
      const updatedData = {
        ...formData,
        [field]: numericValue,
      };
      
      setFormData({
        ...updatedData,
        total: calculateTotal(updatedData),
      });
    }
  };

  const calculateTotal = (data: IntegratedData) => {
    return (
      data.jan +
      data.feb +
      data.mar +
      data.apr +
      data.mei +
      data.jun +
      data.jul +
      data.aug +
      data.sep +
      data.okt +
      data.nov +
      data.des +
      data.infaq
    );
  };

  const handleSave = async () => {
    if (formData) {
      try {
        let result;
        
        // Panggil server action sesuai sumber
        if (formData.sourceType === "donatur") {
          // Buat FormData untuk updateDonatur
          const updateFormData = new FormData();
          updateFormData.append("nama", formData.nama);
          updateFormData.append("alamat", formData.alamat);
          updateFormData.append("jan", formData.jan.toString());
          updateFormData.append("feb", formData.feb.toString());
          updateFormData.append("mar", formData.mar.toString());
          updateFormData.append("apr", formData.apr.toString());
          updateFormData.append("mei", formData.mei.toString());
          updateFormData.append("jun", formData.jun.toString());
          updateFormData.append("jul", formData.jul.toString());
          updateFormData.append("aug", formData.aug.toString());
          updateFormData.append("sep", formData.sep.toString());
          updateFormData.append("okt", formData.okt.toString());
          updateFormData.append("nov", formData.nov.toString());
          updateFormData.append("des", formData.des.toString());
          updateFormData.append("infaq", formData.infaq.toString());
          
          result = await updateDonatur(formData.sourceId, updateFormData);
        } else if (formData.sourceType === "kotakAmal") {
          // Nama kotak amal di IntegratedData berformat "Kotak Amal: <nama>", bersihkan prefix
          const cleanedName = formData.nama.replace(/^Kotak Amal:\s*/, "");
          result = await updateKotakAmalAction(formData.sourceId, {
            nama: cleanedName,
            lokasi: formData.alamat,
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
          });
        } else if (formData.sourceType === "donasiKhusus") {
          // Donasi khusus terintegrasi per-donatur (aggregasi). Update yang relevan: nama dan keterangan pada item asal.
          result = await updateDonasiKhususAction(formData.sourceId, {
            nama: formData.nama.replace(/^Donasi Khusus:\s*/, ""),
            keterangan: formData.alamat,
          });
        }

        // Periksa hasil dari server action
        if (result && !result.success) {
          throw new Error(result.error || "Gagal memperbarui data");
        }

        onSave(formData);
        Swal.fire({
          title: "Berhasil!",
          text: "Data donatur berhasil diperbarui",
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
            Edit{" "}
            {formData?.sourceType === "donatur"
              ? "Data Donatur"
              : formData?.sourceType === "kotakAmal"
              ? "Kotak Amal"
              : "Donasi Khusus"}{" "}
            {year}
          </DialogTitle>
        </DialogHeader>

        {formData && (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama</Label>
              <InputField
                id="nama"
                value={formData.nama}
                onChange={(e) => handleInputChange("nama", e.target.value)}
                placeholder="Masukkan nama"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <InputField
                id="alamat"
                value={formData.alamat}
                onChange={(e) => handleInputChange("alamat", e.target.value)}
                placeholder="Masukkan alamat"
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

            <div className="space-y-2 mt-2">
              <Label htmlFor="infaq" className="font-semibold">Infaq</Label>
              <Input
                id="infaq"
                type="text"
                value={displayValues.infaq || ""}
                onChange={(e) => handleInputChange("infaq", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={async () => {
              if (!formData) return;
              try {
                if (formData.sourceType === "donatur") {
                  const res = await fetch(`/api/donatur?id=${formData.sourceId}`, { method: "DELETE" });
                  if (!res.ok) throw new Error("Gagal hapus donatur");
                } else if (formData.sourceType === "kotakAmal") {
                  const res = await fetch(`/api/kotak-amal?id=${formData.sourceId}`, { method: "DELETE" });
                  if (!res.ok) throw new Error("Gagal hapus kotak amal");
                } else if (formData.sourceType === "donasiKhusus") {
                  const res = await fetch(`/api/donasi-khusus?id=${formData.sourceId}`, { method: "DELETE" });
                  if (!res.ok) throw new Error("Gagal hapus donasi khusus");
                }
                onDelete(formData.sourceId);
                Swal.fire({
                  title: "Berhasil!",
                  text: "Data berhasil dihapus",
                  icon: "success",
                  timer: 2000,
                  timerProgressBar: true,
                  showConfirmButton: false,
                });
                onClose();
              } catch (err) {
                console.error("Error delete:", err);
                Swal.fire({
                  title: "Error!",
                  text: "Gagal menghapus data",
                  icon: "error",
                  timer: 2000,
                  timerProgressBar: true,
                  showConfirmButton: false,
                });
              }
            }}
          >
            Hapus
          </Button>
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
