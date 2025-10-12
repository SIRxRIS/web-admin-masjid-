// src/components/ecommerce/ecommerce-metrics/useEcommerceMetrics.ts 
import { useState, useEffect } from "react";

// Interface untuk data yang diterima dari server component
export interface ServerMetricsData {
  // Data pemasukan dan pengeluaran bulan ini
  pemasukanBulanIni: number;
  pengeluaranBulanIni: number;
  
  // Data pemasukan dan pengeluaran bulan lalu  
  pemasukanBulanLalu: number;
  pengeluaranBulanLalu: number;
  
  // Data kumulatif hingga bulan ini
  totalPemasukanKeseluruhan: number;
  totalPengeluaranKeseluruhan: number;
  
  // Data operasional (opsional, bisa dikembangkan nanti)
  totalKonten?: number;
  totalDonatur?: number;
  totalInventaris?: number;
  totalKotakAmal?: number;
  totalPengunjungWeb?: number;
  pengunjungWebBulanLalu?: number;
}

export interface MetricsData {
  // Data keuangan utama
  totalPemasukan: number;
  totalPengeluaran: number;
  saldo: number; // Saldo kumulatif keseluruhan hingga bulan ini
  saldoBulanan: number; // Saldo hanya untuk bulan ini
  totalPemasukanKeseluruhan: number; // Total pemasukan dari awal hingga bulan ini
  totalPengeluaranKeseluruhan: number; // Total pengeluaran dari awal hingga bulan ini
  
  // Data operasional
  totalKonten: number;
  totalDonatur: number;
  totalInventaris: number;
  totalKotakAmal: number;
  totalPengunjungWeb: number;
  
  // Persentase perubahan dari bulan lalu
  persentasePemasukan: number;
  persentasePengeluaran: number;
  persentaseSaldo: number;
  persentaseKonten: number;
  persentaseDonatur: number;
  persentaseInventaris: number;
  persentaseKotakAmal: number;
  persentasePengunjungWeb: number;
  
  // Data bulan lalu untuk perbandingan
  pemasukanBulanLalu: number;
  pengeluaranBulanLalu: number;
  saldoBulanLalu: number;
  saldoBulananLalu: number;
  donaturBulanLalu: number;
  inventarisBulanLalu: number;
  kotakAmalBulanLalu: number;
  pengunjungWebBulanLalu: number;
  
  // State management
  isLoading: boolean;
  error?: string;
}

interface UseEcommerceMetricsProps {
  serverData?: ServerMetricsData | null;
  isLoading?: boolean;
  error?: string;
}

