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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type KotakAmalData } from "../schema"; 

interface DetailKotakAmalProps {
  isOpen: boolean;
  onClose: () => void;
  kotakAmal: KotakAmalData | null;
  year: string;  
}

interface MonthlyCollection {  
  no: number;
  bulan: string;
  jumlah: string;  
}

export function DetailKotakAmal({  
  isOpen,
  onClose,
  kotakAmal,  
}: DetailKotakAmalProps) {
  if (!kotakAmal) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID").format(amount);
  };

  const totalCollection = React.useMemo(() => {
    return (
      kotakAmal.jan +
      kotakAmal.feb +
      kotakAmal.mar +
      kotakAmal.apr +
      kotakAmal.mei +
      kotakAmal.jun +
      kotakAmal.jul +
      kotakAmal.aug +
      kotakAmal.sep +
      kotakAmal.okt +
      kotakAmal.nov +
      kotakAmal.des
    );
  }, [kotakAmal]);

  const monthlyCollections: MonthlyCollection[] = [
    { no: 1, bulan: "Januari", jumlah: formatCurrency(kotakAmal.jan) },
    { no: 2, bulan: "Februari", jumlah: formatCurrency(kotakAmal.feb) },
    { no: 3, bulan: "Maret", jumlah: formatCurrency(kotakAmal.mar) },
    { no: 4, bulan: "April", jumlah: formatCurrency(kotakAmal.apr) },
    { no: 5, bulan: "Mei", jumlah: formatCurrency(kotakAmal.mei) },
    { no: 6, bulan: "Juni", jumlah: formatCurrency(kotakAmal.jun) },
    { no: 7, bulan: "Juli", jumlah: formatCurrency(kotakAmal.jul) },
    { no: 8, bulan: "Agustus", jumlah: formatCurrency(kotakAmal.aug) },
    { no: 9, bulan: "September", jumlah: formatCurrency(kotakAmal.sep) },
    { no: 10, bulan: "Oktober", jumlah: formatCurrency(kotakAmal.okt) },
    { no: 11, bulan: "November", jumlah: formatCurrency(kotakAmal.nov) },
    { no: 12, bulan: "Desember", jumlah: formatCurrency(kotakAmal.des) },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl text-center font-bold">
            Detail Kotak Amal 2025
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="font-semibold">Nama</div>
            <div className="col-span-3">: {kotakAmal.nama || "-"}</div>

            <div className="font-semibold">Lokasi</div>
            <div className="col-span-3">: {kotakAmal.lokasi || "-"}</div>

            <div className="font-semibold">Total</div>
            <div className="col-span-3">
              : Rp. {formatCurrency(totalCollection)}
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">No</TableHead>
                  <TableHead className="text-center">Bulan</TableHead>
                  <TableHead className="text-center">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyCollections.map((item) => (
                  <TableRow key={item.no}>
                    <TableCell className="text-center">{item.no}</TableCell>
                    <TableCell className="text-center">{item.bulan}</TableCell>
                    <TableCell className="text-center">{item.jumlah}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="text-center mt-2 text-sm text-gray-600 italic">
            Semoga Menjadi Amal Shalih Yang Diridhai Allah SWT
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
