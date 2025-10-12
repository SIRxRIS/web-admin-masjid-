// src/component/finance/pemasukan/table-donation/donasi-khusus/edit-donasi-khusus
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
import TextArea from "@/components/form/input/TextArea";
import { Label } from "@/components/ui/label";
import { DonasiKhususData } from "@/lib/schema/pemasukan/schema";
import Swal from "sweetalert2";
import { createClient } from "@/lib/supabase/client";
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

interface EditDonasiKhususProps {
  isOpen: boolean;
  onClose: () => void;
  donasi: DonasiKhususData | null;
  onSave: (updatedDonasi: DonasiKhususData) => void;
  onDelete: (id: number) => void;
  year: string;
}

export function EditDonasiKhusus({
  isOpen,
  onClose,
  donasi,
  onSave,
  onDelete,
  year,
}: EditDonasiKhususProps) {
  const [formData, setFormData] = React.useState<DonasiKhususData | null>(null);
  const [jumlahDisplay, setJumlahDisplay] = React.useState("");

  React.useEffect(() => {
    if (donasi) {
      setFormData({
        ...donasi,
        tanggal:
          donasi.tanggal instanceof Date
            ? donasi.tanggal
            : new Date(donasi.tanggal),
      });
      setJumlahDisplay(formatAngkaInput(donasi.jumlah.toString()));
    }
  }, [donasi]);

  if (!formData) return null;

  const handleInputChange = (field: string, value: string | number | Date) => {
    setFormData((prev) => {
      if (!prev) return null;

      if (field === "nama" || field === "keterangan") {
        return { ...prev, [field]: value as string };
      } else if (field === "tanggal") {
        return { ...prev, [field]: value as Date };
      } else if (field === "jumlah") {
        const formatted = formatAngkaInput(value as string);
        setJumlahDisplay(formatted);
        const numValue = Number(parseFormattedNumber(formatted));
        return { ...prev, [field]: numValue };
      }
      return prev;
    });
  };

  const handleSave = async () => {
    if (formData) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("DonasiKhusus")
          .update({
            nama: formData.nama,
            tanggal:
              formData.tanggal instanceof Date
                ? format(formData.tanggal, "yyyy-MM-dd")
                : formData.tanggal,
            jumlah: formData.jumlah,
            keterangan: formData.keterangan,
          })
          .eq("id", formData.id);

        if (error) {
          console.error("Error updating donasi:", error);
          Swal.fire({
            title: "Error!",
            text: "Gagal memperbarui data donasi",
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
          text: "Data donasi berhasil diperbarui",
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

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      handleInputChange("tanggal", date);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Data Donasi Khusus</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nama" className="text-right">
              Nama
            </Label>
            <InputField
              id="nama"
              value={formData.nama}
              onChange={(e) => handleInputChange("nama", e.target.value)}
              className="col-span-3 w-full"
            />
          </div>
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
              value={jumlahDisplay}
              onChange={(e) => handleInputChange("jumlah", e.target.value)}
              className="col-span-3"
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="keterangan" className="text-right pt-2">
              Keterangan
            </Label>
            <div className="col-span-3">
              <TextArea
                placeholder="Masukkan keterangan donasi"
                rows={4}
                value={formData.keterangan}
                onChange={(value) => handleInputChange("keterangan", value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
