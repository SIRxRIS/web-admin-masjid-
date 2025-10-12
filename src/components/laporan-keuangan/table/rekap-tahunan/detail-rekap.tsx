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
import { RekapPemasukan, RekapPengeluaran } from "@/lib/schema/laporan/schema";
import { safeFormatDate } from "@/lib/date-helper";

interface DetailRekapProps {
  isOpen: boolean;
  onClose: () => void;
  rekap: RekapPemasukan | RekapPengeluaran | null;
  year: string;
  type: 'pemasukan' | 'pengeluaran';
}

export function DetailRekap({
  isOpen,
  onClose,
  rekap,
  year,
  type,
}: DetailRekapProps) {
  if (!rekap) return null;

  const renderDetailContent = () => {
    if (type === 'pemasukan') {
      const pemasukan = rekap as RekapPemasukan;
      return (
        <>
          <div className="font-semibold">Sumber</div>
          <div className="col-span-3">: {pemasukan.sumber}</div>
        </>
      );
    } else {
      const pengeluaran = rekap as RekapPengeluaran;
      return (
        <>
          <div className="font-semibold">Nama</div>
          <div className="col-span-3">: {pengeluaran.nama}</div>
        </>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Detail Rekap {type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="grid grid-cols-4 gap-2">
            {renderDetailContent()}
            <div className="font-semibold">Tahun</div>
            <div className="col-span-3">: {safeFormatDate(`${rekap.tahun}-01-01`, "yyyy")}</div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}