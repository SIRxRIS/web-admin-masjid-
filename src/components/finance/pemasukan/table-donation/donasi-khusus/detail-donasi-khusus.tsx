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
import { DonasiKhususData } from "@/lib/schema/pemasukan/schema";
import { formatCurrency } from "../utils";
import { format, isValid } from "date-fns"; 
import { id } from "date-fns/locale"; 

interface DetailDonasiKhususProps {
  isOpen: boolean;
  onClose: () => void;
  donasi: DonasiKhususData | null;
  year: string;  
}

export function DetailDonasiKhusus({
  isOpen,
  onClose,
  donasi,
  year,  
}: DetailDonasiKhususProps) {
  if (!donasi) return null;

  const formatDate = (dateValue: Date | string) => {
    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      return isValid(date) 
        ? format(date, "dd MMMM yyyy", { locale: id })
        : "Tanggal tidak valid";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Tanggal tidak valid";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Detail Donasi Khusus
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="grid grid-cols-4 gap-2">
            <div className="font-semibold">Nama</div>
            <div className="col-span-3">: {donasi.nama}</div>

            <div className="font-semibold">Tanggal</div>
            <div className="col-span-3">
              : {formatDate(donasi.tanggal)}
            </div>

            <div className="font-semibold">Jumlah</div>
            <div className="col-span-3">
              : Rp. {formatCurrency(donasi.jumlah)}
            </div>

            <div className="font-semibold">Keterangan</div>
            <div className="col-span-3">: {donasi.keterangan}</div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}