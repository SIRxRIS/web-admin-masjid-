"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { TableActions } from "./table-actions";
import { formatCurrency } from "../utils";
import { type PengeluaranData } from "@/lib/schema/pengeluaran/schema";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ColumnOptions {
  onViewDetail?: (data: PengeluaranData) => void;
  onEdit?: (data: PengeluaranData) => void;
  onDelete?: (id: number) => void;
}

export const columns = ({
  onViewDetail,
  onEdit,
  onDelete,
}: ColumnOptions = {}): ColumnDef<PengeluaranData>[] => [
  {
    accessorKey: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("no")}</div>,
    size: 60,
  },
  {
    accessorKey: "nama",
    header: () => <div className="text-left">Nama Pengeluaran</div>,
    cell: ({ row }) => <div className="text-left">{row.getValue("nama")}</div>,
    size: 200,
  },
  {
    accessorKey: "tanggal",
    header: () => <div className="text-center">Tanggal</div>,
    cell: ({ row }) => {
      const date = row.getValue("tanggal") as Date;
      return (
        <div className="text-center">
          {format(date, "dd MMMM yyyy", { locale: id })}
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: "jumlah",
    header: () => <div className="text-center">Jumlah</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("jumlah"))}</div>
    ),
    size: 120,
  },
  {
    accessorKey: "keterangan",
    header: () => <div className="text-center">Keterangan</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("keterangan") || "-"}</div>,
    size: 200,
  },
  {
    id: "actions",
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <TableActions
          pengeluaran={row.original}
          onViewDetail={onViewDetail}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    ),
    size: 100,
  },
];