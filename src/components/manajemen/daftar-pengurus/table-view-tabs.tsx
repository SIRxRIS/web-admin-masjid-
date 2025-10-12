// src/components/manajemen/daftar-pengurus/table-view-tabs.tsx
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Table } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PengurusData } from "@/lib/schema/pengurus/schema";
import AddPengurus from "@/components/manajemen/tambah-pengurus/add-pengurus";

interface TableViewTabsProps {
  table?: Table<PengurusData>;
  isLoading?: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  placeholder?: string;
  year: string;
  setYear: (value: string) => void;
  kategori: string;
  setKategori: (value: string) => void;
  fetchYears: () => Promise<number[]>;
  onAddClick?: () => void; 
}

export function TableViewTabs({ 
  table, 
  isLoading = false,
  searchQuery,
  setSearchQuery,
  placeholder = "Cari nama pengurus atau jabatan...",
  year,
  setYear,
  kategori,
  setKategori,
  fetchYears,
  onAddClick, 
}: TableViewTabsProps) {
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [isYearLoading, setIsYearLoading] = useState<boolean>(true);

  useEffect(() => {
    const getYears = async () => {
      try {
        setIsYearLoading(true);
        const yearsData = await fetchYears();

        if (Array.isArray(yearsData) && yearsData.length > 0) {
          const sortedYears = [...yearsData].sort((a, b) => b - a);
          const yearsString = sortedYears.map((year) => year.toString());
          setAvailableYears(yearsString);

          if (!year || !yearsString.includes(year)) {
            setYear(yearsString[0]);
          }
        } else {
          const currentYear = new Date().getFullYear().toString();
          setAvailableYears([currentYear]);
          setYear(currentYear);
          console.warn(
            "Tidak ada data tahun yang tersedia, menggunakan tahun saat ini"
          );
        }
      } catch (error) {
        console.error("Error mengambil tahun:", error);
        const currentYear = new Date().getFullYear().toString();
        setAvailableYears([currentYear]);
        setYear(currentYear);
      } finally {
        setIsYearLoading(false);
      }
    };

    getYears();
  }, [fetchYears, setYear, year]);

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* Search - Kiri */}
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">
            Cari
          </Label>
          <Input
            id="search"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 max-w-[320px]"
          />
        </div>

        {/* Kategori, Tahun dan Tambah - Kanan */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="kategori" className="text-sm whitespace-nowrap">
              Kategori:
            </Label>
            <Select
              value={kategori}
              onValueChange={setKategori}
            >
              <SelectTrigger id="kategori" className="w-36 h-9">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua</SelectItem>
                <SelectItem value="MASJID">Pengurus Masjid</SelectItem>
                <SelectItem value="REMAS">Pengurus Remas</SelectItem>
                <SelectItem value="MAJLIS_TALIM">Pengurus Majlis Ta'lim</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="tahun" className="text-sm whitespace-nowrap">
              Tahun:
            </Label>
            <Select
              value={year}
              onValueChange={setYear}
              disabled={isYearLoading || availableYears.length === 0}
            >
              <SelectTrigger id="tahun" className="w-24 h-9">
                <SelectValue placeholder={isYearLoading ? "Memuat..." : "Tahun"} />
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
          <AddPengurus 
            onSuccess={onAddClick}
          />
        </div>
      </div>
    </div>
  );
}