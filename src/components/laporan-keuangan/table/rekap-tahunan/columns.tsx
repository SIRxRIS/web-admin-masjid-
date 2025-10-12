"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { TableActions } from "./table-actions";
import { formatCurrency } from "../../utils";
import { RekapPengeluaran, RekapPemasukan } from "@/lib/schema/laporan/schema";

type RekapData = (RekapPemasukan | RekapPengeluaran) & {
  tipe?: "header" | "pemasukan" | "pengeluaran" | "saldo_akhir";
  isTotal?: boolean;
};

interface ColumnOptions {
  onViewDetail?: (data: RekapPengeluaran | RekapPemasukan) => void;
  onEdit?: (data: RekapPengeluaran | RekapPemasukan) => void;
  onDelete?: (id: number) => void;
}

function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const columns = ({
  onViewDetail,
  onEdit,
  onDelete,
}: ColumnOptions = {}): ColumnDef<RekapData>[] => [
  {
    accessorKey: "no",
    header: () => <div className="text-center font-bold">No</div>,
    cell: ({ row }) => {
      const data = row.original;
      if (data.tipe === "header") {
        return <div className="font-bold">{""}</div>;
      }
      if (data.isTotal) {
        return <div className="font-bold">{""}</div>;
      }
      return <div className="text-center">{row.original.id}</div>;
    },
    size: 60,
  },
  {
    id: "kategori",
    header: () => <div className="text-center font-bold">Kategori</div>,
    cell: ({ row }) => {
      const data = row.original;
      
      if (data.tipe === "header") {
        return <div className="font-bold pl-2">{data.tipe === "header" && ('sumber' in data) ? "PEMASUKAN" : "PENGELUARAN"}</div>;
      }
      
      if (data.tipe === "saldo_akhir") {
        return <div className="font-bold pl-2">SALDO AKHIR</div>;
      }
      
      if (data.isTotal) {
        return <div className="font-bold pl-2">{data.tipe === "pemasukan" ? "TOTAL PEMASUKAN" : "TOTAL PENGELUARAN"}</div>;
      }
      
      return <div className="text-left pl-8">
        {('sumber' in data) 
          ? toTitleCase(data.sumber.replace(/_/g, ' '))
          : data.nama}
      </div>;
    },
    size: 200,
  },
  {
    accessorKey: "jan",
    header: () => <div className="text-center font-bold">Januari</div>,
    cell: ({ row }) => {
      const data = row.original;
      const value = row.getValue("jan") || 0;
      
      if (data.tipe === "header") {
        return <div className="font-bold">{""}</div>;
      }
      
      return <div className={`text-right ${data.tipe === "saldo_akhir" ? "font-bold text-blue-600 dark:text-blue-400" : data.isTotal ? "font-bold" : ""}`}>
        {value !== 0 ? formatCurrency(value as number).replace("Rp", "") : "-"}
      </div>;
    },
    size: 90,
  },
  {
    accessorKey: "feb",
    header: () => <div className="text-center font-bold">Februari</div>,
    cell: ({ row }) => {
      const data = row.original;
      const value = row.getValue("feb") || 0;
      
      if (data.tipe === "header") {
        return <div className="font-bold">{""}</div>;
      }
      
      return <div className={`text-right ${data.tipe === "saldo_akhir" ? "font-bold text-blue-600 dark:text-blue-400" : data.isTotal ? "font-bold" : ""}`}>
        {value !== 0 ? formatCurrency(value as number).replace("Rp", "") : "-"}
      </div>;
    },
    size: 90,
  },
  {
    accessorKey: "mar",
    header: () => <div className="text-center font-bold">Maret</div>,
    cell: ({ row }) => {
      const data = row.original;
      const value = row.getValue("mar") || 0;
      
      if (data.tipe === "header") {
        return <div className="font-bold">{""}</div>;
      }
      
      return <div className={`text-right ${data.tipe === "saldo_akhir" ? "font-bold text-blue-600 dark:text-blue-400" : data.isTotal ? "font-bold" : ""}`}>
        {value !== 0 ? formatCurrency(value as number).replace("Rp", "") : "-"}
      </div>;
    },
    size: 90,
  },
  {
    accessorKey: "apr",
    header: () => <div className="text-center font-bold">April</div>,
    cell: ({ row }) => {
      const data = row.original;
      const value = row.getValue("apr") || 0;
      
      if (data.tipe === "header") {
        return <div className="font-bold">{""}</div>;
      }
      
      return <div className={`text-right ${data.tipe === "saldo_akhir" ? "font-bold text-blue-600 dark:text-blue-400" : data.isTotal ? "font-bold" : ""}`}>
        {value !== 0 ? formatCurrency(value as number).replace("Rp", "") : "-"}
      </div>;
    },
    size: 90,
  },
  {
    accessorKey: "mei",
    header: () => <div className="text-center font-bold">Mei</div>,
    cell: ({ row }) => {
      const data = row.original;
      const value = row.getValue("mei") || 0;
      
      if (data.tipe === "header") {
        return <div className="font-bold">{""}</div>;
      }
      
      return <div className={`text-right ${data.tipe === "saldo_akhir" ? "font-bold text-blue-600 dark:text-blue-400" : data.isTotal ? "font-bold" : ""}`}>
        {value !== 0 ? formatCurrency(value as number).replace("Rp", "") : "-"}
      </div>;
    },
    size: 90,
  },
  {
    accessorKey: "jun",
    header: () => <div className="text-center font-bold">Juni</div>,
    cell: ({ row }) => {
      const data = row.original;
      const value = row.getValue("jun") || 0;
      
      if (data.tipe === "header") {
        return <div className="font-bold">{""}</div>;
      }
      
      return <div className={`text-right ${data.tipe === "saldo_akhir" ? "font-bold text-blue-600 dark:text-blue-400" : data.isTotal ? "font-bold" : ""}`}>
        {value !== 0 ? formatCurrency(value as number).replace("Rp", "") : "-"}
      </div>;
    },
    size: 90,
  },
  {
    accessorKey: "jul",
    header: () => <div className="text-center font-bold">Juli</div>,
    cell: ({ row }) => {
      const data = row.original;
      const value = row.getValue("jul") || 0;
      
      if (data.tipe === "header") {
        return <div className="font-bold">{""}</div>;
      }
      
      return <div className={`text-right ${data.tipe === "saldo_akhir" ? "font-bold text-blue-600 dark:text-blue-400" : data.isTotal ? "font-bold" : ""}`}>
        {value !== 0 ? formatCurrency(value as number).replace("Rp", "") : "-"}
      </div>;
    },
    size: 90,
  },
  {
    accessorKey: "aug",
    header: () => <div className="text-center font-bold">Agustus</div>,
    cell: ({ row }) => {
      const data = row.original;
      const value = row.getValue("aug") || 0;
      
      if (data.tipe === "header") {
        return <div className="font-bold">{""}</div>;
      }
      
      return <div className={`text-right ${data.tipe === "saldo_akhir" ? "font-bold text-blue-600 dark:text-blue-400" : data.isTotal ? "font-bold" : ""}`}>
        {value !== 0 ? formatCurrency(value as number).replace("Rp", "") : "-"}
      </div>;
    },
    size: 90,
  },
  {
    accessorKey: "sep",
    header: () => <div className="text-center font-bold">September</div>,
    cell: ({ row }) => {
      const data = row.original;
      const value = row.getValue("sep") || 0;
      
      if (data.tipe === "header") {
        return <div className="font-bold">{""}</div>;
      }
      
      return <div className={`text-right ${data.tipe === "saldo_akhir" ? "font-bold text-blue-600 dark:text-blue-400" : data.isTotal ? "font-bold" : ""}`}>
        {value !== 0 ? formatCurrency(value as number).replace("Rp", "") : "-"}
      </div>;
    },
    size: 90,
  },
  {
    accessorKey: "okt",
    header: () => <div className="text-center font-bold">Oktober</div>,
    cell: ({ row }) => {
      const data = row.original;
      const value = row.getValue("okt") || 0;
      
      if (data.tipe === "header") {
        return <div className="font-bold">{""}</div>;
      }
      
      return <div className={`text-right ${data.tipe === "saldo_akhir" ? "font-bold text-blue-600 dark:text-blue-400" : data.isTotal ? "font-bold" : ""}`}>
        {value !== 0 ? formatCurrency(value as number).replace("Rp", "") : "-"}
      </div>;
    },
    size: 90,
  },
  {
    accessorKey: "nov",
    header: () => <div className="text-center font-bold">November</div>,
    cell: ({ row }) => {
      const data = row.original;
      const value = row.getValue("nov") || 0;
      
      if (data.tipe === "header") {
        return <div className="font-bold">{""}</div>;
      }
      
      return <div className={`text-right ${data.tipe === "saldo_akhir" ? "font-bold text-blue-600 dark:text-blue-400" : data.isTotal ? "font-bold" : ""}`}>
        {value !== 0 ? formatCurrency(value as number).replace("Rp", "") : "-"}
      </div>;
    },
    size: 90,
  },
  {
    accessorKey: "des",
    header: () => <div className="text-center font-bold">Desember</div>,
    cell: ({ row }) => {
      const data = row.original;
      const value = row.getValue("des") || 0;
      
      if (data.tipe === "header") {
        return <div className="font-bold">{""}</div>;
      }
      
      return <div className={`text-right ${data.tipe === "saldo_akhir" ? "font-bold text-blue-600 dark:text-blue-400" : data.isTotal ? "font-bold" : ""}`}>
        {value !== 0 ? formatCurrency(value as number).replace("Rp", "") : "-"}
      </div>;
    },
    size: 90,
  },
  {
    accessorKey: "total",
    header: () => <div className="text-center font-bold">TOTAL</div>,
    cell: ({ row }) => {
      const data = row.original;
      const value = row.getValue("total") || 0;
      
      if (data.tipe === "header") {
        return <div className="font-bold">{""}</div>;
      }
      
      return <div className={`text-right font-bold ${data.tipe === "saldo_akhir" ? "text-blue-600 dark:text-blue-400" : ""}`}>
        {value !== 0 ? formatCurrency(value as number).replace("Rp", "") : "-"}
      </div>;
    },
    size: 120,
  },
  {
    id: "actions",
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => {
      const data = row.original;
      
      if (data.tipe === "header" || data.isTotal || data.tipe === "saldo_akhir") {
        return null;
      }
      
      return (
        <TableActions
          data={row.original}
          onViewDetail={onViewDetail}
          onEdit={onEdit}
          onDelete={onDelete ? () => onDelete(row.original.id) : undefined}
          type={row.original.tipe === 'pemasukan' ? 'pemasukan' : 'pengeluaran'}
        />
      );
    },
    size: 100,
  },
];