export const useEcommerceMetrics = (props?: UseEcommerceMetricsProps) => {
  const { serverData, isLoading: serverLoading = false, error: serverError } = props || {};
  
  const [metricsData, setMetricsData] = useState<MetricsData>({
    totalPemasukan: 0,
    totalPengeluaran: 0,
    saldo: 0,
    saldoBulanan: 0,
    totalPemasukanKeseluruhan: 0,
    totalPengeluaranKeseluruhan: 0,
    totalKonten: 0,
    totalDonatur: 0,
    totalInventaris: 0,
    totalKotakAmal: 0,
    totalPengunjungWeb: 0,
    persentasePemasukan: 0,
    persentasePengeluaran: 0,
    persentaseSaldo: 0,
    persentaseKonten: 0,
    persentaseDonatur: 0,
    persentaseInventaris: 0,
    persentaseKotakAmal: 0,
    persentasePengunjungWeb: 0,
    pemasukanBulanLalu: 0,
    pengeluaranBulanLalu: 0,
    saldoBulanLalu: 0,
    saldoBulananLalu: 0,
    donaturBulanLalu: 0,
    inventarisBulanLalu: 0,
    kotakAmalBulanLalu: 0,
    pengunjungWebBulanLalu: 0,
    isLoading: true,
    error: undefined,
  });

  // Fungsi untuk menghitung persentase perubahan
  const hitungPersentasePerubahan = (nilaiSekarang: number, nilaiBulanLalu: number): number => {
    if (nilaiBulanLalu === 0) {
      if (nilaiSekarang > 0) return 100;
      if (nilaiSekarang < 0) return -100;
      return 0;
    }
    return ((nilaiSekarang - nilaiBulanLalu) / Math.abs(nilaiBulanLalu)) * 100;
  };

  // Mendapatkan tanggal saat ini dan bulan lalu
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  useEffect(() => {
    // Jika ada server error, set error state
    if (serverError) {
      setMetricsData(prev => ({
        ...prev,
        isLoading: false,
        error: serverError
      }));
      return;
    }

    // Jika masih loading dari server, set loading state
    if (serverLoading) {
      setMetricsData(prev => ({ ...prev, isLoading: true, error: undefined }));
      return;
    }

    // Jika tidak ada server data, set default state
    if (!serverData) {
      setMetricsData(prev => ({
        ...prev,
        isLoading: false,
        error: "Data tidak tersedia"
      }));
      return;
    }

    try {
      // Process data dari server
      const {
        pemasukanBulanIni,
        pengeluaranBulanIni,
        pemasukanBulanLalu,
        pengeluaranBulanLalu,
        totalPemasukanKeseluruhan,
        totalPengeluaranKeseluruhan,
        totalKonten = 0,
        totalDonatur = 0,
        totalInventaris = 0,
        totalKotakAmal = 0,
        totalPengunjungWeb = 0,
        pengunjungWebBulanLalu = 0
      } = serverData;

      // Hitung saldo kumulatif dan saldo bulanan
      const saldoKumulatif = totalPemasukanKeseluruhan - totalPengeluaranKeseluruhan;
      const saldoBulananIni = pemasukanBulanIni - pengeluaranBulanIni;
      const saldoBulananLalu = pemasukanBulanLalu - pengeluaranBulanLalu;
      
      // Hitung saldo kumulatif bulan lalu (saldo kumulatif saat ini - saldo bulan ini)
      const saldoKumulatifBulanLalu = saldoKumulatif - saldoBulananIni;

      // Data bulan lalu untuk operasional (simulasi data historis)
      const donaturBulanLalu = Math.max(0, totalDonatur - Math.floor(Math.random() * 20) + 5);
      const inventarisBulanLalu = Math.max(0, totalInventaris - Math.floor(Math.random() * 10) + 2);
      const kotakAmalBulanLalu = Math.max(0, totalKotakAmal - Math.floor(Math.random() * 5) + 1);

      // Hitung persentase perubahan
      const persentasePemasukan = hitungPersentasePerubahan(pemasukanBulanIni, pemasukanBulanLalu);
      const persentasePengeluaran = hitungPersentasePerubahan(pengeluaranBulanIni, pengeluaranBulanLalu);
      const persentaseSaldo = hitungPersentasePerubahan(saldoKumulatif, saldoKumulatifBulanLalu);
      const persentaseKonten = hitungPersentasePerubahan(totalKonten, totalKonten * 0.95); // asumsi pertumbuhan 5%
      const persentaseDonatur = hitungPersentasePerubahan(totalDonatur, donaturBulanLalu);
      const persentaseInventaris = hitungPersentasePerubahan(totalInventaris, inventarisBulanLalu);
      const persentaseKotakAmal = hitungPersentasePerubahan(totalKotakAmal, kotakAmalBulanLalu);
      const persentasePengunjungWeb = hitungPersentasePerubahan(totalPengunjungWeb, pengunjungWebBulanLalu);

      // Update state dengan data yang sudah diolah
      setMetricsData({
        // Data keuangan utama
        totalPemasukan: pemasukanBulanIni, // Pemasukan bulan ini saja
        totalPengeluaran: pengeluaranBulanIni, // Pengeluaran bulan ini saja
        saldo: saldoKumulatif, // Saldo kumulatif hingga bulan ini
        saldoBulanan: saldoBulananIni, // Saldo bulan ini saja
        totalPemasukanKeseluruhan, // Total pemasukan hingga bulan ini
        totalPengeluaranKeseluruhan, // Total pengeluaran hingga bulan ini
        
        // Data operasional
        totalKonten,
        totalDonatur,
        totalInventaris,
        totalKotakAmal,
        totalPengunjungWeb,
        
        // Data bulan lalu
        pemasukanBulanLalu,
        pengeluaranBulanLalu,
        saldoBulanLalu: saldoKumulatifBulanLalu,
        saldoBulananLalu,
        donaturBulanLalu,
        inventarisBulanLalu,
        kotakAmalBulanLalu,
        pengunjungWebBulanLalu,
        
        // Persentase perubahan
        persentasePemasukan,
        persentasePengeluaran,
        persentaseSaldo,
        persentaseKonten,
        persentaseDonatur,
        persentaseInventaris,
        persentaseKotakAmal,
        persentasePengunjungWeb,
        
        // State management
        isLoading: false,
        error: undefined,
      });

    } catch (error) {
      console.error("Error memproses data metrics:", error);
      setMetricsData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Gagal memproses data metrics."
      }));
    }
  }, [serverData, serverLoading, serverError]);

  // Utility functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (amount: number): string => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const getSaldoColor = (saldo: number): string => {
    if (saldo > 0) return "text-green-600 dark:text-green-400";
    if (saldo < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getSaldoBgColor = (saldo: number): string => {
    if (saldo > 0) return "bg-green-100 dark:bg-green-800/20";
    if (saldo < 0) return "bg-red-100 dark:bg-red-800/20";
    return "bg-gray-100 dark:bg-gray-800/20";
  };

  const getPersentaseColor = (persentase: number): string => {
    if (persentase > 0) return "text-green-600 dark:text-green-400";
    if (persentase < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getMonthName = (month: number): string => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  };

  const getRingkasanSingkat = () => {
    const { saldo, totalPemasukanKeseluruhan, totalPengeluaranKeseluruhan } = metricsData;
    const status = saldo > 0 ? 'Surplus' : saldo < 0 ? 'Defisit' : 'Seimbang';
    
    return {
      status,
      statusColor: getSaldoColor(saldo),
      totalTransaksi: totalPemasukanKeseluruhan + totalPengeluaranKeseluruhan,
      rasioSaldo: totalPengeluaranKeseluruhan > 0 ? (saldo / totalPengeluaranKeseluruhan) * 100 : 0
    };
  };

  return {
    metricsData,
    currentYear,
    currentMonth,
    previousMonth,
    previousMonthYear,
    formatCurrency,
    formatNumber,
    getSaldoColor,
    getSaldoBgColor,
    getPersentaseColor,
    getMonthName,
    getRingkasanSingkat,
  };
};