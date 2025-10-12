// src/components/ecommerce/MonthlyTarget.tsx
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MoreDotIcon } from "@/icons";
import { useState, useEffect, useTransition } from "react";
import { formatRupiah, formatAngka } from "@/lib/utils";
import InputField from "@/components/form/input/InputField";
import ApexChartWrapper from "../charts/ApexChartWrapper";

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
  };
}

export default function TargetPemasukanBulanan({
  targetBulanan = 50000000, 
  targetAmount,
  onEdit,
  onDelete,
  initialData
}: TargetPemasukanBulananProps) {
  // State untuk data pemasukan
  const [pemasukanBulanan, setPemasukanBulanan] = useState<number>(initialData?.pemasukanBulanan || 0);
  const [pemasukanTahunan, setPemasukanTahunan] = useState<number>(initialData?.pemasukanTahunan || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // State untuk available years dari API
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [yearsLoading, setYearsLoading] = useState(true);

  // State untuk target dan edit dialog
  const [currentTarget, setCurrentTarget] = useState<number>(targetAmount || targetBulanan);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(initialData?.currentMonth || currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(initialData?.currentYear || currentDate.getFullYear());

  // Gunakan currentTarget yang bisa diupdate
  const actualTarget = currentTarget;
  
  // Hitung persentase pencapaian menggunakan actualTarget
  const persentasePencapaian = Math.min((pemasukanBulanan / actualTarget) * 100, 100);
  const selisihTarget = pemasukanBulanan - actualTarget;
  const persentasePerubahan = actualTarget > 0 ? (selisihTarget / actualTarget) * 100 : 0;

  const series = [Number(persentasePencapaian.toFixed(1))];

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
            formatter: function (val) {
              return val + "%";
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

  // Function untuk fetch available years
  const fetchAvailableYears = async () => {
    try {
      setYearsLoading(true);
      const response = await fetch('/api/pemasukan/available-years');
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data tahun tersedia');
      }
      
      const data = await response.json();
      setAvailableYears(data.years || []);
      
      // Jika tahun yang dipilih tidak ada dalam available years, set ke tahun terbaru
      if (data.years && data.years.length > 0 && !data.years.includes(selectedYear)) {
        const latestYear = Math.max(...data.years);
        setSelectedYear(latestYear);
      }
    } catch (error) {
      console.error('Error mengambil available years:', error);
      // Fallback ke generate years jika API gagal
      setAvailableYears(generateYearsFallback());
    } finally {
      setYearsLoading(false);
    }
  };

  // Fallback function untuk generate years jika API gagal
  const generateYearsFallback = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2020; year <= currentYear + 5; year++) {
      years.push(year);
    }
    return years;
  };

  // Function untuk fetch target
  const fetchTarget = async (year: number, month: number) => {
    try {
      const response = await fetch(`/api/target-pemasukan?year=${year}&month=${month}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentTarget(data.target);
      }
    } catch (error) {
      console.error("Error mengambil target:", error);
    }
  };

  // Function untuk fetch data ketika month/year berubah
  const fetchData = async (year: number, month: number) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch target dan data pemasukan secara bersamaan
      const [bulananRes, tahunanRes] = await Promise.all([
        fetch(`/api/pemasukan/bulanan?year=${year}&month=${month}`),
        fetch(`/api/pemasukan/tahunan?year=${year}`),
        fetchTarget(year, month) // Fetch target juga
      ]);

      // Handle response errors dengan detail yang lebih baik
      if (!bulananRes.ok) {
        const errorData = await bulananRes.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Error fetching monthly data: ${errorData.error || 'Server error'}`);
      }

      if (!tahunanRes.ok) {
        const errorData = await tahunanRes.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Error fetching yearly data: ${errorData.error || 'Server error'}`);
      }

      const bulananData = await bulananRes.json();
      const tahunanData = await tahunanRes.json();

      setPemasukanBulanan(bulananData.jumlah || 0);
      setPemasukanTahunan(tahunanData.jumlah || 0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal';
      console.error("Error mengambil data pemasukan:", errorMessage);
      setError(errorMessage);
      
      // Set default values jika terjadi error
      setPemasukanBulanan(0);
      setPemasukanTahunan(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available years saat komponen mount
  useEffect(() => {
    fetchAvailableYears();
  }, []);

  // Fetch data ketika month/year berubah (tapi tidak saat initial load jika ada initialData)
  useEffect(() => {
    // Hanya fetch jika bukan initial load dengan data, atau jika month/year berbeda dari initial
    const isInitialLoad = initialData &&
      selectedMonth === initialData.currentMonth &&
      selectedYear === initialData.currentYear;

    if (!isInitialLoad) {
      startTransition(() => {
        fetchData(selectedYear, selectedMonth);
      });
    } else {
      // Fetch target untuk initial load
      fetchTarget(selectedYear, selectedMonth);
    }
  }, [selectedYear, selectedMonth, initialData]);

  // Function untuk handle edit target
  const handleEditTarget = () => {
    setEditTarget(actualTarget.toString());
    setIsEditDialogOpen(true);
    if (onEdit) {
      onEdit();
    }
  };

  // Function untuk format input angka dengan separator ribuan
  const formatInputNumber = (value: string) => {
    // Hapus semua karakter non-digit
    const numericValue = value.replace(/\D/g, '');
    
    // Format dengan separator ribuan
    if (numericValue) {
      return parseInt(numericValue).toLocaleString('id-ID');
    }
    return '';
  };

  // Function untuk parse input yang sudah diformat kembali ke angka
  const parseFormattedNumber = (value: string) => {
    return value.replace(/\./g, '');
  };

  // Function untuk handle perubahan input target
  const handleTargetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseFormattedNumber(rawValue);
    const formattedValue = formatInputNumber(numericValue);
    
    // Update input dengan format yang benar
    e.target.value = formattedValue;
    setEditTarget(numericValue);
  };

  // Function untuk save target
  const handleSaveTarget = async () => {
    try {
      setIsSaving(true);
      const newTarget = parseInt(editTarget);

      if (isNaN(newTarget) || newTarget <= 0) {
        alert('Target harus berupa angka yang valid dan lebih besar dari 0');
        return;
      }

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
      setIsEditDialogOpen(false);
      setEditTarget('');
    } catch (error) {
      console.error('Error menyimpan target:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan target');
    } finally {
      setIsSaving(false);
    }
  };

  // Format currency short (untuk display yang lebih pendek)
  const formatCurrencyShort = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}M`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)}Jt`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return formatRupiah(amount);
  };

  const getMonthName = (month: number) => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return monthNames[month - 1];
  };

  const statusMessage = () => {
    if (loading || isPending) return "Memuat data...";
    
    if (error) return `Error: ${error}`;

    if (persentasePencapaian >= 100) {
      return `Alhamdulillah! Target bulan ${getMonthName(selectedMonth)} telah tercapai. Pemasukan melebihi target sebesar ${formatRupiah(Math.abs(selisihTarget))}.`;
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

  if (loading && !initialData) {
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
                    <DropdownMenuSubTrigger disabled={isPending}>
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

                  {/* Year Selector - Menggunakan Available Years dari API */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger disabled={isPending || yearsLoading}>
                      <span>
                        {yearsLoading ? 'Memuat tahun...' : `Pilih Tahun: ${selectedYear}`}
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                      {yearsLoading ? (
                        <DropdownMenuItem disabled>
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            Memuat tahun...
                          </div>
                        </DropdownMenuItem>
                      ) : availableYears.length > 0 ? (
                        // Urutkan tahun dari terbaru ke terlama
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
                          Tidak ada data tahun tersedia
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

            <span className={`absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full px-3 py-1 text-xs font-medium ${persentasePerubahan >= 0
              ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
              : 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500'
              }`}>
              {persentasePerubahan >= 0 ? '+' : ''}{persentasePerubahan.toFixed(1)}%
            </span>
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
              {formatCurrencyShort(actualTarget)}
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
                  fill={pemasukanBulanan >= actualTarget ? "#10B981" : "#6B7280"}
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Target Pemasukan</DialogTitle>
            <DialogDescription>
              Atur target pemasukan untuk {getMonthName(selectedMonth)} {selectedYear}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target" className="text-right flex items-center justify-end h-full">
                Target (Rp)
              </Label>
              <div className="col-span-3">
                <InputField
                  id="target"
                  type="text"
                  defaultValue={formatInputNumber(editTarget)}
                  onChange={handleTargetInputChange}
                  placeholder="Contoh: 10.000.000"
                  hint="Masukkan target dalam Rupiah"
                />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Target saat ini: {formatRupiah(actualTarget)}
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              type="button" 
              onClick={handleSaveTarget}
              disabled={isSaving}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Target'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}