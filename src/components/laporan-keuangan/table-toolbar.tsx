"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconDownload,
  IconFileSpreadsheet,
  IconPrinter,
  IconFileTypePdf,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { 
  exportLaporanKeuanganToExcel, 
  exportRekapPemasukanToExcel, 
  exportRekapPengeluaranToExcel 
} from "@/lib/excel";
import { exportLaporanKeuanganToPDF } from "@/components/pdf-export/laporan-keuangan-pdf";
import { type RekapPemasukan, type RekapPengeluaran } from "@/lib/schema/laporan/schema";

interface TableToolbarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  placeholder?: string;
  year: string;
  setYear: (value: string) => void;
  availableYears: string[];
  pemasukanData?: RekapPemasukan[];
  pengeluaranData?: RekapPengeluaran[];
  activeTab?: string;
}

export function TableToolbar({
  searchQuery,
  setSearchQuery,
  placeholder = "Cari rekap keuangan...",
  year,
  setYear,
  availableYears,
  pemasukanData = [],
  pengeluaranData = [],
  activeTab = "rekap-tahunan",
}: TableToolbarProps) {
  
  const handleExportExcel = async () => {
    try {
      // Validate data before export
      if (activeTab === "rekap-tahunan") {
        // If both datasets are empty, block export
        if ((!pemasukanData || pemasukanData.length === 0) && (!pengeluaranData || pengeluaranData.length === 0)) {
          toast.error("Tidak ada data pemasukan/pengeluaran untuk diekspor");
          return;
        }
        // If only one dataset is empty, proceed with info
        if (!pemasukanData || pemasukanData.length === 0) {
          toast.info("Tidak ada data pemasukan; mengekspor pengeluaran dan ringkasan.");
        }
        if (!pengeluaranData || pengeluaranData.length === 0) {
          toast.info("Tidak ada data pengeluaran; mengekspor pemasukan dan ringkasan.");
        }
        
        console.log("Exporting laporan keuangan with data:", {
          pemasukanCount: pemasukanData.length,
          pengeluaranCount: pengeluaranData.length,
          year,
          pemasukanSample: pemasukanData[0],
          pengeluaranSample: pengeluaranData[0]
        });
        
        // Show loading toast
        const loadingToast = toast.loading("Membuat Excel laporan keuangan...");
        
        // Export combined laporan keuangan
        console.log("Calling exportLaporanKeuanganToExcel...");
        await exportLaporanKeuanganToExcel(
          pemasukanData,
          pengeluaranData,
          year
        );
        console.log("Export function completed successfully");
        
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        // Show success notification
        toast.success("Laporan keuangan berhasil diekspor ke Excel", {
          description: `Data tahun ${year} telah diekspor`
        });
        
      } else if (activeTab === "laporan-jumat") {
        // Friday report export is handled within the form itself
        toast.info("Export Laporan Jumat", {
          description: "Gunakan tombol Export di dalam form Laporan Jumat untuk mengekspor data"
        });
      }
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error(`Gagal mengekspor ke Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleExportPDF = async () => {
    try {
      // Validate data before export
      if (activeTab === "rekap-tahunan") {
        // If both datasets are empty, block export
        if ((!pemasukanData || pemasukanData.length === 0) && (!pengeluaranData || pengeluaranData.length === 0)) {
          toast.error("Tidak ada data pemasukan/pengeluaran untuk diekspor");
          return;
        }
        // If only one dataset is empty, proceed with info
        if (!pemasukanData || pemasukanData.length === 0) {
          toast.info("Tidak ada data pemasukan; mengekspor pengeluaran dan ringkasan.");
        }
        if (!pengeluaranData || pengeluaranData.length === 0) {
          toast.info("Tidak ada data pengeluaran; mengekspor pemasukan dan ringkasan.");
        }
        
        console.log("Exporting laporan keuangan to PDF with data:", {
          pemasukanCount: pemasukanData.length,
          pengeluaranCount: pengeluaranData.length,
          year,
        });
        
        // Show loading toast
        const loadingToast = toast.loading("Membuat PDF laporan keuangan...");
        
        // Export to PDF
        const result = await exportLaporanKeuanganToPDF(
          pemasukanData,
          pengeluaranData,
          year
        );
        
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        // Show success notification
        toast.success("Laporan keuangan berhasil diekspor ke PDF", {
          description: `File ${result.fileName} telah diunduh`
        });
        
      } else if (activeTab === "laporan-jumat") {
        // Friday report export is handled within the form itself
        toast.info("Export Laporan Jumat", {
          description: "Gunakan tombol Export di dalam form Laporan Jumat untuk mengekspor data"
        });
      }
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error(`Gagal mengekspor ke PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <Label htmlFor="search" className="sr-only">
              Cari
            </Label>
            <Input
              id="search"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-8 w-[150px] lg:w-[250px]"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div>
            <Label htmlFor="year" className="sr-only">
              Tahun
            </Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="h-8 w-[100px]">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((yearOption) => (
                  <SelectItem key={yearOption} value={yearOption}>
                    {yearOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <IconDownload className="h-4 w-4" />
                <span className="ml-2">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel}>
                <IconFileSpreadsheet className="h-4 w-4 mr-2" />
                Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <IconFileTypePdf className="h-4 w-4 mr-2" />
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconPrinter className="h-4 w-4 mr-2" />
                Print Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

