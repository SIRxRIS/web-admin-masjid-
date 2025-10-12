// src/lib/csv.ts
import { DonaturData } from '@/lib/schema/pemasukan/schema';

export function exportToCSV(data: DonaturData[], filename: string = 'data-donasi.csv') {
  try {
    // Header CSV
    const headers = [
      'No',
      'Nama Donatur',
      'Alamat', 
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
      'Infaq',
      'Total',
      'Tahun'
    ];

    // Transformasi data
    const csvData = data.map((item, index) => [
      item.no || index + 1,
      `"${item.nama}"`, // Bungkus dengan quotes untuk menghindari masalah dengan koma
      `"${item.alamat}"`,
      item.jan,
      item.feb,
      item.mar,
      item.apr,
      item.mei,
      item.jun,
      item.jul,
      item.aug,
      item.sep,
      item.okt,
      item.nov,
      item.des,
      item.infaq,
      (item.jan + item.feb + item.mar + item.apr + item.mei + item.jun + 
       item.jul + item.aug + item.sep + item.okt + item.nov + item.des + item.infaq),
      item.tahun
    ]);

    // Gabungkan header dan data
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // Buat dan download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    console.log(`Data berhasil diekspor ke ${filename}`);
    return true;
  } catch (error) {
    console.error('Error saat mengekspor ke CSV:', error);
    throw new Error('Gagal mengekspor data ke CSV');
  }
}

// Fungsi untuk mengekspor data yang sudah terintegrasi ke CSV
export function exportIntegratedDataToCSV(data: any[], filename: string = 'riwayat-tahunan.csv') {
  try {
    const headers = [
      'No',
      'Nama',
      'Alamat',
      'Tipe',
      'Januari',
      'Februari', 
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
      'Infaq',
      'Total'
    ];

    const csvData = data.map((item, index) => [
      item.no || index + 1,
      `"${item.nama}"`,
      `"${item.alamat || item.lokasi || ''}"`,
      `"${item.sourceType === 'donatur' ? 'Donatur' : 
           item.sourceType === 'kotakAmal' ? 'Kotak Amal' :
           item.sourceType === 'donasiKhusus' ? 'Donasi Khusus' :
           item.sourceType === 'kotakAmalMasjid' ? 'Kotak Amal Masjid' : 'Lainnya'}"`,
      item.jan || 0,
      item.feb || 0,
      item.mar || 0,
      item.apr || 0,
      item.mei || 0,
      item.jun || 0,
      item.jul || 0,
      item.aug || 0,
      item.sep || 0,
      item.okt || 0,
      item.nov || 0,
      item.des || 0,
      item.infaq || 0,
      item.total || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    return true;
  } catch (error) {
    console.error('Error saat mengekspor data terintegrasi ke CSV:', error);
    throw new Error('Gagal mengekspor data ke CSV');
  }
}

// Export function for pengeluaran data
export function exportPengeluaranToCSV(data: any[], filename: string = 'data-pengeluaran.csv') {
  try {
    const headers = [
      'No',
      'Nama Pengeluaran',
      'Tanggal',
      'Tahun',
      'Jumlah',
      'Keterangan'
    ];

    const csvData = data.map((item, index) => [
      item.no || index + 1,
      `"${item.nama || item.pengeluaran || ''}"`,
      `"${item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : ''}"`,
      item.tahun || '',
      item.jumlah || 0,
      `"${item.keterangan || ''}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    return true;
  } catch (error) {
    console.error('Error saat mengekspor data pengeluaran ke CSV:', error);
    throw new Error('Gagal mengekspor data pengeluaran ke CSV');
  }
}

// Export function for pengeluaran tahunan data
export function exportPengeluaranTahunanToCSV(data: any[], filename: string = 'pengeluaran-tahunan.csv') {
  try {
    const headers = [
      'No',
      'Pengeluaran',
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember'
    ];

    const csvData = data.map((item, index) => [
      item.no || index + 1,
      `"${item.pengeluaran || ''}"`,
      item.jan || 0,
      item.feb || 0,
      item.mar || 0,
      item.apr || 0,
      item.mei || 0,
      item.jun || 0,
      item.jul || 0,
      item.aug || 0,
      item.sep || 0,
      item.okt || 0,
      item.nov || 0,
      item.des || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    return true;
  } catch (error) {
    console.error('Error saat mengekspor data pengeluaran tahunan ke CSV:', error);
    throw new Error('Gagal mengekspor data pengeluaran tahunan ke CSV');
  }
}

// Fungsi helper untuk format mata uang dalam export
export function formatCurrencyForExport(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}