// src/components/inventaris/index.tsx
"use client";

import * as React from "react";
import { type InventarisData } from "@/lib/schema/inventaris/schema";
import { TableViewTabs } from "./table-view-tabs";
import { Tabs } from "@/components/ui/tabs";
import { DataTableTabsContent } from "./data-table-tabs-content";
import { TableToolbar } from "./table-toolbar";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

interface DataTableProps {
  data: InventarisData[];
  availableYears?: string[] | number[];
  onDataChange?: (data: InventarisData[]) => void;
  onCreateInventaris?: (data: any, file?: File) => Promise<InventarisData>;
  onUpdateInventaris?: (
    id: number,
    data: any,
    file?: File
  ) => Promise<InventarisData>;
  onDeleteInventaris?: (id: number) => Promise<boolean>;
}

export function DataTable({
  data: initialData,
  availableYears = [],
  onDataChange,
  onCreateInventaris,
  onUpdateInventaris,
  onDeleteInventaris,
}: DataTableProps) {
  // State management - dipindahkan dari InventarisClientComponent
  const [inventarisData, setInventarisData] =
    React.useState<InventarisData[]>(initialData);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [year, setYear] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState("daftar-inventaris");
  const [isLoading, setIsLoading] = React.useState(false);

  // Konversi availableYears ke string[] untuk konsistensi
  const yearStrings = React.useMemo(() => {
    return availableYears.map((year) =>
      typeof year === "number" ? year.toString() : year
    );
  }, [availableYears]);

  // Update local data ketika initialData berubah
  React.useEffect(() => {
    setInventarisData(initialData);
  }, [initialData]);

  // Set default year
  React.useEffect(() => {
    if (yearStrings.length > 0 && !year) {
      setYear(yearStrings[0]);
    }
  }, [yearStrings, year]);

  // Handler untuk perubahan data dengan callback ke parent
  const handleDataChange = React.useCallback(
    (newData: InventarisData[]) => {
      setInventarisData(newData);
      onDataChange?.(newData);
    },
    [onDataChange]
  );

  // Handler untuk create inventaris dengan loading state
  const handleCreateInventaris = React.useCallback(
    async (data: any, file?: File): Promise<InventarisData> => {
      if (!onCreateInventaris) {
        throw new Error("onCreateInventaris handler not provided");
      }
      
      setIsLoading(true);
      try {
        const newInventaris = await onCreateInventaris(data, file);
        const updatedData = [...inventarisData, newInventaris].map(
          (item, index) => ({
            ...item,
            no: index + 1,
          })
        );
        handleDataChange(updatedData);
        return newInventaris;
      } catch (error) {
        console.error("Error creating inventaris:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [inventarisData, onCreateInventaris, handleDataChange]
  );

  // Handler untuk update inventaris dengan loading state
  const handleUpdateInventaris = React.useCallback(
    async (id: number, data: any, file?: File): Promise<InventarisData> => {
      if (!onUpdateInventaris) {
        throw new Error("onUpdateInventaris handler not provided");
      }
      
      setIsLoading(true);
      try {
        const updatedInventaris = await onUpdateInventaris(id, data, file);
        const updatedData = inventarisData.map((item) =>
          item.id === id ? updatedInventaris : item
        );
        handleDataChange(updatedData);
        return updatedInventaris;
      } catch (error) {
        console.error("Error updating inventaris:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [inventarisData, onUpdateInventaris, handleDataChange]
  );

  // Handler untuk delete inventaris dengan loading state
  const handleDeleteInventaris = React.useCallback(
    async (id: number): Promise<boolean> => {
      if (!onDeleteInventaris) {
        throw new Error("onDeleteInventaris handler not provided");
      }
      
      setIsLoading(true);
      try {
        const success = await onDeleteInventaris(id);
        if (success) {
          const filteredData = inventarisData.filter((item) => item.id !== id);
          const reindexedData = filteredData.map((item, index) => ({
            ...item,
            no: index + 1,
          }));
          handleDataChange(reindexedData);
        }
        return success;
      } catch (error) {
        console.error("Error deleting inventaris:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [inventarisData, onDeleteInventaris, handleDataChange]
  );

  // Handler untuk inventaris yang ditambahkan melalui TableViewTabs
  const handleInventarisAdded = React.useCallback(
    (newData: InventarisData) => {
      const updatedData = [...inventarisData, newData].map((item, index) => ({
        ...item,
        no: index + 1,
      }));
      handleDataChange(updatedData);
    },
    [inventarisData, handleDataChange]
  );

  // Function untuk mendapatkan placeholder berdasarkan tab aktif
  const getPlaceholder = React.useCallback(() => {
    switch (activeTab) {
      case "daftar-inventaris":
        return "Cari inventaris...";
      case "galeri-inventaris":
        return "Cari galeri inventaris...";
      default:
        return "Cari...";
    }
  }, [activeTab]);

  // Setup table dengan react-table
  const table = useReactTable({
    data: inventarisData,
    columns: [], // Columns akan didefinisikan di komponen child sesuai kebutuhan
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Loading state UI - dipindahkan dari InventarisClientComponent
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <span className="ml-2">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex-col justify-start gap-6">
      <Tabs defaultValue="daftar-inventaris" onValueChange={setActiveTab}>
        <TableViewTabs
          onInventarisAdded={handleInventarisAdded}
          onCreateInventaris={handleCreateInventaris}
        />
        <TableToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder={getPlaceholder()}
          year={year}
          setYear={setYear}
          availableYears={yearStrings}
          table={table}
        />
        <DataTableTabsContent
          inventarisData={inventarisData}
          searchQuery={searchQuery}
          year={year}
          onDataChange={handleDataChange}
          onUpdateInventaris={handleUpdateInventaris}
          onDeleteInventaris={handleDeleteInventaris}
        />
      </Tabs>
    </div>
  );
}
