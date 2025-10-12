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
  IconLayoutColumns,
  IconDownload,
  IconFileSpreadsheet,
  IconPrinter,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DonaturData, KotakAmalData, DonasiKhususData, KotakAmalMasjidData, KotakAmalJumatData } from "./schema";
import AddDonation from "../add-donation";
import { exportToExcel, exportIntegratedDataToExcel } from "@/lib/excel";
import { exportPemasukanTabsToPDF } from "@/components/pdf-export/pemasukan-pdf";
import { integrateData } from "@/lib/services/supabase/data-integration";
import { exportToCSV, exportIntegratedDataToCSV } from "@/lib/csv";
import { toast } from "sonner"; 

interface TableViewTabsProps {
  table?: Table<any>;
  isLoading?: boolean;
  activeTab?: string;
  donaturData?: DonaturData[];
  kotakAmalData?: KotakAmalData[];
  donasiKhususData?: DonasiKhususData[];
  kotakAmalMasjidData?: KotakAmalMasjidData[];
  kotakAmalJumatData?: KotakAmalJumatData[];
  searchQuery?: string;
  year?: string;
}

export function TableViewTabs({ 
  table, 
  isLoading = false, 
  activeTab = "riwayat-tahunan",
  donaturData = [],
  kotakAmalData = [],
  donasiKhususData = [],
  kotakAmalMasjidData = [],
  kotakAmalJumatData = [],
  searchQuery = "",
  year = "2025"
}: TableViewTabsProps) {
  // State untuk melacak apakah tabel sudah siap
  const [isTableReady, setIsTableReady] = React.useState<boolean>(false);
  // State untuk ukuran kertas PDF
  const [paper, setPaper] = React.useState<'a4' | 'f4'>('a4');
  // State untuk cakupan data PDF: hanya donatur atau semua sumber
  const [pdfScope, setPdfScope] = React.useState<'donatur' | 'semua'>('donatur');

  // Effect untuk memeriksa status tabel
  React.useEffect(() => {
    // Cek apakah ada data berdasarkan tab aktif
    let hasData = false;
    
    switch (activeTab) {
      case "riwayat-tahunan":
        hasData = donaturData.length > 0;
        break;
      case "donasi-khusus":
        hasData = donasiKhususData.length > 0;
        break;
      case "kotak-amal":
        hasData = kotakAmalData.length > 0;
        break;
      case "kotak-amal-masjid":
        hasData = kotakAmalMasjidData.length > 0;
        break;
      case "kotak-amal-jumat":
        hasData = kotakAmalJumatData.length > 0;
        break;
      default:
        hasData = table !== undefined && table.getRowModel().rows.length > 0;
    }
    
    setIsTableReady(hasData);
    
    console.log("Table status:", {
      activeTab,
      hasData,
      donaturCount: donaturData.length,
      kotakAmalCount: kotakAmalData.length,
      donasiKhususCount: donasiKhususData.length,
      kotakAmalMasjidCount: kotakAmalMasjidData.length,
      kotakAmalJumatCount: kotakAmalJumatData.length
    });
  }, [table, activeTab, donaturData, kotakAmalData, donasiKhususData, kotakAmalMasjidData, kotakAmalJumatData]);

  // Filter data berdasarkan search query dan year
  const getFilteredData = () => {
    const yearNum = parseInt(year);
    
    switch (activeTab) {
      case "riwayat-tahunan":
        return donaturData.filter(item => {
          const matchesYear = item.tahun === yearNum;
          const matchesSearch = searchQuery === "" || 
            item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.alamat.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesYear && matchesSearch;
        });
        
      case "donasi-khusus":
        return donasiKhususData.filter(item => {
          const matchesYear = item.tahun === yearNum;
          const matchesSearch = searchQuery === "" || 
            item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.keterangan.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesYear && matchesSearch;
        });
        
      case "kotak-amal":
        return kotakAmalData.filter(item => {
          const matchesYear = item.tahun === yearNum;
          const matchesSearch = searchQuery === "" || 
            item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.lokasi.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesYear && matchesSearch;
        });
        
      case "kotak-amal-masjid":
        return kotakAmalMasjidData.filter(item => {
          const matchesYear = item.tahun === yearNum;
          const matchesSearch = searchQuery === "" || 
            item.jumlah.toString().includes(searchQuery);
          return matchesYear && matchesSearch;
        });
        
      case "kotak-amal-jumat":
        return kotakAmalJumatData.filter(item => {
          const matchesYear = item.tahun === yearNum;
          const matchesSearch = searchQuery === "" || 
            item.jumlah.toString().includes(searchQuery);
          return matchesYear && matchesSearch;
        });
        
      default:
        return [];
    }
  };

  const handleExport = (type: 'excel' | 'csv' | 'pdf') => {
    try {
      // Get filtered data based on current tab
      const filteredData = getFilteredData();
      
      // Check if we have data to export
      if (!filteredData || filteredData.length === 0) {
        console.error("Tidak ada data untuk diekspor");
        showNotification("Tidak ada data yang tersedia untuk diekspor");
        return;
      }
      
      console.log(`Mengekspor ${filteredData.length} baris data ${activeTab} ke ${type}`);
      
      // Generate filename based on tab and year
      const tabNames = {
        "riwayat-tahunan": "riwayat-tahunan",
        "donasi-khusus": "donasi-khusus", 
        "kotak-amal": "kotak-amal",
        "kotak-amal-masjid": "kotak-amal-masjid",
        "kotak-amal-jumat": "kotak-amal-jumat"
      };
      
      const filenameBase = `${tabNames[activeTab as keyof typeof tabNames]}-${year}`;
      
      // Export based on selected type and tab
      if (type === 'excel') {
        if (activeTab === "riwayat-tahunan") {
          exportToExcel(filteredData as DonaturData[], `${filenameBase}.xlsx`);
        } else {
          // For other tabs, use integrated export function
          exportIntegratedDataToExcel(filteredData, `${filenameBase}.xlsx`);
        }
      } else if (type === 'csv') {
        if (activeTab === "riwayat-tahunan") {
          exportToCSV(filteredData as DonaturData[], `${filenameBase}.csv`);
        } else {
          exportIntegratedDataToCSV(filteredData, `${filenameBase}.csv`);
        }
      } else if (type === 'pdf') {
        // Gunakan tipe lebih longgar agar IntegratedData[] dapat ditetapkan
        let dataForPdf: any[] = filteredData as any[];
        if (activeTab === "riwayat-tahunan") {
          if (pdfScope === 'semua') {
            const yearNum = parseInt(year);
            const dFiltered = donaturData.filter((d) => d.tahun === yearNum);
            const kaFiltered = kotakAmalData.filter((k) => k.tahun === yearNum);
            // donasi khusus mungkin punya field tahun atau tanggal
            const dkFiltered = donasiKhususData.filter((dk) => {
              if (typeof dk.tahun === 'number') return dk.tahun === yearNum;
              const dt = dk.tanggal instanceof Date ? dk.tanggal : new Date(dk.tanggal);
              return !isNaN(dt.getTime()) && dt.getFullYear() === yearNum;
            });
            const kamFiltered = kotakAmalMasjidData.filter((km) => km.tahun === yearNum);
            const kajFiltered = kotakAmalJumatData.filter((kj) => kj.tahun === yearNum);
            dataForPdf = integrateData(
              dFiltered,
              kaFiltered,
              dkFiltered,
              kamFiltered,
              kajFiltered,
              year
            ) as any[];
          }
        }
        exportPemasukanTabsToPDF(dataForPdf, activeTab as any, year, paper);
      }
      
      // Show success notification
      toast.success(`Data berhasil diekspor (${filenameBase})`, {
        description: `${filteredData.length} baris data telah diekspor`
      });
      
    } catch (error) {
      console.error("Error saat mengekspor data:", error);
      showNotification("Terjadi kesalahan saat mengekspor data. Silakan coba lagi.");
    }
  };

  // Helper function untuk menampilkan notifikasi
  const showNotification = (message: string) => {
    if (typeof toast !== 'undefined') {
      toast.error(message, {
        description: "Export notification"
      });
    } else {
      alert(message);
    }
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
            <SelectItem value="donasi-khusus">Donasi Khusus</SelectItem>
            <SelectItem value="kotak-amal">Kotak Amal</SelectItem>
            <SelectItem value="kotak-amal-masjid">Kotak Amal Masjid</SelectItem>
          </SelectContent>
        </Select>

        {/* Desktop Tabs */}
        <TabsList className="hidden @4xl/main:flex">
          <TabsTrigger
            value="riwayat-tahunan"
            title="Daftar lengkap donatur beserta riwayat donasi tahunan"
          >
            Riwayat Tahunan
          </TabsTrigger>
          <TabsTrigger
            value="donasi-khusus"
            title="Catatan donasi khusus yang masuk bulan ini"
          >
            Donasi Khusus
          </TabsTrigger>
          <TabsTrigger
            value="kotak-amal"
            title="Catatan pemasukan dari kotak amal luar kompleks"
          >
            Kotak Amal
          </TabsTrigger>
          <TabsTrigger
            value="kotak-amal-masjid"
            title="Catatan pemasukan dari kotak amal masjid"
          >
            Kotak Amal Masjid
          </TabsTrigger>
          <TabsTrigger
            value="kotak-amal-jumat"
            title="Catatan pemasukan dari kotak amal jumat"
          >
            Kotak Amal Jumat
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="lg" disabled={isLoading || !isTableReady}>
              <IconDownload className="size-4 mr-1" />
              <span>Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <Label className="text-xs">Ukuran Kertas PDF</Label>
              <Select value={paper} onValueChange={(v) => setPaper(v as 'a4' | 'f4')}>
                <SelectTrigger size="sm" className="mt-1">
                  <SelectValue placeholder="A4" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4 (210 x 297 mm)</SelectItem>
                  <SelectItem value="f4">F4/Folio (210 x 330 mm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="px-3 py-2">
              <Label className="text-xs">Cakupan Data PDF</Label>
              <Select value={pdfScope} onValueChange={(v) => setPdfScope(v as 'donatur' | 'semua')}>
                <SelectTrigger size="sm" className="mt-1">
                  <SelectValue placeholder="Donatur saja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="donatur">Donatur saja</SelectItem>
                  <SelectItem value="semua">Semua sumber (Donatur + Kotak Amal + Donasi Khusus)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              <IconFileSpreadsheet className="mr-2 size-4" />
              <span>Excel (.xlsx)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <IconFileSpreadsheet className="mr-2 size-4" />
              <span>CSV (.csv)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              <IconPrinter className="mr-2 size-4" />
              <span>PDF (Landscape)</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconPrinter className="mr-2 size-4" />
              <span>Print</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {table && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns className="size-4 mr-1" />
                <span>Kolom</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id === "aug"
                      ? "Agust"
                      : column.id === "sep"
                      ? "Sept"
                      : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <AddDonation />
      </div>
    </div>
  );
}