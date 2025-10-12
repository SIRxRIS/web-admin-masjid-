// src/components/ecommerce/monthly-target/MonthlyTarget.tsx
"use client";

import { ApexOptions } from "apexcharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreDotIcon } from "@/icons";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { formatRupiah, formatCurrencyShort } from "@/lib/utils";
import EditTargetDialog from "./EditTargetDialog";
import { usePemasukanRealtime, useTargetPemasukanRealtime } from "@/hooks/useSupabaseRealtime";
import ApexChartWrapper from "../../charts/ApexChartWrapper";

interface TargetPemasukanBulananProps {
  targetBulanan?: number;
  targetAmount?: number;
  onEdit?: () => void;
  onDelete?: () => void;
  initialData?: {
    pemasukanBulanan: number;
    pemasukanTahunan: number;
    currentYear: number;
    currentMonth: number;
    monthlyData?: Array<{ bulan: number; jumlah: number }>;
  };
}

export default function TargetPemasukanBulanan({
  targetBulanan = 50000000, 
  targetAmount,
  onEdit,
  onDelete,
  initialData
}: TargetPemasukanBulananProps) {
  // State untuk data pemasukan - gunakan initialData sebagai default
  const [pemasukanBulanan, setPemasukanBulanan] = useState<number>(initialData?.pemasukanBulanan || 0);
  const [pemasukanTahunan, setPemasukanTahunan] = useState<number>(initialData?.pemasukanTahunan || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State untuk target dan edit dialog
  const [currentTarget, setCurrentTarget] = useState<number>(targetAmount || targetBulanan);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // State untuk month/year selection
  const [selectedMonth, setSelectedMonth] = useState<number>(initialData?.currentMonth || new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(initialData?.currentYear || new Date().getFullYear());

  // Available years - simplified
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Tambahan guard & dedupe
  const didFetchYearsRef = useRef(false);
  const lastFetchedTargetRef = useRef<{ year: number; month: number } | null>(null);
  const lastFetchedDataRef = useRef<string | null>(null);

  // PERBAIKAN: Buat stable references untuk useEffect dependencies
  const initialDataStable = useMemo(() => {
    if (!initialData) return null;
    return {
      pemasukanBulanan: initialData.pemasukanBulanan,
      pemasukanTahunan: initialData.pemasukanTahunan,
      currentYear: initialData.currentYear,
      currentMonth: initialData.currentMonth,
      monthlyData: initialData.monthlyData
    };
  }, [
    initialData?.pemasukanBulanan,
    initialData?.pemasukanTahunan,
    initialData?.currentYear,
    initialData?.currentMonth,
    initialData?.monthlyData
  ]);

  // Real-time update untuk bulan/tahun saat ini - hanya trigger refresh data
  const handleRealTimeUpdate = useCallback(() => {
    if (!initialDataStable || selectedYear !== initialDataStable.currentYear || selectedMonth !== initialDataStable.currentMonth) {
      return; // Hanya update untuk bulan/tahun saat ini
    }

    console.log('Pemasukan data changed via realtime, refreshing...');
    // Trigger re-fetch data dengan memanggil fetchData
    fetchData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, initialDataStable]);

  // Handle target update dari realtime - hanya trigger refresh target
  const handleTargetUpdate = useCallback(() => {
    console.log('Target data changed via realtime, refreshing...');
    // Trigger re-fetch target dengan memanggil fetchTarget
    fetchTarget(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Gunakan real-time sync hanya untuk bulan/tahun saat ini
  const isCurrentPeriod = initialDataStable && 
    selectedYear === initialDataStable.currentYear && 
    selectedMonth === initialDataStable.currentMonth;
  
  // PERBAIKAN: Gunakan Supabase Realtime instead of polling
  const pemasukanRealtime = usePemasukanRealtime(
    handleRealTimeUpdate,
    isCurrentPeriod || false // Pastikan boolean, bukan null
  );

  const targetRealtime = useTargetPemasukanRealtime(
    handleTargetUpdate,
    true // Selalu monitor target changes
  );

  // PERBAIKAN: Hitung persentase pencapaian
  const calculatePercentage = () => {
    if (currentTarget <= 0) {
      return 0;
    }
    // Jangan return 0 jika pemasukanBulanan <= 0, biarkan perhitungan tetap berjalan
    return (pemasukanBulanan / currentTarget) * 100;
  };

  const persentasePencapaian = calculatePercentage();
  const chartPercentage = Math.min(Math.max(persentasePencapaian, 0), 100); // Batasi antara 0-100 untuk UI
  const selisihTarget = pemasukanBulanan - currentTarget;
  
  // Hitung persentase lebih jika melebihi 100%
  const excessPercentage = persentasePencapaian > 100 ? persentasePencapaian - 100 : 0;
  
  // PERBAIKAN: Gunakan persentase pencapaian langsung, bukan selisih
  const displayPercentage = persentasePencapaian;

  // Gunakan persentase yang sudah dihitung dan dijaga, tanpa fallback yang menyesatkan
  const series = [Number(Math.min(100, Math.max(0, persentasePencapaian)).toFixed(1))];

  const options: ApexOptions = {
    colors: [persentasePencapaian >= 100 ? "#10B981" : "#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            // Tampilkan nilai sesuai series yang diberikan oleh ApexCharts agar sinkron
            formatter: function (val) {
              const v = typeof val === 'number' ? val : Number(val);
              if (!isFinite(v)) return "0%";
              return v >= 100 ? "100%" : v.toFixed(1) + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: [persentasePencapaian >= 100 ? "#10B981" : "#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };

  // Fetch available years
  const fetchAvailableYears = async () => {
    try {
      const response = await fetch('/api/pemasukan/available-years');
      if (response.ok) {
        const data = await response.json();
        setAvailableYears(data.years || []);
      }
    } catch (error) {
      console.error('Error fetching available years:', error);
      // Fallback
      const currentYear = new Date().getFullYear();
      setAvailableYears([currentYear - 2, currentYear - 1, currentYear, currentYear + 1]);
    }
  };

  // Fetch target
  const fetchTarget = async (year: number, month: number) => {
    try {
      const response = await fetch(`/api/target-pemasukan?year=${year}&month=${month}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentTarget(data.target || targetAmount || targetBulanan);
      }
    } catch (error) {
      console.error("Error mengambil target:", error);
    }
  };

  // Fetch data ketika month/year berubah (hanya jika bukan periode saat ini)
  const fetchData = async (year: number, month: number) => {
    try {
      setLoading(true);
      setError(null);

      const [bulananRes, tahunanRes] = await Promise.all([
        fetch(`/api/pemasukan/bulanan?year=${year}&month=${month}`),
        fetch(`/api/pemasukan/tahunan?year=${year}`)
      ]);

      if (!bulananRes.ok || !tahunanRes.ok) {
        throw new Error('Gagal mengambil data pemasukan');
      }

      const bulananData = await bulananRes.json();
      const tahunanData = await tahunanRes.json();

      setPemasukanBulanan(bulananData.jumlah || 0);
      setPemasukanTahunan(tahunanData.jumlah || 0);
    } catch (error) {
      console.error("Error mengambil data pemasukan:", error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
      setPemasukanBulanan(0);
      setPemasukanTahunan(0);
    } finally {
      setLoading(false);
    }
  };

  // PERBAIKAN: Effect untuk initial setup dengan dependencies yang konsisten
  useEffect(() => {
    fetchAvailableYears();
    
    // Pastikan data initialData ter-load saat component mount
    if (initialDataStable) {
      console.log('Initial data received:', initialDataStable);
      setPemasukanBulanan(initialDataStable.pemasukanBulanan || 0);
      setPemasukanTahunan(initialDataStable.pemasukanTahunan || 0);
      fetchTarget(initialDataStable.currentYear, initialDataStable.currentMonth);
    }
  }, [initialDataStable]); // PERBAIKAN: Gunakan stable reference

  // PERBAIKAN: Effect untuk handle perubahan month/year dengan dependencies yang konsisten
  useEffect(() => {
    if (!initialDataStable) return;

    const isCurrentPeriod =
      selectedYear === initialDataStable.currentYear &&
      selectedMonth === initialDataStable.currentMonth;

    if (isCurrentPeriod) {
      // Pastikan data dari initialData ter-set dengan benar
      console.log('Setting data from initialData for current period:', {
        pemasukanBulanan: initialDataStable.pemasukanBulanan,
        pemasukanTahunan: initialDataStable.pemasukanTahunan
      });
      setPemasukanBulanan(initialDataStable.pemasukanBulanan || 0);
      setPemasukanTahunan(initialDataStable.pemasukanTahunan || 0);
    } else {
      // Fetch data untuk periode lain (dedupe)
      const key = `${selectedYear}-${selectedMonth}`;
      if (lastFetchedDataRef.current !== key) {
        lastFetchedDataRef.current = key;
        fetchData(selectedYear, selectedMonth);
      }
    }

    // Fetch target untuk periode yang dipilih (dedupe & hindari dobel)
    if (
      !lastFetchedTargetRef.current ||
      lastFetchedTargetRef.current.year !== selectedYear ||
      lastFetchedTargetRef.current.month !== selectedMonth
    ) {
      lastFetchedTargetRef.current = { year: selectedYear, month: selectedMonth };
      fetchTarget(selectedYear, selectedMonth);
    }
  }, [selectedYear, selectedMonth, initialDataStable]);

  // Handle edit target
  const handleEditTarget = () => {
    setIsEditDialogOpen(true);
    if (onEdit) {
      onEdit();
    }
  };

  // Handle save target
  const handleSaveTarget = async (newTarget: number) => {
    const response = await fetch('/api/target-pemasukan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        year: selectedYear,
        month: selectedMonth,
        target: newTarget
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Gagal menyimpan target');
    }

    setCurrentTarget(newTarget);
  };

  // Get month name
  const getMonthName = (month: number) => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return monthNames[month - 1];
  };

  // Status message dengan realtime indicator
  const statusMessage = () => {
    if (loading) return "Memuat data...";
    if (error) return `Error: ${error}`;

    if (currentTarget <= 0) {
      return `Target belum ditetapkan untuk bulan ${getMonthName(selectedMonth)} ${selectedYear}.`;
    }

    if (pemasukanBulanan <= 0) {
      return `Belum ada pemasukan untuk bulan ${getMonthName(selectedMonth)} ${selectedYear}. Target: ${formatRupiah(currentTarget)}.`;
    }

    if (persentasePencapaian >= 100) {
      if (selisihTarget > 0) {
        return `Alhamdulillah! Target bulan ${getMonthName(selectedMonth)} telah tercapai. Pemasukan melebihi target sebesar ${formatRupiah(Math.abs(selisihTarget))} (${persentasePencapaian.toFixed(1)}%).`;
      } else {
        return `Alhamdulillah! Target bulan ${getMonthName(selectedMonth)} telah tercapai tepat 100%.`;
      }
    } else if (persentasePencapaian >= 80) {
      return `Target hampir tercapai! Kurang ${formatRupiah(Math.abs(selisihTarget))} lagi untuk mencapai target bulan ${getMonthName(selectedMonth)}.`;
    } else {
      return `Masih perlu usaha lebih untuk mencapai target bulan ${getMonthName(selectedMonth)}. Kurang ${formatRupiah(Math.abs(selisihTarget))}.`;
    }
  };

  // Generate months
  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  if (loading && !initialDataStable) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Target Pemasukan Bulanan
              </h3>
              <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
                Target pemasukan yang ditetapkan untuk {getMonthName(selectedMonth)} {selectedYear}
              </p>
              
              {/* Realtime Status Indicator */}
              {isCurrentPeriod && (
                <div className="flex items-center gap-2 mt-2">
                  <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    pemasukanRealtime.isConnected 
                      ? 'bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400'
                      : 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      pemasukanRealtime.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`}></div>
                    <span>{pemasukanRealtime.isConnected ? 'Live' : 'Offline'}</span>
                  </div>
                  {pemasukanRealtime.error && (
                    <button
                      onClick={pemasukanRealtime.reconnect}
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      Reconnect
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* More Options Dropdown with Month/Year Selectors */}
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                  <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  {/* Month Selector */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger disabled={loading}>
                      <span>Pilih Bulan: {getMonthName(selectedMonth)}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                      {months.map((month) => (
                        <DropdownMenuItem
                          key={month.value}
                          onClick={() => setSelectedMonth(month.value)}
                          className={`cursor-pointer ${
                            selectedMonth === month.value 
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                              : ''
                          }`}
                        >
                          {month.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  {/* Year Selector */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger disabled={loading}>
                      <span>Pilih Tahun: {selectedYear}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                      {availableYears.length > 0 ? (
                        [...availableYears].sort((a, b) => b - a).map((year) => (
                          <DropdownMenuItem
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`cursor-pointer ${
                              selectedYear === year 
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                                : ''
                            }`}
                          >
                            {year}
                            {year === Math.max(...availableYears) && (
                              <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                (Terbaru)
                              </span>
                            )}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem disabled>
                          Memuat tahun...
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleEditTarget}
                    className="cursor-pointer"
                  >
                    Edit Target
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="relative">
            <div className="max-h-[330px]">
              <ApexChartWrapper
                options={options}
                series={series}
                type="radialBar"
                height={330}
              />
            </div>

            {/* Tampilkan hanya persentase kelebihan jika ada */}
            {excessPercentage > 0 && (
              <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[80%]">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 rounded-md">
                  +{excessPercentage.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
            {statusMessage()}
          </p>
        </div>

        <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
          <div>
            <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
              Target
            </p>
            <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
              {formatCurrencyShort(currentTarget)}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.26816 13.6632C7.4056 13.8192 7.60686 13.9176 7.8311 13.9176C7.83148 13.9176 7.83187 13.9176 7.83226 13.9176C8.02445 13.9178 8.21671 13.8447 8.36339 13.6981L12.3635 9.70076C12.6565 9.40797 12.6567 8.9331 12.3639 8.6401C12.0711 8.34711 11.5962 8.34694 11.3032 8.63973L8.5811 11.36L8.5811 2.5C8.5811 2.08579 8.24531 1.75 7.8311 1.75C7.41688 1.75 7.0811 2.08579 7.0811 2.5L7.0811 11.3556L4.36354 8.63975C4.07055 8.34695 3.59568 8.3471 3.30288 8.64009C3.01008 8.93307 3.01023 9.40794 3.30321 9.70075L7.26816 13.6632Z"
                  fill="#6B7280"
                />
              </svg>
            </p>
          </div>

          <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

          <div>
            <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
              Bulan Ini
            </p>
            <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
              {formatCurrencyShort(pemasukanBulanan)}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z"
                  fill={pemasukanBulanan >= currentTarget ? "#10B981" : "#6B7280"}
                />
              </svg>
            </p>
          </div>

          <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

          <div>
            <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
              Tahun Ini
            </p>
            <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
              {formatCurrencyShort(pemasukanTahunan)}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z"
                  fill="#10B981"
                />
              </svg>
            </p>
          </div>
        </div>
      </div>

      {/* Edit Target Dialog */}
      <EditTargetDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        currentTarget={currentTarget}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onSaveTarget={handleSaveTarget}
        getMonthName={getMonthName}
      />
    </>
  );
}