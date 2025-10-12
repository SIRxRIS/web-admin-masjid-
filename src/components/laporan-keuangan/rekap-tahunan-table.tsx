// src/components/laporan-keuangan/rekap-tahunan-table.tsx
"use client";

import * as React from "react";
import { type RekapPemasukan, type RekapPengeluaran } from "@/lib/schema/laporan/schema";;
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEventDrivenSync } from "@/hooks/useEventDrivenSync";
import { usePemasukanRealtime, usePengeluaranRealtime } from "@/hooks/useSupabaseRealtime";
import { TableRekapTahunan } from "./table/rekap-tahunan/table-rekap";

interface RekapTahunanTableProps {
  pemasukanData: RekapPemasukan[];
  pengeluaranData: RekapPengeluaran[];
  availableYears: string[];
  currentYear: string;
  onGetRekapData: (year: number) => Promise<{
    pemasukanData: RekapPemasukan[];
    pengeluaranData: RekapPengeluaran[];
  }>;
}

export function RekapTahunanTable({
  pemasukanData: initialPemasukanData,
  pengeluaranData: initialPengeluaranData,
  availableYears,
  currentYear,
  onGetRekapData,
}: RekapTahunanTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [year, setYear] = React.useState<string>(currentYear);
  const [localPemasukanData, setLocalPemasukanData] =
    React.useState<RekapPemasukan[]>(initialPemasukanData);
  const [localPengeluaranData, setLocalPengeluaranData] = React.useState<
    RekapPengeluaran[]
  >(initialPengeluaranData);
  const [isLoading, setIsLoading] = React.useState(false);

  // Event-Driven sync logic
  const handleEventDrivenSync = React.useCallback(async () => {
    try {
      const data = await onGetRekapData(parseInt(year));
      setLocalPemasukanData(data.pemasukanData);
      setLocalPengeluaranData(data.pengeluaranData);
    } catch (error) {
      console.error("Error syncing data:", error);
      toast.error("Gagal menyinkronkan data");
    }
  }, [onGetRekapData, year]);

  // Use event-driven sync hook
  useEventDrivenSync({
    onDataChange: handleEventDrivenSync,
    enableAutoSync: false,
  });

  // Realtime hooks
  usePemasukanRealtime(handleEventDrivenSync);
  usePengeluaranRealtime(handleEventDrivenSync);

  // Handle year change
  const handleYearChange = React.useCallback(
    async (newYear: string) => {
      setIsLoading(true);
      setYear(newYear);

      try {
        const data = await onGetRekapData(parseInt(newYear));
        setLocalPemasukanData(data.pemasukanData);
        setLocalPengeluaranData(data.pengeluaranData);

        // Update URL
        const params = new URLSearchParams(searchParams.toString());
        params.set("year", newYear);
        router.push(`?${params.toString()}`);

        toast.success(`Data rekap tahun ${newYear} berhasil dimuat`);
      } catch (error) {
        console.error("Error loading data for year:", newYear, error);
        toast.error(`Gagal memuat data untuk tahun ${newYear}`);
      } finally {
        setIsLoading(false);
      }
    },
    [onGetRekapData, router, searchParams]
  );

  // Sync year with URL params
  React.useEffect(() => {
    const urlYear = searchParams.get("year");
    if (urlYear && urlYear !== year) {
      setYear(urlYear);
    }
  }, [searchParams, year]);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Memuat data...</span>
        </div>
      ) : (
        <TableRekapTahunan
          pemasukanData={localPemasukanData}
          pengeluaranData={localPengeluaranData}
          tahun={parseInt(year)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          availableYears={availableYears}
          setYear={handleYearChange}
        />
      )}
    </div>
  );
}