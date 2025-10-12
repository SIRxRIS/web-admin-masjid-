// src/components/admin/layout/finance/pengeluaran/table-pengeluaran/index.tsx
"use client";

import * as React from "react";
import { type Table } from "@tanstack/react-table";
import { type PengeluaranData, type PengeluaranTahunanData } from "@/lib/schema/pengeluaran/schema";
import { TableViewTabs } from "./table-view-tabs";
import { Tabs } from "@/components/ui/tabs";
import { DataTableTabsContent } from "./data-table-tabs-content";
import { TableToolbar } from "./table-toolbar";

interface DataTableProps {
  data: PengeluaranData[];
  availableYears: string[];
}

export function DataTable({
  data: initialPengeluaranData,
  availableYears, // Destructure availableYears dari props
}: DataTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [year, setYear] = React.useState("2025");
  const [activeTab, setActiveTab] = React.useState("riwayat-tahunan");
  const [tableInstance, setTableInstance] = React.useState<Table<
    PengeluaranData | PengeluaranTahunanData
  > | null>(null);

  // Transform data untuk riwayat tahunan
  const transformedData = React.useMemo(() => {
    const filteredData = initialPengeluaranData.filter(item => {
      if (!searchQuery) return true;
      const lowerQuery = searchQuery.toLowerCase();
      return item.nama.toLowerCase().includes(lowerQuery) ||
        (item.keterangan?.toLowerCase() || '').includes(lowerQuery);
    });

    const monthlyData = filteredData.reduce((acc, item) => {
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
  }, [initialPengeluaranData, searchQuery]);

  const getPlaceholder = () => {
    switch (activeTab) {
      case "riwayat-tahunan":
        return "Cari pengeluaran...";
      case "pengeluaran-bulanan":
        return "Cari pengeluaran bulanan...";
      default:
        return "Cari...";
    }
  };

  return (
    <div className="w-full flex-col justify-start gap-6">
      <Tabs
        defaultValue="riwayat-tahunan"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TableViewTabs 
          table={tableInstance}
          activeTab={activeTab}
          year={year}
          pengeluaranData={initialPengeluaranData}
          pengeluaranTahunanData={transformedData}
          searchQuery={searchQuery}
        />
        <TableToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder={getPlaceholder()}
          year={year}
          setYear={setYear}
          availableYears={availableYears}
          table={tableInstance}
        />
        <DataTableTabsContent
          pengeluaranData={initialPengeluaranData}
          searchQuery={searchQuery}
          year={year}
          onTableInstanceChange={setTableInstance}
        />
      </Tabs>
    </div>
  );
}
