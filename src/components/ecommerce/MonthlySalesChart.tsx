// src/components/ecommerce/MonthlySalesChart.tsx
"use client";

import { ApexOptions } from "apexcharts";
import { useState, useEffect, useCallback } from "react";
import { formatRupiah } from "@/lib/utils";
import { usePemasukanRealtime } from "@/hooks/useSupabaseRealtime";
import ApexChartWrapper from "../charts/ApexChartWrapper";

interface MonthlyIncomeData {
  month: string;
  amount: number;
  monthNumber: number;
}

interface MonthlySalesChartProps {
  title?: string;
  initialData: {
    pemasukanBulanan: number;
    pemasukanTahunan: number;
    currentYear: number;
    currentMonth: number;
    monthlyData?: Array<{ bulan: number; jumlah: number }>;
  };
}

const BULAN_INDONESIA = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

export default function MonthlySalesChart({ 
  title = "Grafik Pemasukan Bulanan",
  initialData 
}: MonthlySalesChartProps) {
  const [pemasukanData, setPemasukanData] = useState<MonthlyIncomeData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(initialData.currentYear);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [totalPemasukanTahun, setTotalPemasukanTahun] = useState<number>(initialData.pemasukanTahunan);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // PERBAIKAN: State untuk menghindari hydration mismatch
  const [isClient, setIsClient] = useState(false);
  const [lastUpdatedString, setLastUpdatedString] = useState<string>("");

  // Effect untuk menandai bahwa component sudah di client
  useEffect(() => {
    setIsClient(true);
    setLastUpdatedString(new Date().toLocaleTimeString('id-ID'));
  }, []);

  // Update lastUpdatedString ketika lastUpdated berubah (hanya di client)
  useEffect(() => {
    if (isClient) {
      setLastUpdatedString(lastUpdated.toLocaleTimeString('id-ID'));
    }
  }, [lastUpdated, isClient]);

  // Fungsi untuk mengkonversi data dari initialData ke format yang dibutuhkan chart
  const convertInitialDataToChartFormat = useCallback((monthlyData: Array<{ bulan: number; jumlah: number }>) => {
    return monthlyData.map(item => ({
      month: BULAN_INDONESIA[item.bulan - 1],
      amount: item.jumlah,
      monthNumber: item.bulan
    }));
  }, []);

  // Set initial data saat component mount
  useEffect(() => {
    if (initialData.monthlyData && initialData.monthlyData.length > 0) {
      const chartData = convertInitialDataToChartFormat(initialData.monthlyData);
      setPemasukanData(chartData);
      setTotalPemasukanTahun(initialData.pemasukanTahunan);
    } else {
      // Fallback: jika monthlyData tidak ada, buat data dengan current month saja
      const fallbackData = BULAN_INDONESIA.map((month, index) => ({
        month,
        amount: index + 1 === initialData.currentMonth ? initialData.pemasukanBulanan : 0,
        monthNumber: index + 1
      }));
      setPemasukanData(fallbackData);
    }
    setIsLoading(false);
  }, [initialData, convertInitialDataToChartFormat]);

  // Fungsi untuk mengambil data pemasukan bulanan via API (hanya untuk tahun yang berbeda)
  const fetchPemasukanBulanan = useCallback(async (tahun: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const monthlyData: MonthlyIncomeData[] = [];

      // Ambil data untuk setiap bulan dalam tahun yang dipilih
      for (let bulan = 1; bulan <= 12; bulan++) {
        try {
          const response = await fetch(`/api/pemasukan/bulanan?year=${tahun}&month=${bulan}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();

          monthlyData.push({
            month: BULAN_INDONESIA[bulan - 1],
            amount: data.jumlah || 0,
            monthNumber: bulan
          });
        } catch (error) {
          console.error(`Error mengambil data bulan ${bulan}:`, error);
          monthlyData.push({
            month: BULAN_INDONESIA[bulan - 1],
            amount: 0,
            monthNumber: bulan
          });
        }
      }

      setPemasukanData(monthlyData);

      // Ambil total tahunan
      try {
        const response = await fetch(`/api/pemasukan/tahunan?year=${tahun}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTotalPemasukanTahun(data.jumlah || 0);
      } catch (error) {
        console.error("Error mengambil total tahunan:", error);
        // Fallback: hitung dari data bulanan
        const totalFromMonthly = monthlyData.reduce((sum, item) => sum + item.amount, 0);
        setTotalPemasukanTahun(totalFromMonthly);
      }

    } catch (error) {
      console.error("Error mengambil data pemasukan bulanan:", error);
      setError("Gagal mengambil data pemasukan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fungsi untuk mengambil tahun yang tersedia via API
  const fetchAvailableYears = useCallback(async () => {
    try {
      const response = await fetch('/api/pemasukan/available-years');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAvailableYears(data.years || []);

      if (data.years.length > 0 && !data.years.includes(selectedYear)) {
        const latestYear = Math.max(...data.years);
        setSelectedYear(latestYear);
      }
    } catch (error) {
      console.error("Error mengambil tahun tersedia:", error);
      // Fallback: gunakan tahun saat ini dan beberapa tahun sebelumnya
      const currentYear = new Date().getFullYear();
      setAvailableYears([currentYear - 2, currentYear - 1, currentYear]);
    }
  }, [selectedYear]);

  // Real-time update function - hanya trigger refresh data untuk tahun saat ini
  const handleRealTimeUpdate = useCallback(() => {
    if (selectedYear !== initialData.currentYear) {
      return; // Hanya update untuk tahun saat ini
    }

    console.log('Pemasukan data changed via realtime, refreshing chart...');
    // Trigger re-fetch data dengan memanggil fetchPemasukanBulanan
    fetchPemasukanBulanan(selectedYear);
    setLastUpdated(new Date());
  }, [selectedYear, initialData.currentYear, fetchPemasukanBulanan]);

  // PERBAIKAN: Gunakan Supabase Realtime instead of polling
  const pemasukanRealtime = usePemasukanRealtime(
    handleRealTimeUpdate,
    selectedYear === initialData.currentYear // Hanya untuk tahun saat ini
  );

  // Effect untuk load available years
  useEffect(() => {
    fetchAvailableYears();
  }, [fetchAvailableYears]);

  // Effect untuk load data pemasukan ketika tahun berubah (hanya untuk tahun non-current)
  useEffect(() => {
    if (selectedYear && selectedYear !== initialData.currentYear) {
      fetchPemasukanBulanan(selectedYear);
    }
  }, [selectedYear, initialData.currentYear, fetchPemasukanBulanan]);

  // Konfigurasi chart ApexCharts
  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 335,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: pemasukanData.map(item => item.month),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "12px",
        },
      },
    },
    legend: {
      show: false,
    },
    grid: {
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: function (val: number) {
          return formatRupiah(val);
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "12px",
        },
        formatter: function (val: number) {
          if (val >= 1000000000) {
            return (val / 1000000000).toFixed(1) + "M";
          } else if (val >= 1000000) {
            return (val / 1000000).toFixed(1) + "Jt";
          } else if (val >= 1000) {
            return (val / 1000).toFixed(0) + "K";
          }
          return val.toString();
        },
      },
    },
  };

  const series = [
    {
      name: "Pemasukan",
      data: pemasukanData.map(item => item.amount),
    },
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectYear = (year: number) => {
    setSelectedYear(year);
    setIsOpen(false);
  };

  if (error) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-default dark:border-gray-800 dark:bg-gray-900">
        <div className="px-6 py-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-lg font-semibold mb-2">Error</div>
              <div className="text-gray-600 dark:text-gray-400">{error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-default dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>
          <div className="mt-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total tahun {selectedYear}: <span className="font-semibold text-gray-800 dark:text-white">{formatRupiah(totalPemasukanTahun)}</span>
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
              {selectedYear === initialData.currentYear && pemasukanRealtime.isConnected ? (
                <>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 dark:text-green-400 font-medium">Live</span>
                  </div>
                  <span>•</span>
                  <span>Real-time updates</span>
                  <span>•</span>
                  {isClient && <span>Terakhir: {lastUpdatedString}</span>}
                </>
              ) : selectedYear === initialData.currentYear && !pemasukanRealtime.isConnected ? (
                <>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 dark:text-red-400 font-medium">Offline</span>
                  </div>
                  <span>•</span>
                  <button
                    onClick={pemasukanRealtime.reconnect}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    Reconnect
                  </button>
                </>
              ) : (
                <span>Data tahun {selectedYear}</span>
              )}
            </div>
          </div>
        </div>

        <div className="relative inline-block">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            disabled={isLoading}
          >
            <span>Tahun: {selectedYear}</span>
            <svg
              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="py-1">
                {availableYears.length > 0 ? (
                  [...availableYears].sort((a, b) => b - a).map((year) => (
                    <button
                      key={year}
                      onClick={() => selectYear(year)}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        selectedYear === year 
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {year}
                      {year === initialData.currentYear && (
                        <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                          (Saat ini)
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    Memuat tahun...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="h-[335px]">
            <ApexChartWrapper
              options={options}
              series={series}
              type="bar"
              height={335}
            />
          </div>
        )}
      </div>
    </div>
  );
}