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
import { DonaturData } from "../schema";
import { type IntegratedData } from "@/lib/services/supabase/data-integration";
import { formatCurrency } from "../../../pemasukan/table-donation/utils";

interface DetailDonaturProps {
  isOpen: boolean;
  onClose: () => void;
  data: IntegratedData | null;
  year: string;
}

interface MonthlyDonation {
  no: number;
  bulan: string;
  donasi: string;
  infaq: string;
}

export function DetailDonatur({
  isOpen,
  onClose,
  data,
  year,
}: DetailDonaturProps) {
  if (!data) return null;

  const totalDonasi = React.useMemo(() => {
    return data.total - data.infaq;
  }, [data]);

  const monthlyDonations: MonthlyDonation[] = [
    { no: 1, bulan: "Januari", donasi: formatCurrency(data.jan), infaq: formatCurrency(data.infaq) },
    { no: 2, bulan: "Februari", donasi: formatCurrency(data.feb), infaq: formatCurrency(data.infaq) },
    { no: 3, bulan: "Maret", donasi: formatCurrency(data.mar), infaq: formatCurrency(data.infaq) },
    { no: 4, bulan: "April", donasi: formatCurrency(data.apr), infaq: formatCurrency(data.infaq) },
    { no: 5, bulan: "Mei", donasi: formatCurrency(data.mei), infaq: formatCurrency(data.infaq) },
    { no: 6, bulan: "Juni", donasi: formatCurrency(data.jun), infaq: formatCurrency(data.infaq) },
    { no: 7, bulan: "Juli", donasi: formatCurrency(data.jul), infaq: formatCurrency(data.infaq) },
    { no: 8, bulan: "Agustus", donasi: formatCurrency(data.aug), infaq: formatCurrency(data.infaq) },
    { no: 9, bulan: "September", donasi: formatCurrency(data.sep), infaq: formatCurrency(data.infaq) },
    { no: 10, bulan: "Oktober", donasi: formatCurrency(data.okt), infaq: formatCurrency(data.infaq) },
    { no: 11, bulan: "November", donasi: formatCurrency(data.nov), infaq: formatCurrency(data.infaq) },
    { no: 12, bulan: "Desember", donasi: formatCurrency(data.des), infaq: formatCurrency(data.infaq) },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center font-bold">
            {/* Update title based on source type */}
            {data.sourceType === 'donatur' ? 'Kartu Donatur Tetap' : 
             data.sourceType === 'kotakAmal' ? 'Detail Kotak Amal' : 
             'Detail Donasi Khusus'} {year}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="font-semibold">Nama</div>
            <div className="col-span-3">: {data.nama || "-"}</div>

            <div className="font-semibold">Alamat</div>
            <div className="col-span-3">: {data.alamat || "-"}</div>

            <div className="font-semibold">Donasi</div>
            <div className="col-span-3">
              : Rp. {formatCurrency(totalDonasi)}
            </div>

            <div className="font-semibold">Infaq</div>
            <div className="col-span-3">
              : Rp. {formatCurrency(data.infaq)}
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Bulan</TableHead>
                  <TableHead>Donasi</TableHead>
                  <TableHead>Infaq</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyDonations.map((item) => (
                  <TableRow key={item.no}>
                    <TableCell className="text-center">{item.no}</TableCell>
                    <TableCell>{item.bulan}</TableCell>
                    <TableCell>{item.donasi}</TableCell>
                    <TableCell>{item.infaq}</TableCell>
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
