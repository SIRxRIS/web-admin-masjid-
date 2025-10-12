// src/components/excel-export/laporan-jumat-export.ts
import ExcelJS from 'exceljs';
import { LaporanJumatExport } from '@/lib/schema/laporan/laporan-jumat-schema';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export async function exportLaporanJumatToExcel(data: LaporanJumatExport) {
  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    
    // Create worksheet
    const sheetName = `Laporan Jumat ${format(data.tanggalLaporan, 'dd-MM-yyyy')}`;
    const worksheet = workbook.addWorksheet(sheetName);
    
    // Set column widths
    worksheet.columns = [
      { width: 5 },   // A - No/Index
      { width: 40 },  // B - Description
      { width: 15 },  // C - Amount
      { width: 15 },  // D - Additional
    ];
    
    // Add data to worksheet
    addLaporanJumatData(worksheet, data);
    
    // Apply styling
    applyLaporanJumatStyling(worksheet);
    
    // Generate filename
    const filename = `Laporan_Jumat_${format(data.tanggalLaporan, 'dd_MM_yyyy')}.xlsx`;
    
    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error exporting laporan jumat to Excel:', error);
    throw new Error('Gagal mengekspor laporan ke Excel');
  }
}

function addLaporanJumatData(worksheet: ExcelJS.Worksheet, data: LaporanJumatExport) {
  let currentRow = 1;
  
  // Header with logo and title (space reserved for letterhead)
  worksheet.addRow(['', '', '', '']);
  worksheet.addRow(['', '', '', '']);
  worksheet.addRow(['', '', '', '']);
  worksheet.addRow(['', 'MASJID JAWAAHIRUZZARQA VILA MUTIARA BIRU', '', '']);
  worksheet.addRow(['', 'KOMPLEKS VILA MUTIARA BIRU , ORW X KEL. BULUKROKENG', '', '']);
  worksheet.addRow(['', 'KECAMATAN BIRINGKANAYA KOTA MAKASSAR', '', '']);
  worksheet.addRow(['', 'Sekretariat : Vila Mutiara Biru XVIII No. 1 Makassar', '', '']);
  worksheet.addRow(['', '', '', '']);
  
  // Title
  worksheet.addRow(['', 'PENYAMPAIAN LAPORAN PELAKSANAAN SHOLAT JUMAT', '', '']);
  worksheet.addRow(['', `Jumat, ${format(data.tanggalLaporan, 'dd MMMM yyyy', { locale: id })}`, '', '']);
  worksheet.addRow(['', '', '', '']);
  
  // Section I: Laporan Keuangan Masjid
  worksheet.addRow(['Penyampaian I. Laporan Keuangan Masjid', '', '', '']);
  
  // A. Saldo Kas Jum'at lalu
  worksheet.addRow(['A', 'Saldo Kas Jum\'at lalu :', 'Rp', formatNumber(data.saldoKasJumatLalu)]);
  
  // B. Penerimaan
  worksheet.addRow(['B', 'Penerimaan :', '', '']);
  worksheet.addRow(['', '1', 'Kotak Amal Jumat, ' + format(data.tanggalLaporan, 'dd MMMM yyyy', { locale: id }), 'Rp', formatNumber(data.kotakAmalJumat)]);
  worksheet.addRow(['', '2', 'Sumbangan/ Donasi dari :', '', '']);
  
  // Add donations with numbering
  data.sumbangan.forEach((item, index) => {
    worksheet.addRow(['', '', `${index + 1}) ${item.nama}`, 'Rp', formatNumber(item.jumlah)]);
  });
  
  // Add empty rows for donations (up to 20 total)
  const remainingDonations = 20 - data.sumbangan.length;
  for (let i = 0; i < remainingDonations; i++) {
    worksheet.addRow(['', '', `${data.sumbangan.length + i + 1})`, '', '']);
  }
  
  // Total Penerimaan
  worksheet.addRow(['', '', '', 'Jumlah Pemasukan', 'Rp', formatNumber(data.totalPenerimaan)]);
  
  // C. Pengeluaran
  worksheet.addRow(['C', 'Pengeluaran :', '', '']);
  
  // Add expenses
  data.pengeluaran.forEach((item, index) => {
    worksheet.addRow(['', `${index + 1}`, item.nama, 'Rp', formatNumber(item.jumlah)]);
  });
  
  // Add empty rows for expenses (up to 7 total)
  const remainingExpenses = 7 - data.pengeluaran.length;
  for (let i = 0; i < remainingExpenses; i++) {
    worksheet.addRow(['', `${data.pengeluaran.length + i + 1}`, '', '', '']);
  }
  
  // Total Pengeluaran
  worksheet.addRow(['', '', '', 'Jumlah Pengeluaran', 'Rp', formatNumber(data.totalPengeluaran)]);
  
  // D. Saldo Kas Hari ini
  worksheet.addRow(['D', 'Saldo Kas Hari ini', '', 'Rp', formatNumber(data.saldoKasHariIni)]);
  worksheet.addRow(['', 'Terdiri dari', '', '']);
  worksheet.addRow(['', '1', 'Kas BSI', 'Rp', formatNumber(data.kasBsi)]);
  worksheet.addRow(['', '2', 'Kas Bank Sulselbar', 'Rp', formatNumber(data.kasBankSulselbar)]);
  worksheet.addRow(['', '3', 'Kas Tunai', 'Rp', formatNumber(data.kasTunai)]);
  
  // Section II: Yang Bertindak Sebagai
  worksheet.addRow(['', '', '', '']);
  worksheet.addRow(['Penyampaian II. Yang Bertindak Sebagai', '', '', '']);
  worksheet.addRow(['', '1', `Khatib : ${data.khatib || ':'}`, '', '']);
  worksheet.addRow(['', '2', `Muadzdzin : ${data.muadzdzin || ':'}`, '', '']);
  worksheet.addRow(['', '3', `Imam : ${data.imam || ':'}`, '', '']);
  
  // Date and location
  worksheet.addRow(['', '', '', '']);
  worksheet.addRow(['', '', '', `Makassar, ${format(data.tanggalLaporan, 'dd MMMM yyyy', { locale: id })}`]);
  
  // Signatures
  worksheet.addRow(['', '', '', '']);
  worksheet.addRow(['Mengetahui,', '', '', 'Bendahara']);
  worksheet.addRow(['Ketua Pengurus', '', '', '']);
  worksheet.addRow(['', '', '', '']);
  worksheet.addRow(['', '', '', '']);
  worksheet.addRow(['', '', '', '']);
  worksheet.addRow([data.ketuaPengurus, '', '', data.bendahara]);
}

