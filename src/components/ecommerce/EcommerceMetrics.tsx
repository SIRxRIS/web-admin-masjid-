// src/components/ecommerce/EcommerceMetrics.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { usePemasukanRealtime, usePengeluaranRealtime } from "@/hooks/useSupabaseRealtime";
import Badge from "../ui/badge/Badge";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  FileText,
  Minus
} from "lucide-react";

interface MetricsData {
  totalPemasukan: number;
  totalPengeluaran: number;
  saldo: number;
  totalKonten: number;
  persentasePemasukan: number;
  persentasePengeluaran: number;
  persentaseSaldo: number;
  persentaseKonten: number;
  // Data bulan lalu untuk perbandingan
  pemasukanBulanLalu: number;
  pengeluaranBulanLalu: number;
  saldoBulanLalu: number;
  isLoading: boolean;
  error?: string;
}

interface EcommerceMetricsProps {
  initialData?: {
    pemasukanBulanan: number;
    totalKonten: number;
    currentYear: number;
    currentMonth: number;
    // Data tambahan yang mungkin sudah di-fetch di server
    pengeluaranBulanan?: number;
    pemasukanBulanLalu?: number;
    pengeluaranBulanLalu?: number;
  };
}

export const EcommerceMetrics: React.FC<EcommerceMetricsProps> = ({
  initialData
}) => {
  const [metricsData, setMetricsData] = useState<MetricsData>({
    totalPemasukan: initialData?.pemasukanBulanan || 0,
    totalPengeluaran: initialData?.pengeluaranBulanan || 0,
    saldo: (initialData?.pemasukanBulanan || 0) - (initialData?.pengeluaranBulanan || 0),
    totalKonten: initialData?.totalKonten || 0,
    persentasePemasukan: 0,
    persentasePengeluaran: 0,
    persentaseSaldo: 0,
    persentaseKonten: 0,
    pemasukanBulanLalu: initialData?.pemasukanBulanLalu || 0,
    pengeluaranBulanLalu: initialData?.pengeluaranBulanLalu || 0,
    saldoBulanLalu: 0,
    isLoading: !initialData, // Jika ada initialData, tidak perlu loading
    error: undefined,
  });

  const currentDate = new Date();
  const currentYear = initialData?.currentYear || currentDate.getFullYear();
  const currentMonth = initialData?.currentMonth || (currentDate.getMonth() + 1);

  // Hitung bulan lalu
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  useEffect(() => {
    // Jika sudah ada initialData yang lengkap, tidak perlu fetch lagi
    if (initialData && initialData.pengeluaranBulanan !== undefined) {
      const saldoBulanIni = initialData.pemasukanBulanan - initialData.pengeluaranBulanan;
      const saldoBulanLalu = (initialData.pemasukanBulanLalu || 0) - (initialData.pengeluaranBulanLalu || 0);

      // Fungsi untuk menghitung persentase perubahan
      const hitungPersentasePerubahan = (nilaiSekarang: number, nilaiBulanLalu: number): number => {
        if (nilaiBulanLalu === 0) {
          if (nilaiSekarang > 0) return 100;
          if (nilaiSekarang < 0) return -100;
          return 0;
        }
        return ((nilaiSekarang - nilaiBulanLalu) / Math.abs(nilaiBulanLalu)) * 100;
      };

      const persentasePemasukan = hitungPersentasePerubahan(
        initialData.pemasukanBulanan,
        initialData.pemasukanBulanLalu || 0
      );
      const persentasePengeluaran = hitungPersentasePerubahan(
        initialData.pengeluaranBulanan,
        initialData.pengeluaranBulanLalu || 0
      );
      const persentaseSaldo = hitungPersentasePerubahan(saldoBulanIni, saldoBulanLalu);

      setMetricsData({
        totalPemasukan: initialData.pemasukanBulanan,
        totalPengeluaran: initialData.pengeluaranBulanan,
        saldo: saldoBulanIni,
        totalKonten: initialData.totalKonten,
        pemasukanBulanLalu: initialData.pemasukanBulanLalu || 0,
        pengeluaranBulanLalu: initialData.pengeluaranBulanLalu || 0,
        saldoBulanLalu: saldoBulanLalu,
        persentasePemasukan,
        persentasePengeluaran,
        persentaseSaldo,
        persentaseKonten: 0,
        isLoading: false,
        error: undefined,
      });
      return;
    }

    // Jika tidak ada initialData atau data tidak lengkap, fetch via API
    const fetchMetricsData = async () => {
      try {
        setMetricsData(prev => ({ ...prev, isLoading: true, error: undefined }));

        // Fetch data melalui API routes
        const responses = await Promise.allSettled([
          fetch(`/api/pemasukan/bulanan?year=${currentYear}&month=${currentMonth}`),
          fetch(`/api/pengeluaran/bulanan?year=${currentYear}&month=${currentMonth}`),
          fetch(`/api/pemasukan/bulanan?year=${previousMonthYear}&month=${previousMonth}`),
          fetch(`/api/pengeluaran/bulanan?year=${previousMonthYear}&month=${previousMonth}`),
          fetch(`/api/content/published-count`),
        ]);

        // Parse responses
        const results = await Promise.allSettled(
          responses.map(async (response, index) => {
            if (response.status === 'fulfilled' && response.value.ok) {
              return await response.value.json();
            }
            throw new Error(`API call ${index} failed`);
          })
        );

        // Handle hasil dengan aman
        const pemasukanBulanIni = results[0].status === 'fulfilled' ? results[0].value.jumlah : 0;
        const pengeluaranBulanIni = results[1].status === 'fulfilled' ? results[1].value.jumlah : 0;
        const pemasukanBulanLalu = results[2].status === 'fulfilled' ? results[2].value.jumlah : 0;
        const pengeluaranBulanLalu = results[3].status === 'fulfilled' ? results[3].value.jumlah : 0;
        const totalKonten = results[4].status === 'fulfilled' ? results[4].value.count : 0;

        // Log error jika ada yang gagal
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const labels = ['Pemasukan Bulan Ini', 'Pengeluaran Bulan Ini', 'Pemasukan Bulan Lalu', 'Pengeluaran Bulan Lalu', 'Total Konten'];
            console.error(`Error mengambil ${labels[index]}:`, result.reason);
          }
        });

        // Hitung saldo dengan benar
        const saldoBulanIni = pemasukanBulanIni - pengeluaranBulanIni;
        const saldoBulanLalu = pemasukanBulanLalu - pengeluaranBulanLalu;

        // Fungsi untuk menghitung persentase perubahan
        const hitungPersentasePerubahan = (nilaiSekarang: number, nilaiBulanLalu: number): number => {
          if (nilaiBulanLalu === 0) {
            if (nilaiSekarang > 0) return 100;
            if (nilaiSekarang < 0) return -100;
            return 0;
          }
          return ((nilaiSekarang - nilaiBulanLalu) / Math.abs(nilaiBulanLalu)) * 100;
        };

        // Hitung persentase perubahan berdasarkan bulan lalu
        const persentasePemasukan = hitungPersentasePerubahan(pemasukanBulanIni, pemasukanBulanLalu);
        const persentasePengeluaran = hitungPersentasePerubahan(pengeluaranBulanIni, pengeluaranBulanLalu);
        const persentaseSaldo = hitungPersentasePerubahan(saldoBulanIni, saldoBulanLalu);

        setMetricsData({
          totalPemasukan: pemasukanBulanIni,
          totalPengeluaran: pengeluaranBulanIni,
          saldo: saldoBulanIni,
          totalKonten: totalKonten,
          pemasukanBulanLalu: pemasukanBulanLalu,
          pengeluaranBulanLalu: pengeluaranBulanLalu,
          saldoBulanLalu: saldoBulanLalu,
          persentasePemasukan: persentasePemasukan,
          persentasePengeluaran: persentasePengeluaran,
          persentaseSaldo: persentaseSaldo,
          persentaseKonten: 0,
          isLoading: false,
          error: undefined,
        });

      } catch (error) {
        console.error("Error mengambil data metrics:", error);
        setMetricsData(prev => ({
          ...prev,
          isLoading: false,
          error: "Gagal mengambil data metrics"
        }));
      }
    };

    fetchMetricsData();
  }, [currentYear, currentMonth, previousMonth, previousMonthYear, initialData]);

  // PERBAIKAN: Gunakan Supabase Realtime untuk monitoring perubahan data
  const handleRealtimeUpdate = useCallback(() => {
    console.log('Data changed via realtime, refreshing metrics...');
    // Re-fetch data metrics saat ada perubahan
    const fetchMetricsData = async () => {
      try {
        setMetricsData(prev => ({ ...prev, isLoading: true, error: undefined }));

        const responses = await Promise.allSettled([
          fetch(`/api/pemasukan/bulanan?year=${currentYear}&month=${currentMonth}`),
          fetch(`/api/pengeluaran/bulanan?year=${currentYear}&month=${currentMonth}`),
          fetch(`/api/pemasukan/bulanan?year=${previousMonthYear}&month=${previousMonth}`),
          fetch(`/api/pengeluaran/bulanan?year=${previousMonthYear}&month=${previousMonth}`),
          fetch(`/api/content/published-count`),
        ]);

        const results = await Promise.allSettled(
          responses.map(async (response, index) => {
            if (response.status === 'fulfilled' && response.value.ok) {
              return await response.value.json();
            }
            throw new Error(`API call ${index} failed`);
          })
        );

        const [
          pemasukanBulanIni,
          pengeluaranBulanIni,
          pemasukanBulanLalu,
          pengeluaranBulanLalu,
          totalKonten
        ] = results.map(result => 
          result.status === 'fulfilled' ? result.value : { jumlah: 0, total: 0 }
        );

        const newMetricsData = {
          totalPemasukan: pemasukanBulanIni.jumlah || 0,
          totalPengeluaran: pengeluaranBulanIni.jumlah || 0,
          saldo: (pemasukanBulanIni.jumlah || 0) - (pengeluaranBulanIni.jumlah || 0),
          totalKonten: totalKonten.total || 0,
          pemasukanBulanLalu: pemasukanBulanLalu.jumlah || 0,
          pengeluaranBulanLalu: pengeluaranBulanLalu.jumlah || 0,
          saldoBulanLalu: (pemasukanBulanLalu.jumlah || 0) - (pengeluaranBulanLalu.jumlah || 0),
          persentasePemasukan: 0,
          persentasePengeluaran: 0,
          persentaseSaldo: 0,
          persentaseKonten: 0,
          isLoading: false,
          error: undefined,
        };

        // Hitung persentase perubahan
        if (newMetricsData.pemasukanBulanLalu > 0) {
          newMetricsData.persentasePemasukan = 
            ((newMetricsData.totalPemasukan - newMetricsData.pemasukanBulanLalu) / newMetricsData.pemasukanBulanLalu) * 100;
        }
        if (newMetricsData.pengeluaranBulanLalu > 0) {
          newMetricsData.persentasePengeluaran = 
            ((newMetricsData.totalPengeluaran - newMetricsData.pengeluaranBulanLalu) / newMetricsData.pengeluaranBulanLalu) * 100;
        }
        if (newMetricsData.saldoBulanLalu !== 0) {
          newMetricsData.persentaseSaldo = 
            ((newMetricsData.saldo - newMetricsData.saldoBulanLalu) / Math.abs(newMetricsData.saldoBulanLalu)) * 100;
        }

        setMetricsData(newMetricsData);
      } catch (error) {
        console.error("Error mengambil data metrics:", error);
        setMetricsData(prev => ({
          ...prev,
          isLoading: false,
          error: "Gagal mengambil data metrics"
        }));
      }
    };

    fetchMetricsData();
  }, [currentYear, currentMonth, previousMonth, previousMonthYear]);

  // Monitor perubahan data pemasukan dan pengeluaran
  const pemasukanRealtime = usePemasukanRealtime(handleRealtimeUpdate, true);
  const pengeluaranRealtime = usePengeluaranRealtime(handleRealtimeUpdate, true);

  // Format currency ke Rupiah
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format angka dengan titik sebagai pemisah ribuan (format Indonesia)
  const formatNumber = (amount: number): string => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  // Fungsi untuk menentukan warna saldo
  const getSaldoColor = (saldo: number) => {
    if (saldo > 0) return "text-green-600 dark:text-green-400";
    if (saldo < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getSaldoBgColor = (saldo: number) => {
    if (saldo > 0) return "bg-green-100 dark:bg-green-800/20";
    if (saldo < 0) return "bg-red-100 dark:bg-red-800/20";
    return "bg-gray-100 dark:bg-gray-800/20";
  };

  // Fungsi untuk menentukan icon dan warna badge berdasarkan persentase
  const getBadgeProps = (persentase: number, isExpense: boolean = false): {
    color: "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";
    icon: React.ReactNode;
    text: string;
  } => {
    if (persentase === 0) {
      return {
        color: "info",
        icon: <Minus className="w-4 h-4" />,
        text: "0.0%"
      };
    }

    const isPositive = persentase > 0;

    // Untuk pengeluaran, logika terbalik (naik = buruk, turun = baik)
    if (isExpense) {
      return {
        color: isPositive ? "error" : "success",
        icon: isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />,
        text: `${Math.abs(persentase).toFixed(1)}%`
      };
    }

    // Untuk pemasukan dan saldo (naik = baik, turun = buruk)
    return {
      color: isPositive ? "success" : "error",
      icon: isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />,
      text: `${Math.abs(persentase).toFixed(1)}%`
    };
  };

  // Tampilkan error jika ada
  if (metricsData.error) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/20 md:p-6">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">
              {metricsData.error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Coba lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (metricsData.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {/* Loading Skeleton */}
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 animate-pulse">
              <div className="w-6 h-6 bg-gray-300 rounded dark:bg-gray-600"></div>
            </div>
            <div className="flex items-end justify-between mt-5">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse mb-2"></div>
                <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 animate-pulse"></div>
              </div>
              <div className="ml-4">
                <div className="h-6 w-16 bg-gray-200 rounded dark:bg-gray-700 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const getMonthName = (month: number): string => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  };

  const saldoBadgeProps = getBadgeProps(metricsData.persentaseSaldo);
  const pemasukanBadgeProps = getBadgeProps(metricsData.persentasePemasukan);
  const pengeluaranBadgeProps = getBadgeProps(metricsData.persentasePengeluaran, true);
  const kontenBadgeProps = getBadgeProps(metricsData.persentaseKonten);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {/* Card Saldo */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${getSaldoBgColor(metricsData.saldo)}`}>
          <Wallet className={`size-6 ${getSaldoColor(metricsData.saldo)}`} />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Saldo {getMonthName(currentMonth)} {currentYear}
            </span>
            <h4 className={`mt-2 font-bold text-title-sm ${getSaldoColor(metricsData.saldo)}`} title={formatCurrency(metricsData.saldo)}>
              Rp {formatNumber(metricsData.saldo)}
            </h4>
            {/* Tampilkan detail perhitungan saldo */}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatCurrency(metricsData.totalPemasukan)} - {formatCurrency(metricsData.totalPengeluaran)}
            </p>
          </div>
          <Badge color={saldoBadgeProps.color}>
            {saldoBadgeProps.icon}
            {saldoBadgeProps.text}
          </Badge>
        </div>
      </div>

      {/* Card Pemasukan */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-800/20">
          <ArrowUpCircle className="text-green-600 size-6 dark:text-green-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Pemasukan {getMonthName(currentMonth)} {currentYear}
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90" title={formatCurrency(metricsData.totalPemasukan)}>
              Rp {formatNumber(metricsData.totalPemasukan)}
            </h4>
          </div>
          <Badge color={pemasukanBadgeProps.color}>
            {pemasukanBadgeProps.icon}
            {pemasukanBadgeProps.text}
          </Badge>
        </div>
      </div>

      {/* Card Pengeluaran */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl dark:bg-red-800/20">
          <ArrowDownCircle className="text-red-600 size-6 dark:text-red-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Pengeluaran {getMonthName(currentMonth)} {currentYear}
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90" title={formatCurrency(metricsData.totalPengeluaran)}>
              Rp {formatNumber(metricsData.totalPengeluaran)}
            </h4>
          </div>
          <Badge color={pengeluaranBadgeProps.color}>
            {pengeluaranBadgeProps.icon}
            {pengeluaranBadgeProps.text}
          </Badge>
        </div>
      </div>

      {/* Card Total Konten */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-800/20">
          <FileText className="text-blue-600 size-6 dark:text-blue-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Konten Published
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatNumber(metricsData.totalKonten)}
            </h4>
          </div>
          <Badge color={kontenBadgeProps.color}>
            {kontenBadgeProps.icon}
            {kontenBadgeProps.text}
          </Badge>
        </div>
      </div>
    </div>
  );
};