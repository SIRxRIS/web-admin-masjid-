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
import { Input } from "@/components/ui/input";
import InputField from "@/components/form/input/InputField";
import { Label } from "@/components/ui/label";
import TextArea from "@/components/form/input/TextArea";
import Swal from "sweetalert2";
import { createClient } from "@/lib/supabase/client";
import { PengeluaranData } from "@/lib/schema/pengeluaran/schema";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn, formatAngkaInput, parseFormattedNumber } from "@/lib/utils";
import { safeFormatDate } from "@/lib/date-helper";
import { id } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EditPengeluaranProps {
  isOpen: boolean;
  onClose: () => void;
  data: PengeluaranData | null;
  onSave: (updatedData: PengeluaranData) => void;
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
  const [formData, setFormData] = React.useState<PengeluaranData | null>(null);
  const [jumlahDisplay, setJumlahDisplay] = React.useState("");

  React.useEffect(() => {
    if (data) {
      setFormData({
        ...data,
        tanggal:
          data.tanggal instanceof Date ? data.tanggal : new Date(data.tanggal),
        // Pastikan keterangan selalu string, bukan null
        keterangan: data.keterangan || ""
      });
      // Set display value untuk jumlah
      setJumlahDisplay(formatAngkaInput(data.jumlah.toString()));
    }
  }, [data]);

  if (!formData) return null;

  const handleInputChange = (field: string, value: string | number | Date) => {
    setFormData((prev) => {
      if (!prev) return null;

      if (field === "nama" || field === "keterangan") {
        return { ...prev, [field]: value as string };
      } else if (field === "tanggal") {
        return { ...prev, [field]: value as Date };
      } else if (field === "jumlah") {
        const numValue = Number(parseFormattedNumber(value as string));
        return { ...prev, [field]: numValue };
      }
      return prev;
    });
  };

  const handleJumlahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAngkaInput(e.target.value);
    setJumlahDisplay(formatted);
    handleInputChange("jumlah", formatted);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      handleInputChange("tanggal", date);
    }
  };

  const handleSave = async () => {
    if (formData) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("Pengeluaran")
          .update({
            nama: formData.nama,
            tanggal:
              formData.tanggal instanceof Date
                ? format(formData.tanggal, "yyyy-MM-dd")
                : formData.tanggal,
            jumlah: formData.jumlah,
            keterangan: formData.keterangan || "", // Pastikan tidak null
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
            <Label htmlFor="nama">Nama</Label>
            <InputField
              id="nama"
              value={formData.nama}
              onChange={(e) => handleInputChange("nama", e.target.value)}
              placeholder="Masukkan nama pengeluaran"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tanggal">Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="tanggal"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.tanggal && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.tanggal ? (
                    safeFormatDate(formData.tanggal, "dd MMMM yyyy")
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
          
          <div className="space-y-2">
            <Label htmlFor="jumlah">Jumlah</Label>
            <Input
              id="jumlah"
              type="text"
              value={jumlahDisplay}
              onChange={handleJumlahChange}
              placeholder="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <TextArea
              placeholder="Masukkan keterangan"
              value={formData.keterangan || ""}
              onChange={(value) => handleInputChange("keterangan", value)}
            />
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