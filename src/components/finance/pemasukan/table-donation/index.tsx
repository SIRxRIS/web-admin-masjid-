// src/components/admin/layout/finance/pemasukan/table-donation/index.tsx
"use client";

import * as React from "react";
import {
  type DonaturData,
  type KotakAmalData,
  type DonasiKhususData,
  type KotakAmalMasjidData,
  type KotakAmalJumatData,
} from "./schema";
import { TableViewTabs } from "./table-view-tabs";
import { Tabs } from "@/components/ui/tabs";
import { DataTableTabsContent } from "./data-table-tabs-content";
import { TableToolbar } from "./table-toolbar";

// Types
interface AvailableYears {
  donatur: number[];
  donasiKhusus: number[];
  kotakAmal: number[];
  kotakAmalMasjid: number[];
  kotakAmalJumat: number[];
  riwayatTahunan: number[];
}

interface DataTableProps {
  data: DonaturData[];
  kotakAmalData: KotakAmalData[];
  donasiKhususData: DonasiKhususData[];
  kotakAmalMasjidData: KotakAmalMasjidData[];
  kotakAmalJumatData: KotakAmalJumatData[];
  availableYears: AvailableYears;
}

type TabType =
  | "riwayat-tahunan"
  | "donasi-khusus"
  | "kotak-amal"
  | "kotak-amal-masjid"
  | "kotak-amal-jumat";

// Constants
const DEFAULT_YEAR = "2025";
const DEFAULT_TAB: TabType = "riwayat-tahunan";

const TAB_PLACEHOLDERS: Record<TabType, string> = {
  "riwayat-tahunan": "Cari nama atau alamat donatur...",
  "kotak-amal": "Cari nama atau lokasi kotak amal...",
  "donasi-khusus": "Cari nama donatur atau keterangan...",
  "kotak-amal-masjid": "Cari tanggal atau jumlah kotak amal masjid...",
  "kotak-amal-jumat": "Cari tanggal atau jumlah kotak amal jumat...",
};

// Custom Hooks
const useDataTable = (availableYears: AvailableYears) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [year, setYear] = React.useState(DEFAULT_YEAR);
  const [activeTab, setActiveTab] = React.useState<TabType>(DEFAULT_TAB);

  // Get available years for current tab
  const getAvailableYearsForTab = React.useCallback((): number[] => {
    const yearMap: Record<TabType, number[]> = {
      "riwayat-tahunan": availableYears.riwayatTahunan,
      "donasi-khusus": availableYears.donasiKhusus,
      "kotak-amal": availableYears.kotakAmal,
      "kotak-amal-masjid": availableYears.kotakAmalMasjid,
      "kotak-amal-jumat": availableYears.kotakAmalJumat,
    };

    return yearMap[activeTab] || availableYears.riwayatTahunan;
  }, [activeTab, availableYears]);

  // Create fetch years function
  const getFetchYearsFunction = React.useCallback(() => {
    return async (): Promise<number[]> => getAvailableYearsForTab();
  }, [getAvailableYearsForTab]);

  // Get placeholder text for current tab
  const getPlaceholder = React.useCallback((): string => {
    return TAB_PLACEHOLDERS[activeTab] || "Cari...";
  }, [activeTab]);

  // Reset search query when tab changes
  React.useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  // Update year when tab changes if current year is not available
  React.useEffect(() => {
    const availableYearsForTab = getAvailableYearsForTab();
    const currentYear = parseInt(year);

    if (!availableYearsForTab.includes(currentYear)) {
      const firstAvailableYear = availableYearsForTab[0];
      setYear(firstAvailableYear?.toString() || DEFAULT_YEAR);
    }
  }, [activeTab, year, getAvailableYearsForTab]);

  return {
    searchQuery,
    setSearchQuery,
    year,
    setYear,
    activeTab,
    setActiveTab: (tab: string) => setActiveTab(tab as TabType),
    getFetchYearsFunction,
    getPlaceholder,
  };
};

// Main Component
export function DataTable({
  data: initialDonaturData,
  kotakAmalData: initialKotakAmalData,
  donasiKhususData: initialDonasiKhususData,
  kotakAmalMasjidData: initialKotakAmalMasjidData,
  kotakAmalJumatData: initialKotakAmalJumatData,
  availableYears,
}: DataTableProps) {
  const {
    searchQuery,
    setSearchQuery,
    year,
    setYear,
    activeTab,
    setActiveTab,
    getFetchYearsFunction,
    getPlaceholder,
  } = useDataTable(availableYears);

  return (
    <div className="w-full flex-col justify-start gap-6">
      <Tabs defaultValue={DEFAULT_TAB} onValueChange={setActiveTab}>
        <TableViewTabs 
          activeTab={activeTab}
          donaturData={initialDonaturData}
          kotakAmalData={initialKotakAmalData}
          donasiKhususData={initialDonasiKhususData}
          kotakAmalMasjidData={initialKotakAmalMasjidData}
          kotakAmalJumatData={initialKotakAmalJumatData}
          searchQuery={searchQuery}
          year={year}
        />
        <TableToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder={getPlaceholder()}
          year={year}
          setYear={setYear}
          fetchYears={getFetchYearsFunction()}
        />
        <DataTableTabsContent
          donaturData={initialDonaturData}
          kotakAmalData={initialKotakAmalData}
          donasiKhususData={initialDonasiKhususData}
          kotakAmalMasjidData={initialKotakAmalMasjidData}
          kotakAmalJumatData={initialKotakAmalJumatData}
          searchQuery={searchQuery}
          year={year}
        />
      </Tabs>
    </div>
  );
}
