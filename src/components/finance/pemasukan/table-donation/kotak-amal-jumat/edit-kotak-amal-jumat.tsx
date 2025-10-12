// src/components/admin/layout/finance/pemasukan/table-donation/kotak-amal-jumat/edit-kotak-amal-jumat.tsx
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
import { KotakAmalJumatData } from "../schema";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { id } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatAngkaInput, parseFormattedNumber } from "@/lib/utils";
import { unformatNumber, formatNumber } from "../utils";

interface EditKotakAmalJumatProps {
  isOpen: boolean;
  onClose: () => void;
  kotakAmal: KotakAmalJumatData | null;
  onSave: (updatedKotakAmal: KotakAmalJumatData) => Promise<void>;
  onDelete: (id: number) => void;
  year: string;
}

export function EditKotakAmalJumat({
  isOpen,
  onClose,
  kotakAmal,
  onSave,
  onDelete,
  year,
}: EditKotakAmalJumatProps) {
  const [formData, setFormData] = React.useState<KotakAmalJumatData | null>(
    null
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [jumlahDisplay, setJumlahDisplay] = React.useState("");

  React.useEffect(() => {
    if (kotakAmal) {
      setFormData({
        ...kotakAmal,
        tanggal:
          kotakAmal.tanggal instanceof Date
            ? kotakAmal.tanggal
            : new Date(kotakAmal.tanggal),
      });
      setJumlahDisplay(formatAngkaInput(kotakAmal.jumlah.toString()));
    }
  }, [kotakAmal]);

  if (!formData) return null;

  const handleInputChange = (field: string, value: string | number | Date) => {
    setFormData((prev) => {
      if (!prev) return null;

      if (field === "tanggal") {
        return { ...prev, tanggal: value as Date };
      } else if (field === "jumlah") {
        const numValue =
          typeof value === "string" ? unformatNumber(value) : Number(value);
        return { ...prev, jumlah: numValue };
      }
      return prev;
    });
  };

  const handleJumlahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAngkaInput(e.target.value);
    setJumlahDisplay(formatted);
    const numericValue = Number(parseFormattedNumber(formatted));
    handleInputChange("jumlah", numericValue);
  };

  const handleSave = async () => {
    if (!formData || isSaving) return;

    setIsSaving(true);
    try {
      // Validasi input
      if (!formData.tanggal || formData.jumlah <= 0) {
        throw new Error("Tanggal dan jumlah harus diisi dengan benar");
      }

      const updateData = {
        ...formData,
        tanggal:
          formData.tanggal instanceof Date
            ? format(formData.tanggal, "yyyy-MM-dd")
            : formData.tanggal,
        tahun: parseInt(year),
      };

      // Parent component akan handle update ke database
      await onSave(updateData);

      await Swal.fire({
        title: "Berhasil!",
        text: "Data kotak amal jumat berhasil diperbarui",
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      onClose();
    } catch (err) {
      console.error("Error in handleSave:", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memperbarui data";

      await Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      handleInputChange("tanggal", date);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Data Kotak Amal Jumat</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tanggal" className="text-right">
              Tanggal
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="tanggal"
                    variant={"outline"}
                    disabled={isSaving}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.tanggal && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.tanggal ? (
                      format(new Date(formData.tanggal), "dd MMMM yyyy", {
                        locale: id,
                      })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(formData.tanggal)}
                    onSelect={handleDateSelect}
                    initialFocus
                    locale={id}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jumlah" className="text-right">
              Jumlah
            </Label>
            <Input
              id="jumlah"
              type="text"
              disabled={isSaving}
              value={jumlahDisplay}
              onChange={handleJumlahChange}
              className="col-span-3"
              placeholder="Masukkan jumlah"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}