export const processRekapData = (
  pemasukanData: RekapPemasukan[], 
  pengeluaranData: RekapPengeluaran[]
): RekapData[] => {
  const result: RekapData[] = [];
  
  result.push({
    id: 0,
    tipe: "header",
    sumber: "PEMASUKAN" as any,
    tahun: 0,
    jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0,
    jul: 0, aug: 0, sep: 0, okt: 0, nov: 0, des: 0,
    total: 0
  });
  
  const pemasukanWithType = pemasukanData.map(item => ({
    ...item,
    tipe: "pemasukan" as const
  }));
  result.push(...pemasukanWithType);
  
  const totalPemasukan = {
    id: 99,
    tipe: "pemasukan" as const,
    isTotal: true,
    sumber: "TOTAL_PEMASUKAN" as any,
    tahun: pemasukanData[0]?.tahun || 0,
    jan: pemasukanData.reduce((sum, item) => sum + item.jan, 0),
    feb: pemasukanData.reduce((sum, item) => sum + item.feb, 0),
    mar: pemasukanData.reduce((sum, item) => sum + item.mar, 0),
    apr: pemasukanData.reduce((sum, item) => sum + item.apr, 0),
    mei: pemasukanData.reduce((sum, item) => sum + item.mei, 0),
    jun: pemasukanData.reduce((sum, item) => sum + item.jun, 0),
    jul: pemasukanData.reduce((sum, item) => sum + item.jul, 0),
    aug: pemasukanData.reduce((sum, item) => sum + item.aug, 0),
    sep: pemasukanData.reduce((sum, item) => sum + item.sep, 0),
    okt: pemasukanData.reduce((sum, item) => sum + item.okt, 0),
    nov: pemasukanData.reduce((sum, item) => sum + item.nov, 0),
    des: pemasukanData.reduce((sum, item) => sum + item.des, 0),
    total: pemasukanData.reduce((sum, item) => sum + item.total, 0)
  };
  result.push(totalPemasukan);
  
  result.push({
    id: 0,
    tipe: "header",
    nama: "PENGELUARAN",
    tahun: 0,
    jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0,
    jul: 0, aug: 0, sep: 0, okt: 0, nov: 0, des: 0,
    total: 0
  });
  
  const pengeluaranWithType = pengeluaranData.map(item => ({
    ...item,
    tipe: "pengeluaran" as const
  }));
  result.push(...pengeluaranWithType);
  
  const totalPengeluaran = {
    id: 999,
    tipe: "pengeluaran" as const,
    isTotal: true,
    nama: "TOTAL_PENGELUARAN",
    tahun: pengeluaranData[0]?.tahun || 0,
    jan: pengeluaranData.reduce((sum, item) => sum + item.jan, 0),
    feb: pengeluaranData.reduce((sum, item) => sum + item.feb, 0),
    mar: pengeluaranData.reduce((sum, item) => sum + item.mar, 0),
    apr: pengeluaranData.reduce((sum, item) => sum + item.apr, 0),
    mei: pengeluaranData.reduce((sum, item) => sum + item.mei, 0),
    jun: pengeluaranData.reduce((sum, item) => sum + item.jun, 0),
    jul: pengeluaranData.reduce((sum, item) => sum + item.jul, 0),
    aug: pengeluaranData.reduce((sum, item) => sum + item.aug, 0),
    sep: pengeluaranData.reduce((sum, item) => sum + item.sep, 0),
    okt: pengeluaranData.reduce((sum, item) => sum + item.okt, 0),
    nov: pengeluaranData.reduce((sum, item) => sum + item.nov, 0),
    des: pengeluaranData.reduce((sum, item) => sum + item.des, 0),
    total: pengeluaranData.reduce((sum, item) => sum + item.total, 0)
  };
  result.push(totalPengeluaran);
  
  const saldoAkhir = {
    id: 9999,
    tipe: "saldo_akhir" as const,
    isTotal: true,
    nama: "SALDO_AKHIR",
    tahun: pemasukanData[0]?.tahun || 0,
    jan: totalPemasukan.jan - totalPengeluaran.jan,
    feb: totalPemasukan.feb - totalPengeluaran.feb,
    mar: totalPemasukan.mar - totalPengeluaran.mar,
    apr: totalPemasukan.apr - totalPengeluaran.apr,
    mei: totalPemasukan.mei - totalPengeluaran.mei,
    jun: totalPemasukan.jun - totalPengeluaran.jun,
    jul: totalPemasukan.jul - totalPengeluaran.jul,
    aug: totalPemasukan.aug - totalPengeluaran.aug,
    sep: totalPemasukan.sep - totalPengeluaran.sep,
    okt: totalPemasukan.okt - totalPengeluaran.okt,
    nov: totalPemasukan.nov - totalPengeluaran.nov,
    des: totalPemasukan.des - totalPengeluaran.des,
    total: totalPemasukan.total - totalPengeluaran.total
  };
  result.push(saldoAkhir);
  
  return result;
};
