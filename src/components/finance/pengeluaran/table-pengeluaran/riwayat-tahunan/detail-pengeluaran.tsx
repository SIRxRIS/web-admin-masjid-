"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "../../../pengeluaran/table-pengeluaran/utils";
import { Button } from "@/components/ui/button";
import { PengeluaranTahunanData } from "@/lib/schema/pengeluaran/schema";

interface DetailPengeluaranProps {
  isOpen: boolean;
  onClose: () => void;
  data: PengeluaranTahunanData | null;
  year: string;
}

export function DetailPengeluaran({
  isOpen,
  onClose,
  data,
  year,
}: DetailPengeluaranProps) {
  if (!data) return null;

  const months = [
    { name: "Januari", key: "jan" as keyof PengeluaranTahunanData },
    { name: "Februari", key: "feb" as keyof PengeluaranTahunanData },
    { name: "Maret", key: "mar" as keyof PengeluaranTahunanData },
    { name: "April", key: "apr" as keyof PengeluaranTahunanData },
    { name: "Mei", key: "mei" as keyof PengeluaranTahunanData },
    { name: "Juni", key: "jun" as keyof PengeluaranTahunanData },
    { name: "Juli", key: "jul" as keyof PengeluaranTahunanData },
    { name: "Agustus", key: "aug" as keyof PengeluaranTahunanData },
    { name: "September", key: "sep" as keyof PengeluaranTahunanData },
    { name: "Oktober", key: "okt" as keyof PengeluaranTahunanData },
    { name: "November", key: "nov" as keyof PengeluaranTahunanData },
    { name: "Desember", key: "des" as keyof PengeluaranTahunanData },
  ];

  // Hitung total dari semua bulan
  const totalAmount = months.reduce((sum, month) => {
    return sum + ((data[month.key] as number) || 0);
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center font-bold">
            Detail Pengeluaran {year}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="font-semibold">Pengeluaran</div>
            <div className="col-span-3">: {data.pengeluaran || "-"}</div>

            <div className="font-semibold">Total</div>
            <div className="col-span-3">: {formatCurrency(totalAmount)}</div>
          </div>

          <div className="border rounded-md p-4 mt-4">
            <h3 className="font-semibold mb-2">Pengeluaran Bulanan</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bulan</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {months.map((month) => {
                  // Menggunakan type assertion yang aman
                  const amount = (data[month.key] as number) || 0;
                  return (
                    <TableRow key={month.key}>
                      <TableCell>{month.name}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(amount)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="text-center mt-4 text-sm text-gray-600 italic">
            Dana ini telah digunakan untuk keperluan masjid
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
