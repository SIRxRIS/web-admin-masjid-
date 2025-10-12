"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { TableActions } from "@/components/inventaris/form/table-actions";
import { safeFormatDate } from "@/lib/date-helper";
import { type InventarisData } from "@/lib/schema/inventaris/schema";

interface ColumnOptions {
  onViewDetail?: (data: InventarisData) => void;
  onEdit?: (data: InventarisData) => void;
  onDelete?: (id: number) => void;
}

export const columns = ({
  onViewDetail,
  onEdit,
  onDelete,
}: ColumnOptions = {}): ColumnDef<InventarisData>[] => [
  {
    accessorKey: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("no")}</div>,
  },
  {
    accessorKey: "namaBarang",
    header: () => <div className="text-left">Nama Barang</div>,
    cell: ({ row }) => <div className="text-left">{row.getValue("namaBarang")}</div>,
  },
  {
    accessorKey: "kategori",
    header: () => <div className="text-center">Kategori</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("kategori")}</div>,
  },
  {
    accessorKey: "jumlah",
    header: () => <div className="text-center">Jumlah</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.getValue("jumlah")} {row.original.satuan}
      </div>
    ),
  },
  {
    accessorKey: "lokasi",
    header: () => <div className="text-center">Lokasi</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("lokasi")}</div>,
  },
  {
    accessorKey: "kondisi",
    header: () => <div className="text-center">Kondisi</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("kondisi")}</div>,
  },
  {
    accessorKey: "tanggalMasuk",
    header: () => <div className="text-center">Tanggal Masuk</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {safeFormatDate(row.getValue("tanggalMasuk"))}
      </div>
    ),
  },
  {
    accessorKey: "keterangan",
    header: () => <div className="text-center">Keterangan</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("keterangan") || "-"}</div>,
  },
  {
    id: "actions",
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <TableActions
          data={row.original}
          onViewDetail={onViewDetail}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    ),
  },
];
