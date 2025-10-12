// src/components/finance/pengeluaran/table-pengeluaran/data-table-tabs-content.tsx
"use client";

import * as React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { TableRiwayatTahunan } from "./riwayat-tahunan/table-riwayat-tahunan";
import { TablePengeluaran } from "./table-pengeluaran-bulanan/table-pengeluaran";
import { Table } from "@tanstack/react-table";
import {
  type PengeluaranData,
  type PengeluaranTahunanData,
} from "@/lib/services/supabase/pengeluaran/pengeluaran";

interface DataTableTabsContentProps {
  pengeluaranData: PengeluaranData[];
  searchQuery: string;
  year: string;
  onTableInstanceChange?: (table: Table<any> | null) => void;
}

export function DataTableTabsContent({
  pengeluaranData,
  searchQuery,
  year,
  onTableInstanceChange
}: DataTableTabsContentProps) {
  const filteredPengeluaranData = React.useMemo(() => {
    if (!searchQuery) return pengeluaranData;

    const lowerQuery = searchQuery.toLowerCase();
    return pengeluaranData.filter(
      (item) =>
        item.nama.toLowerCase().includes(lowerQuery) ||
        (item.keterangan?.toLowerCase() || '').includes(lowerQuery)
    );
  }, [pengeluaranData, searchQuery]);

  const transformedData = React.useMemo(() => {
    const monthlyData = filteredPengeluaranData.reduce((acc, item) => {
      const month = new Date(item.tanggal).getMonth();
      const monthKey = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'][month] as keyof Pick<PengeluaranTahunanData, 'jan' | 'feb' | 'mar' | 'apr' | 'mei' | 'jun' | 'jul' | 'aug' | 'sep' | 'okt' | 'nov' | 'des'>;

      if (!acc[item.nama]) {
        acc[item.nama] = {
          id: item.id,
          no: item.no,
          pengeluaran: item.nama,
          jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0,
          jul: 0, aug: 0, sep: 0, okt: 0, nov: 0, des: 0
        };
      }

      acc[item.nama][monthKey] = item.jumlah;
      return acc;
    }, {} as Record<string, PengeluaranTahunanData>);

    return Object.values(monthlyData);
  }, [filteredPengeluaranData]);

  const [riwayatTahunanTable, setRiwayatTahunanTable] = React.useState<Table<PengeluaranTahunanData> | null>(null);
  const [pengeluaranTable, setPengeluaranTable] = React.useState<Table<PengeluaranData> | null>(null);
  const [activeTab, setActiveTab] = React.useState("riwayat-tahunan");

  React.useEffect(() => {
    if (onTableInstanceChange) {
      const currentTable = activeTab === "riwayat-tahunan" ? riwayatTahunanTable : pengeluaranTable;
      onTableInstanceChange(currentTable);
    }
  }, [activeTab, riwayatTahunanTable, pengeluaranTable, onTableInstanceChange]);

  return (
    <>
      <TabsContent
        value="riwayat-tahunan"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        onSelect={() => setActiveTab("riwayat-tahunan")}
      >
        <TableRiwayatTahunan
          pengeluaranData={transformedData}
          year={year}
        />
      </TabsContent>

      <TabsContent
        value="pengeluaran-bulanan"
        className="flex flex-col px-4 lg:px-6"
        onSelect={() => setActiveTab("pengeluaran-bulanan")}
      >
        <TablePengeluaran
          pengeluaranData={filteredPengeluaranData}
          year={year}
        />
      </TabsContent>
    </>
  );
}

interface TableRiwayatTahunanProps {
  pengeluaranData: PengeluaranTahunanData[];
  year: string;
  table?: Table<any> | null;
  onTableChange?: (table: Table<any> | null) => void;
}

interface TablePengeluaranProps {
  pengeluaranData: PengeluaranData[];
  year: string;
  table?: Table<any> | null;
  onTableChange?: (table: Table<any> | null) => void;
  onDataChange?: (updatedData: PengeluaranData[]) => void;
}
