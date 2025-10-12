"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { TableActions } from "./table-actions";
import { formatCurrency } from "../../../pengeluaran/table-pengeluaran/utils";
import { type PengeluaranTahunanData } from "@/lib/schema/pengeluaran/schema";

interface ColumnOptions {
  onViewDetail?: (data: PengeluaranTahunanData) => void;
  onEdit?: (data: PengeluaranTahunanData) => void;
  onDelete?: (id: number) => void;
}

export const columns = ({
  onViewDetail,
  onEdit,
  onDelete,
}: ColumnOptions = {}): ColumnDef<PengeluaranTahunanData>[] => [
  {
    accessorKey: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("no")}</div>,
  },
  {
    accessorKey: "pengeluaran",
    header: () => <div className="text-left">Nama Pengeluaran</div>,
    cell: ({ row }) => <div className="text-left">{row.getValue("pengeluaran")}</div>,
  },
  {
    accessorKey: "jan",
    header: () => <div className="text-center">Jan</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("jan"))}</div>
    ),
  },
  {
    accessorKey: "feb",
    header: () => <div className="text-center">Feb</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("feb"))}</div>
    ),
  },
  {
    accessorKey: "mar",
    header: () => <div className="text-center">Mar</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("mar"))}</div>
    ),
  },
  {
    accessorKey: "apr",
    header: () => <div className="text-center">Apr</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("apr"))}</div>
    ),
  },
  {
    accessorKey: "mei",
    header: () => <div className="text-center">Mei</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("mei"))}</div>
    ),
  },
  {
    accessorKey: "jun",
    header: () => <div className="text-center">Jun</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("jun"))}</div>
    ),
  },
  {
    accessorKey: "jul",
    header: () => <div className="text-center">Jul</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("jul"))}</div>
    ),
  },
  {
    accessorKey: "aug",
    header: () => <div className="text-center">Aug</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("aug"))}</div>
    ),
  },
  {
    accessorKey: "sep",
    header: () => <div className="text-center">Sep</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("sep"))}</div>
    ),
  },
  {
    accessorKey: "okt",
    header: () => <div className="text-center">Okt</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("okt"))}</div>
    ),
  },
  {
    accessorKey: "nov",
    header: () => <div className="text-center">Nov</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("nov"))}</div>
    ),
  },
  {
    accessorKey: "des",
    header: () => <div className="text-center">Des</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("des"))}</div>
    ),
  },
  {
    id: "total",
    header: () => <div className="text-center">Total</div>,
    cell: ({ row }) => {
      const pengeluaran = row.original;
      const total =
        pengeluaran.jan +
        pengeluaran.feb +
        pengeluaran.mar +
        pengeluaran.apr +
        pengeluaran.mei +
        pengeluaran.jun +
        pengeluaran.jul +
        pengeluaran.aug +
        pengeluaran.sep +
        pengeluaran.okt +
        pengeluaran.nov +
        pengeluaran.des;
      return (
        <div className="text-center font-medium">
          {formatCurrency(total)}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <TableActions
          donatur={row.original}
          onViewDetail={onViewDetail}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    ),
  },
];
