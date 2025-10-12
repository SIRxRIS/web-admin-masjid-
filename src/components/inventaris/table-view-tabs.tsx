// src/components/admin/layout/inventaris/table-view-tabs.tsx
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
import AddInventaris from "./add-inventaris";
import { type InventarisData } from "@/lib/schema/inventaris/schema";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { IconDownload } from "@tabler/icons-react";
import { exportInventarisToPDF } from "@/components/pdf-export/inventaris-pdf";

interface TableViewTabsProps {
  table?: Table<InventarisData>;
  onInventarisAdded?: (newData: InventarisData) => void;
  onCreateInventaris?: (data: any, file?: File) => Promise<InventarisData>;
}

export function TableViewTabs({
  table,
  onInventarisAdded,
  onCreateInventaris,
}: TableViewTabsProps) {
  const [paper, setPaper] = React.useState<'a4' | 'f4'>('a4');
  const [year] = React.useState<string>(String(new Date().getFullYear()));

  const inventarisData: InventarisData[] = (table?.getFilteredRowModel().rows || []).map((r: any) => r.original);

  const handleExportPdf = async () => {
    try {
      await exportInventarisToPDF(inventarisData, year, paper);
    } catch (e) {
      console.error('Gagal ekspor PDF inventaris:', e);
    }
  };
  return (
    <div className="flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Label htmlFor="view-selector" className="sr-only">
          Jenis Tampilan
        </Label>
        {/* Mobile Select Menu */}
        <Select defaultValue="daftar-inventaris">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Pilih tampilan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daftar-inventaris">Daftar Inventaris</SelectItem>
            <SelectItem value="galeri-inventaris">Galeri Inventaris</SelectItem>
          </SelectContent>
        </Select>

        {/* Desktop Tabs */}
        <TabsList className="hidden @4xl/main:flex">
          <TabsTrigger
            value="daftar-inventaris"
            title="Daftar lengkap inventaris masjid beserta detailnya"
          >
            Daftar Inventaris
          </TabsTrigger>
          <TabsTrigger
            value="galeri-inventaris"
            title="Kumpulan foto inventaris masjid"
          >
            Galeri Inventaris
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
            <div className="px-2 py-1 text-xs text-muted-foreground">Aksi</div>
            <DropdownMenuItem onClick={handleExportPdf}>PDF (.pdf)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <AddInventaris
          onInventarisAdded={onInventarisAdded}
          onCreate={onCreateInventaris}
        />
      </div>
    </div>
  );
}
