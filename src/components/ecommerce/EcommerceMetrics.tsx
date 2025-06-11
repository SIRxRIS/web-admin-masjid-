// src/components/ecommerce/EcommerceMetrics.tsx
"use client";
import React, { useState, useEffect } from "react";
import Badge from "../ui/badge/Badge";
import { TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { getPemasukanTahunan } from "@/actions/pemasukan";
import { getPengeluaranTahunan } from "@/actions/pengeluaran";

interface MetricsData {
  totalPemasukan: number;
  totalPengeluaran: number;
  persentasePemasukan: number;
  persentasePengeluaran: number;
  isLoading: boolean;
}

export const EcommerceMetrics = () => {
  const [metricsData, setMetricsData] = useState<MetricsData>({
    totalPemasukan: 0,
    totalPengeluaran: 0,
    persentasePemasukan: 0,
    persentasePengeluaran: 0,
    isLoading: true,
  });

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  useEffect(() => {
    const fetchMetricsData = async () => {
      try {
        setMetricsData(prev => ({ ...prev, isLoading: true }));

        // Ambil data tahun ini dan tahun lalu untuk perbandingan
        const [
          pemasukanTahunIni,
          pengeluaranTahunIni,
          pemasukanTahunLalu,
          pengeluaranTahunLalu,
        ] = await Promise.all([
          getPemasukanTahunan(currentYear),
          getPengeluaranTahunan(currentYear),
          getPemasukanTahunan(previousYear).catch(() => 0), // Jika tahun lalu tidak ada data
          getPengeluaranTahunan(previousYear).catch(() => 0), // Jika tahun lalu tidak ada data
        ]);

        // Hitung persentase perubahan
        const persentasePemasukan = pemasukanTahunLalu > 0
          ? ((pemasukanTahunIni - pemasukanTahunLalu) / pemasukanTahunLalu) * 100
          : 0;

        const persentasePengeluaran = pengeluaranTahunLalu > 0
          ? ((pengeluaranTahunIni - pengeluaranTahunLalu) / pengeluaranTahunLalu) * 100
          : 0;

        setMetricsData({
          totalPemasukan: pemasukanTahunIni,
          totalPengeluaran: pengeluaranTahunIni,
          persentasePemasukan: Math.abs(persentasePemasukan),
          persentasePengeluaran: Math.abs(persentasePengeluaran),
          isLoading: false,
        });

      } catch (error) {
        console.error("Error mengambil data metrics:", error);
        setMetricsData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchMetricsData();
  }, [currentYear, previousYear]);

  // Format currency ke Rupiah
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format angka untuk tampilan yang lebih compact
  const formatCompactNumber = (amount: number): string => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}M`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}Jt`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}Rb`;
    }
    return amount.toString();
  };

  if (metricsData.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        {/* Loading Skeleton */}
        {[1, 2].map((index) => (
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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Pemasukan Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-800/20">
          <ArrowUpCircle className="text-green-600 size-6 dark:text-green-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Pemasukan {currentYear}
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90" title={formatCurrency(metricsData.totalPemasukan)}>
              Rp {formatCompactNumber(metricsData.totalPemasukan)}
            </h4>
          </div>
          <Badge color={metricsData.persentasePemasukan >= 0 ? "success" : "error"}>
            {metricsData.persentasePemasukan >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {metricsData.persentasePemasukan.toFixed(1)}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Pemasukan End --> */}

      {/* <!-- Metric Pengeluaran Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl dark:bg-red-800/20">
          <ArrowDownCircle className="text-red-600 size-6 dark:text-red-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Pengeluaran {currentYear}
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90" title={formatCurrency(metricsData.totalPengeluaran)}>
              Rp {formatCompactNumber(metricsData.totalPengeluaran)}
            </h4>
          </div>

          <Badge color={metricsData.persentasePengeluaran >= 0 ? "error" : "success"}>
            {metricsData.persentasePengeluaran >= 0 ? (
              <TrendingUp className="text-red-500 w-4 h-4" />
            ) : (
              <TrendingDown className="text-green-500 w-4 h-4" />
            )}
            {metricsData.persentasePengeluaran.toFixed(1)}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Pengeluaran End --> */}
    </div>
  );
};