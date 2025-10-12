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
import { RekapPemasukan, RekapPengeluaran } from "@/lib/schema/laporan/schema";
import Swal from "sweetalert2";
import { formatNumber, unformatNumber } from "../../utils";

interface EditRekapProps {
  isOpen: boolean;
  onClose: () => void;
  rekap: RekapPemasukan | RekapPengeluaran | null;
  onSave: (updatedRekap: RekapPemasukan | RekapPengeluaran) => void;
  onDelete: (id: number) => void;
  year: string;
  type: 'pemasukan' | 'pengeluaran';
}

export function EditRekap({
  isOpen,
  onClose,
  rekap,
  onSave,
  onDelete,
  year,
  type,
}: EditRekapProps) {
  const [formData, setFormData] = React.useState<RekapPemasukan | RekapPengeluaran | null>(null);

  React.useEffect(() => {
    if (rekap) {
      setFormData(rekap);
    }
  }, [rekap]);

  if (!formData) return null;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const handleSave = async () => {
    if (formData) {
      try {
        // Format number fields before saving
        const formattedData = {
          ...formData,
          jan: unformatNumber(formData.jan.toString()),
          feb: unformatNumber(formData.feb.toString()),
          mar: unformatNumber(formData.mar.toString()),
          apr: unformatNumber(formData.apr.toString()),
          mei: unformatNumber(formData.mei.toString()),
          jun: unformatNumber(formData.jun.toString()),
          jul: unformatNumber(formData.jul.toString()),
          aug: unformatNumber(formData.aug.toString()),
          sep: unformatNumber(formData.sep.toString()),
          okt: unformatNumber(formData.okt.toString()),
          nov: unformatNumber(formData.nov.toString()),
          des: unformatNumber(formData.des.toString()),
          total: unformatNumber(formData.total.toString()),
        };

        onSave(formattedData);
        Swal.fire({
          title: "Berhasil!",
          text: `Data ${type === 'pemasukan' ? 'pemasukan' : 'pengeluaran'} berhasil diperbarui`,
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
          text: `Terjadi kesalahan saat memperbarui data ${type === 'pemasukan' ? 'pemasukan' : 'pengeluaran'}`,
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
          <DialogTitle>Edit Data {type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {type === 'pemasukan' ? (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sumber" className="text-right">
                Sumber
              </Label>
              <Input
                id="sumber"
                value={(formData as RekapPemasukan).sumber}
                onChange={(e) => handleInputChange("sumber", e.target.value)}
                className="col-span-3"
              />
            </div>
          ) : (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nama" className="text-right">
                Nama
              </Label>
              <Input
                id="nama"
                value={(formData as RekapPengeluaran).nama}
                onChange={(e) => handleInputChange("nama", e.target.value)}
                className="col-span-3"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}