function formatNumber(num: number): string {
  return num.toLocaleString('id-ID');
}

function applyLaporanJumatStyling(worksheet: ExcelJS.Worksheet) {
  // Apply basic styling to all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      // Default cell style
      cell.font = { name: 'Arial', size: 11 };
      cell.alignment = { horizontal: 'left', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      // Header styling (rows 1-7)
      if (rowNumber <= 7) {
        cell.font = { name: 'Arial', size: 12, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
      
      // Amount columns (currency formatting)
      if (colNumber === 4 || colNumber === 5) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        if (typeof cell.value === 'number') {
          cell.numFmt = '#,##0';
        }
      }
      
      // Bold for section headers and totals
      const cellValue = cell.value;
      if (typeof cellValue === 'string' && (
        cellValue.includes('Penyampaian') ||
        cellValue.includes('Saldo Kas') ||
        cellValue.includes('Penerimaan') ||
        cellValue.includes('Pengeluaran') ||
        cellValue.includes('Jumlah') ||
        cellValue.includes('Total')
      )) {
        cell.font = { ...cell.font, bold: true };
      }
    });
  });
  
  // Merge cells for header
  worksheet.mergeCells('B4:D4'); // Title row 1
  worksheet.mergeCells('B5:D5'); // Title row 2
  worksheet.mergeCells('B6:D6'); // Title row 3
  worksheet.mergeCells('B7:D7'); // Title row 4
  worksheet.mergeCells('B9:D9'); // Main title
  worksheet.mergeCells('B10:D10'); // Date
  
  // Add note about letterhead
  worksheet.getCell('B1').note = 'Kop surat masjid tersedia di: public/images/kop-masjid.png\nSilakan tambahkan secara manual saat mencetak.';
}