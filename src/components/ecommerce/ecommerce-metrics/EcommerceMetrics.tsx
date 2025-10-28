// src/components/ecommerce/ecommerce-metrics/EcommerceMetrics.tsx
"use client";
import React from "react";
import Badge from "@/components/ui/badge/Badge";
import {
    TrendingUp,
    TrendingDown,
    ArrowUpCircle,
    ArrowDownCircle,
    Wallet,
    FileText,
    Minus,
    Users,
    Package,
    Gift,
    Eye
} from "lucide-react";
import { useEcommerceMetrics, ServerMetricsData } from "@/components/ecommerce/ecommerce-metrics/UseEcommerceMetrics";

interface EcommerceMetricsProps {
    serverData?: ServerMetricsData | null;
    isLoading?: boolean;
    error?: string;
}

export const EcommerceMetrics: React.FC<EcommerceMetricsProps> = ({
    serverData,
    isLoading = false,
    error
}) => {
    const {
        metricsData,
        currentYear,
        currentMonth,
        formatCurrency,
        formatNumber,
        getSaldoColor,
        getSaldoBgColor,
        getMonthName,
    } = useEcommerceMetrics({
        serverData,
        isLoading,
        error
    });

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

        // Untuk pemasukan, saldo, dan data lainnya (naik = baik, turun = buruk)
        return {
            color: isPositive ? "success" : "error",
            icon: isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />,
            text: `${Math.abs(persentase).toFixed(1)}%`
        };
    };

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <div className="space-y-6">
            {/* Baris pertama - 4 cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
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

            {/* Baris kedua - 4 cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
                {[5, 6, 7, 8].map((index) => (
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
        </div>
    );

    // Error component
    const ErrorDisplay = () => (
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

    // Tampilkan error jika ada
    if (metricsData.error) {
        return <ErrorDisplay />;
    }

    // Tampilkan loading jika masih memuat
    if (metricsData.isLoading) {
        return <LoadingSkeleton />;
    }

    // Prepare badge props
    const saldoBadgeProps = getBadgeProps(metricsData.persentaseSaldo);
    const pemasukanBadgeProps = getBadgeProps(metricsData.persentasePemasukan);
    const pengeluaranBadgeProps = getBadgeProps(metricsData.persentasePengeluaran, true);
    const kontenBadgeProps = getBadgeProps(metricsData.persentaseKonten);
    const donaturBadgeProps = getBadgeProps(metricsData.persentaseDonatur);
    const inventarisBadgeProps = getBadgeProps(metricsData.persentaseInventaris);
    const kotakAmalBadgeProps = getBadgeProps(metricsData.persentaseKotakAmal);
    const pengunjungWebBadgeProps = getBadgeProps(metricsData.persentasePengunjungWeb);

    return (
        <div className="space-y-6">
            {/* Baris Pertama - 4 Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
                {/* Card Saldo Keseluruhan */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${getSaldoBgColor(metricsData.saldo)}`}>
                        <Wallet className={`size-6 ${getSaldoColor(metricsData.saldo)}`} />
                    </div>

                    <div className="flex items-end justify-between mt-5">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Saldo Keseluruhan (Jan - {getMonthName(currentMonth)} {currentYear})
                            </span>
                            <h4 className={`mt-2 font-bold text-title-sm ${getSaldoColor(metricsData.saldo)}`} title={formatCurrency(metricsData.saldo)}>
                                Rp {formatNumber(metricsData.saldo)}
                            </h4>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Total: Rp {formatNumber(metricsData.totalPemasukanKeseluruhan)} - Rp {formatNumber(metricsData.totalPengeluaranKeseluruhan)}
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

                {/* Card Total Donatur */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-800/20">
                        <Users className="text-purple-600 size-6 dark:text-purple-400" />
                    </div>

                    <div className="flex items-end justify-between mt-5">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Total Donatur Aktif
                            </span>
                            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                {formatNumber(metricsData.totalDonatur)} Orang
                            </h4>
                        </div>
                        <Badge color={donaturBadgeProps.color}>
                            {donaturBadgeProps.icon}
                            {donaturBadgeProps.text}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Baris Kedua - 4 Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
                {/* Card Total Inventaris */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl dark:bg-orange-800/20">
                        <Package className="text-orange-600 size-6 dark:text-orange-400" />
                    </div>

                    <div className="flex items-end justify-between mt-5">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Total Inventaris
                            </span>
                            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                {formatNumber(metricsData.totalInventaris)} Item
                            </h4>
                        </div>
                        <Badge color={inventarisBadgeProps.color}>
                            {inventarisBadgeProps.icon}
                            {inventarisBadgeProps.text}
                        </Badge>
                    </div>
                </div>

                {/* Card Jumlah Kotak Amal */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-xl dark:bg-teal-800/20">
                        <Gift className="text-teal-600 size-6 dark:text-teal-400" />
                    </div>

                    <div className="flex items-end justify-between mt-5">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Jumlah Kotak Amal
                            </span>
                            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                {formatNumber(metricsData.totalKotakAmal)}
                            </h4>
                        </div>
                        <Badge color={kotakAmalBadgeProps.color}>
                            {kotakAmalBadgeProps.icon}
                            {kotakAmalBadgeProps.text}
                        </Badge>
                    </div>
                </div>

                {/* Card Pengunjung Web */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl dark:bg-indigo-800/20">
                        <Eye className="text-indigo-600 size-6 dark:text-indigo-400" />
                    </div>

                    <div className="flex items-end justify-between mt-5">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Pengunjung Web {getMonthName(currentMonth)} {currentYear}
                            </span>
                            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                {formatNumber(metricsData.totalPengunjungWeb)}
                            </h4>
                        </div>
                        <Badge color={pengunjungWebBadgeProps.color}>
                            {pengunjungWebBadgeProps.icon}
                            {pengunjungWebBadgeProps.text}
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
        </div>
    );
};