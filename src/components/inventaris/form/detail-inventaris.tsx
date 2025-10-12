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
import { Button } from "@/components/ui/button";
import { InventarisData } from "@/lib/schema/inventaris/schema";
import { safeFormatDate } from "@/lib/date-helper"; 
import Image from "next/image";

interface DetailInventarisProps {
  isOpen: boolean;
  onClose: () => void;
  data: InventarisData | null;
}

export function DetailInventaris({
  isOpen,
  onClose,
  data,
}: DetailInventarisProps) {
  if (!data) return null;

  const renderKondisiBadge = (kondisi: string) => {
    let badgeColor = "";
    switch (kondisi) {
      case "BAIK":
        badgeColor = "bg-green-100 text-green-800";
        break;
      case "CUKUP":
        badgeColor = "bg-yellow-100 text-yellow-800";
        break;
      case "RUSAK":
        badgeColor = "bg-red-100 text-red-800";
        break;
      default:
        badgeColor = "bg-gray-100 text-gray-800";
    }
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}
      >
        {kondisi}
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center font-bold">
            Detail Inventaris
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          {data.fotoUrl && (
            <div className="mb-4 flex justify-center">
              <div className="w-64 h-64 relative rounded-md overflow-hidden">
                <Image
                  src={data.fotoUrl}
                  alt={data.namaBarang}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Menggunakan Table untuk menampilkan detail inventaris */}
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold w-1/3">Nama Barang</TableCell>
                <TableCell>{data.namaBarang || "-"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Kategori</TableCell>
                <TableCell>{data.kategori || "-"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Jumlah</TableCell>
                <TableCell>{data.jumlah} {data.satuan}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Lokasi</TableCell>
                <TableCell>{data.lokasi || "-"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Kondisi</TableCell>
                <TableCell>{renderKondisiBadge(data.kondisi)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Tanggal Masuk</TableCell>
                <TableCell>{safeFormatDate(data.tanggalMasuk)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Keterangan</TableCell>
                <TableCell>{data.keterangan || "-"}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="text-center mt-4 text-sm text-gray-600 italic">
            Data inventaris ini telah tercatat dalam sistem
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}