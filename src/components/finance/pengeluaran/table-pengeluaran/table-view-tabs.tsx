"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  IconDownload,
  IconFileSpreadsheet,
  IconPrinter,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PengeluaranData, PengeluaranTahunanData } from "@/lib/schema/pengeluaran/schema";
import { exportPengeluaranToExcel, exportPengeluaranTahunanToExcel } from "@/lib/excel";
import { exportPengeluaranToCSV, exportPengeluaranTahunanToCSV } from "@/lib/csv";
import { toast } from "sonner";
import AddDonation from "../add-donation";
import { exportPengeluaranTabsToPDF } from "@/components/pdf-export/pengeluaran-pdf";

interface TableViewTabsProps {
  table?: Table<PengeluaranData | PengeluaranTahunanData> | null;
  activeTab?: string;
  year?: string;
  pengeluaranData?: PengeluaranData[];
  pengeluaranTahunanData?: PengeluaranTahunanData[];
  searchQuery?: string;
}

export function TableViewTabs({ 
  table, 
  activeTab = "riwayat-tahunan", 
  year = "2025",
  pengeluaranData = [],
  pengeluaranTahunanData = [],
  searchQuery = ""
}: TableViewTabsProps) {
  const [paper, setPaper] = React.useState<'a4'|'f4'>('a4');
  
  // Filter data berdasarkan search query dan year
  const getFilteredData = () => {
    const yearNum = parseInt(year);
    
    switch (activeTab) {
      case "riwayat-tahunan":
        return pengeluaranTahunanData.filter(item => {
          const matchesSearch = searchQuery === "" || 
            item.pengeluaran.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesSearch;
        });
        
      case "pengeluaran-bulanan":
        return pengeluaranData.filter(item => {
          const matchesYear = item.tahun === yearNum;
          const matchesSearch = searchQuery === "" || 
            item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.keterangan && item.keterangan.toLowerCase().includes(searchQuery.toLowerCase()));
          return matchesYear && matchesSearch;
        });
        
      default:
        return [];
    }
  };

  // Handle Excel export
  const handleExcelExport = () => {
    try {
      const filteredData = getFilteredData();
      
      if (!filteredData || filteredData.length === 0) {
        toast.error("Tidak ada data untuk diekspor");
        return;
      }
      
      console.log(`Mengekspor ${filteredData.length} baris data ${activeTab} ke Excel`);
      
      // Generate filename based on tab and year
      const tabNames = {
        "riwayat-tahunan": "riwayat-tahunan",
        "pengeluaran-bulanan": "pengeluaran-bulanan"
      };
      
      const filename = `pengeluaran-${tabNames[activeTab as keyof typeof tabNames]}-${year}.xlsx`;
      
      // Export based on active tab
      if (activeTab === "riwayat-tahunan") {
        exportPengeluaranTahunanToExcel(filteredData as PengeluaranTahunanData[], filename);
      } else {
        exportPengeluaranToExcel(filteredData as PengeluaranData[], filename);
      }
      
      // Show success notification
      toast.success(`Data berhasil diekspor ke ${filename}`, {
        description: `${filteredData.length} baris data telah diekspor`
      });
      
    } catch (error) {
      console.error("Error saat mengekspor data:", error);
      toast.error("Terjadi kesalahan saat mengekspor data. Silakan coba lagi.");
    }
  };

  // Handle CSV export
  const handleCSVExport = () => {
    try {
      const filteredData = getFilteredData();
      
      if (!filteredData || filteredData.length === 0) {
        toast.error("Tidak ada data untuk diekspor");
        return;
      }
      
      console.log(`Mengekspor ${filteredData.length} baris data ${activeTab} ke CSV`);
      
      // Generate filename based on tab and year
      const tabNames = {
        "riwayat-tahunan": "riwayat-tahunan",
        "pengeluaran-bulanan": "pengeluaran-bulanan"
      };
      
      const filename = `pengeluaran-${tabNames[activeTab as keyof typeof tabNames]}-${year}.csv`;
      
      // Export based on active tab
      if (activeTab === "riwayat-tahunan") {
        exportPengeluaranTahunanToCSV(filteredData as PengeluaranTahunanData[], filename);
      } else {
        exportPengeluaranToCSV(filteredData as PengeluaranData[], filename);
      }
      
      // Show success notification
      toast.success(`Data berhasil diekspor ke ${filename}`, {
        description: `${filteredData.length} baris data telah diekspor`
      });
      
    } catch (error) {
      console.error("Error saat mengekspor data:", error);
      toast.error("Terjadi kesalahan saat mengekspor data. Silakan coba lagi.");
    }
  };

  // Handle PDF export
  const handlePDFExport = async () => {
    try {
      const filteredData = getFilteredData();
      if (!filteredData || filteredData.length === 0) {
        toast.error("Tidak ada data untuk diekspor");
        return;
      }
      await exportPengeluaranTabsToPDF(filteredData as any[], activeTab as any, year, paper);
      toast.success("PDF berhasil dibuat");
    } catch (error) {
      console.error("Error saat mengekspor PDF:", error);
      toast.error("Terjadi kesalahan saat mengekspor PDF");
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Label htmlFor="view-selector" className="sr-only">
          Jenis Tampilan
        </Label>
        {/* Mobile Select Menu */}
        <Select defaultValue="riwayat-tahunan">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Pilih tampilan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="riwayat-tahunan">Riwayat Tahunan</SelectItem>
            <SelectItem value="pengeluaran-bulanan">Pengeluaran Bulanan</SelectItem>
          </SelectContent>
        </Select>

        {/* Desktop Tabs */}
        <TabsList className="hidden @4xl/main:flex">
          <TabsTrigger
            value="riwayat-tahunan"
            title="Daftar lengkap pengeluaran beserta riwayat tahunan"
          >
            Riwayat Tahunan
          </TabsTrigger>
          <TabsTrigger
            value="pengeluaran-bulanan"
            title="Catatan pengeluaran bulanan"
          >
            Pengeluaran Bulanan
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <IconDownload className="size-4 mr-1" />
              <span>Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <div className="px-2 py-1 text-xs text-muted-foreground">Ukuran Kertas</div>
            <DropdownMenuItem onClick={() => setPaper('a4')}>A4</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPaper('f4')}>F4 (Folio)</DropdownMenuItem>
            <div className="px-2 py-1 text-xs text-muted-foreground">Ekspor</div>
            <DropdownMenuItem onClick={handleExcelExport}>
              <IconFileSpreadsheet className="mr-2 size-4" />
              <span>Excel (.xlsx)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCSVExport}>
              <IconFileSpreadsheet className="mr-2 size-4" />
              <span>CSV (.csv)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePDFExport}>
              <IconPrinter className="mr-2 size-4" />
              <span>PDF (.pdf)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrint}>
              <IconPrinter className="mr-2 size-4" />
              <span>Print</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <AddDonation />
      </div>
    </div>
  );
}
