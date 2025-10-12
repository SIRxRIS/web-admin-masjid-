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
import { KotakAmalMasjidData } from "../schema";
import { formatCurrency } from "../utils";
import { format, isValid } from "date-fns";
import { id } from "date-fns/locale";

interface DetailKotakAmalMasjidProps {
  isOpen: boolean;
  onClose: () => void;
  kotakAmal: KotakAmalMasjidData | null;
  year: string;  
}

export function DetailKotakAmalMasjid({
  isOpen,
  onClose,
  kotakAmal,
  year,  
}: DetailKotakAmalMasjidProps) {
  if (!kotakAmal) return null;

  const formatTanggal = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (!isValid(dateObj)) return "Format tanggal tidak valid";
      return format(dateObj, "dd MMMM yyyy", { locale: id });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Format tanggal tidak valid";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Detail Kotak Amal Masjid
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="grid grid-cols-4 gap-2">
            <div className="font-semibold">Tanggal</div>
            <div className="col-span-3">
              : {formatTanggal(kotakAmal.tanggal)}
            </div>

            <div className="font-semibold">Jumlah</div>
            <div className="col-span-3">
              : {formatCurrency(kotakAmal.jumlah)}
            </div>

            <div className="font-semibold">Tahun</div>
            <div className="col-span-3">: {kotakAmal.tahun}</div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}