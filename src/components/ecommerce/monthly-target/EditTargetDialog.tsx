// src/components/ecommerce/monthly-target/EditTargetDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { formatRupiah } from "@/lib/utils";
import InputField from "@/components/form/input/InputField";
import Swal from "sweetalert2";

interface EditTargetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentTarget: number;
  selectedMonth: number;
  selectedYear: number;
  onSaveTarget: (newTarget: number) => Promise<void>;
  getMonthName: (month: number) => string;
}

export default function EditTargetDialog({
  isOpen,
  onOpenChange,
  currentTarget,
  selectedMonth,
  selectedYear,
  onSaveTarget,
  getMonthName,
}: EditTargetDialogProps) {
  const [editTarget, setEditTarget] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Function untuk format input angka dengan separator ribuan
  const formatInputNumber = (value: string) => {
    // Hapus semua karakter non-digit
    const numericValue = value.replace(/\D/g, '');
    
    // Format dengan separator ribuan
    if (numericValue) {
      return parseInt(numericValue).toLocaleString('id-ID');
    }
    return '';
  };

  // Function untuk parse input yang sudah diformat kembali ke angka
  const parseFormattedNumber = (value: string) => {
    return value.replace(/\./g, '');
  };

  // Handle dialog open/close
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setEditTarget(currentTarget.toString());
    } else {
      setEditTarget('');
    }
    onOpenChange(open);
  };

  // Handle input change dengan format angka yang lebih user-friendly
  const handleTargetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseFormattedNumber(rawValue);
    const formattedValue = formatInputNumber(numericValue);
    
    // Update input dengan format yang benar
    e.target.value = formattedValue;
    setEditTarget(numericValue);
  };

  // Handle save target dengan SweetAlert2
  const handleSaveTarget = async () => {
    try {
      const newTarget = parseInt(editTarget);

      if (isNaN(newTarget) || newTarget <= 0) {
        await Swal.fire({
          icon: 'error',
          title: 'Input Tidak Valid',
          text: 'Target harus berupa angka yang valid dan lebih besar dari 0',
          confirmButtonColor: '#3B82F6',
        });
        return;
      }

      setIsSaving(true);

      // Tampilkan loading dengan SweetAlert2
      Swal.fire({
        title: 'Menyimpan Target...',
        text: 'Mohon tunggu sebentar',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await onSaveTarget(newTarget);

      // Tutup loading dan tampilkan sukses
      await Swal.fire({
        icon: 'success',
        title: 'Target Berhasil Disimpan!',
        text: `Target untuk ${getMonthName(selectedMonth)} ${selectedYear} telah diperbarui menjadi ${formatRupiah(newTarget)}`,
        confirmButtonColor: '#10B981',
        timer: 3000,
        timerProgressBar: true,
      });

      onOpenChange(false);
      setEditTarget('');
    } catch (error) {
      console.error('Error menyimpan target:', error);
      
      // Tampilkan error dengan SweetAlert2
      await Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Target',
        text: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan target',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Target Pemasukan</DialogTitle>
          <DialogDescription>
            Atur target pemasukan untuk {getMonthName(selectedMonth)} {selectedYear}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-start gap-4">
            <Label htmlFor="target" className="w-24 text-right shrink-0 pt-2">
              Target (Rp)
            </Label>
            <div className="flex-1">
              <InputField
                id="target"
                type="text"
                defaultValue={formatInputNumber(editTarget)}
                onChange={handleTargetInputChange}
                placeholder="Contoh: 10.000.000"
                hint="Masukkan target dalam Rupiah"
              />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Target saat ini: {formatRupiah(currentTarget)}
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Batal
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            type="button" 
            onClick={handleSaveTarget}
            disabled={isSaving}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Target'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}