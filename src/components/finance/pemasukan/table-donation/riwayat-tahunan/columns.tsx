"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { TableActions } from "./table-actions";
import { formatCurrency } from "../../../pemasukan/table-donation/utils";
import { type IntegratedData } from "@/lib/services/supabase/data-integration";

interface ColumnOptions {
  onViewDetail?: (data: IntegratedData) => void;
  onEdit?: (data: IntegratedData) => void;
  onDelete?: (id: number) => void; 
}

export const columns = ({
  onViewDetail,
  onEdit,
  onDelete,
}: ColumnOptions = {}): ColumnDef<IntegratedData>[] => [
  {
    accessorKey: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("no")}</div>,
  },
  {
    accessorKey: "nama",
    header: () => <div className="text-left">Nama</div>,
    cell: ({ row }) => <div className="text-left">{row.getValue("nama")}</div>,
  },
  {
    accessorKey: "alamat",
    header: () => <div className="text-left">Alamat</div>,
    cell: ({ row }) => <div className="text-left">{row.getValue("alamat")}</div>,
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
    accessorKey: "infaq",
    header: () => <div className="text-center">Infaq</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("infaq"))}</div>
    ),
  },
  {
    accessorKey: "total",
    header: () => <div className="text-center">Total</div>,
    cell: ({ row }) => {
      const donatur = row.original;
      const total =
        donatur.jan +
        donatur.feb +
        donatur.mar +
        donatur.apr +
        donatur.mei +
        donatur.jun +
        donatur.jul +
        donatur.aug +
        donatur.sep +
        donatur.okt +
        donatur.nov +
        donatur.des +
        donatur.infaq;
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
      <div className="text-center">
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

