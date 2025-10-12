"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PengeluaranData } from "@/lib/schema/pengeluaran/schema";
import { formatCurrency } from "../../../pengeluaran/table-pengeluaran/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface DetailPengeluaranProps {
  isOpen: boolean;
  onClose: () => void;
  data: PengeluaranData | null;
  year: string; 
}

export function DetailPengeluaran({
  isOpen,
  onClose,
  data,
  year, 
}: DetailPengeluaranProps) {
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center font-bold">
            Detail Pengeluaran
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="font-semibold">Nama Pengeluaran</div>
            <div className="col-span-3">: {data.nama || "-"}</div>

            <div className="font-semibold">Tanggal</div>
            <div className="col-span-3">
              : {format(new Date(data.tanggal), "dd MMMM yyyy", { locale: id })}
            </div>

            <div className="font-semibold">Jumlah</div>
            <div className="col-span-3">
              : Rp. {formatCurrency(data.jumlah)}
            </div>

            <div className="font-semibold">Keterangan</div>
            <div className="col-span-3">: {data.keterangan || "-"}</div>
          </div>

          <div className="text-center mt-2 text-sm text-gray-600 italic">
            Semoga Menjadi Amal Shalih Yang Diridhai Allah SWT
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}