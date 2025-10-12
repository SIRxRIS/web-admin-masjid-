// src/components/pdf-export/laporan-keuangan-pdf.ts
import jsPDF from 'jspdf';
import { RekapPemasukan, RekapPengeluaran } from '@/lib/schema/laporan/schema';
import { format } from 'date-fns';

type PaperFormat = 'a4' | 'f4';

export async function exportLaporanKeuanganToPDF(
  pemasukanData: RekapPemasukan[],
  pengeluaranData: RekapPengeluaran[],
  year: string,
  paper: PaperFormat = 'a4'
) {
  try {
    // Create new PDF document
    const pdf = new jsPDF('l', 'mm', getJsPdfFormat(paper)); // Landscape orientation; supports A4/F4
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set margins
    const margin = 12;
    const contentWidth = pageWidth - (margin * 2);
    const maxY = pageHeight - margin;
    
    let currentY = margin;
    
    // Add header
    currentY = addHeader(pdf, currentY, pageWidth, margin, year);
    // Add subheader (bulan/tahun saat ekspor) untuk konsistensi dengan pemasukan-pdf
    const now = new Date();
    const monthName = getIndonesianMonthName(now.getMonth());
    const subTitle = `Bulan ${monthName} Tahun ${now.getFullYear()}`;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    const subTitleX = (pageWidth - pdf.getTextWidth(subTitle)) / 2;
    pdf.text(subTitle, subTitleX, currentY + 5);
    currentY += 15;
    
    // Add income section
    currentY = addIncomeSection(pdf, currentY, margin, contentWidth, pemasukanData, maxY);
    currentY += 10;
    
    // Add expense section
    currentY = addExpenseSection(pdf, currentY, margin, contentWidth, pengeluaranData, maxY);
    currentY += 10;
    
    // Add summary section
    addSummarySection(pdf, currentY, margin, contentWidth, pemasukanData, pengeluaranData);
    
    // Save the PDF
    const fileName = `Laporan_Keuangan_${year}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
    pdf.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Gagal membuat PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function addHeader(pdf: jsPDF, startY: number, pageWidth: number, _margin: number, year: string): number {
  // Only show the centered report title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  const title = `LAPORAN KEUANGAN TAHUN ${year}`;
  const titleWidth = pdf.getTextWidth(title);
  const titleX = (pageWidth - titleWidth) / 2;
  pdf.text(title, titleX, startY + 6);
  return startY + 12;
}

function addIncomeSection(
  pdf: jsPDF,
  startY: number,
  margin: number,
  contentWidth: number,
  data: RekapPemasukan[],
  maxY: number
): number {
  let currentY = startY;
  
  // Section title
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('REKAPITULASI PEMASUKAN', margin, currentY);
  currentY += 8;
  
  // Table headers
  const headers = ['Sumber', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des', 'Total'];
  let colWidths = [34, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 22];

  // Hitung skala agar tabel muat dan berada di tengah
  const pageWidth = pdf.internal.pageSize.getWidth();
  const fitWidth = pageWidth - margin * 2;
  const totalWidth = colWidths.reduce((s, w) => s + w, 0);
  let scale = 1;
  if (totalWidth > fitWidth) {
    scale = fitWidth / totalWidth;
    colWidths = colWidths.map((w) => Math.max(8, w * scale));
  }
  const tableWidth = colWidths.reduce((s, w) => s + w, 0);
  const startXBase = (pageWidth - tableWidth) / 2;
  
  // Draw table header
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  
  let x = startXBase;
  headers.forEach((header, index) => {
    pdf.rect(x, currentY, colWidths[index], 7);
    pdf.text(header, x + 2, currentY + 5);
    x += colWidths[index];
  });
  currentY += 7;
  
  // Draw table data
  pdf.setFont('helvetica', 'normal');
  data.forEach((row) => {
    x = startXBase;
    const values = [
      getSumberLabel(row.sumber),
      formatCurrency(row.jan),
      formatCurrency(row.feb),
      formatCurrency(row.mar),
      formatCurrency(row.apr),
      formatCurrency(row.mei),
      formatCurrency(row.jun),
      formatCurrency(row.jul),
      formatCurrency(row.aug),
      formatCurrency(row.sep),
      formatCurrency(row.okt),
      formatCurrency(row.nov),
      formatCurrency(row.des),
      formatCurrency(row.total)
    ];
    
    values.forEach((value, index) => {
      pdf.rect(x, currentY, colWidths[index], 7);
      // Truncate text if too long
      const maxChars = Math.floor(colWidths[index] / 2);
      const displayText = value.length > maxChars ? value.substring(0, maxChars - 3) + '...' : value;
      pdf.text(displayText, x + 1, currentY + 5);
      x += colWidths[index];
    });
    currentY += 7;
  });
  
  // Add total row
  const totalPemasukan = data.reduce((sum, row) => sum + row.total, 0);
  pdf.setFont('helvetica', 'bold');
  x = startXBase;
  pdf.rect(x, currentY, colWidths[0], 7);
  pdf.text('TOTAL PEMASUKAN', x + 2, currentY + 5);
  const leftWidth = colWidths.slice(0, -1).reduce((sum, width) => sum + width, 0);
  x += leftWidth;
  pdf.rect(x, currentY, colWidths[colWidths.length - 1], 7);
  pdf.text(formatCurrency(totalPemasukan), x + 2, currentY + 5);
  currentY += 7;

  return currentY;
}

function addExpenseSection(
  pdf: jsPDF,
  startY: number,
  margin: number,
  contentWidth: number,
  data: RekapPengeluaran[],
  maxY: number
): number {
  let currentY = startY;
  
  // Section title
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('REKAPITULASI PENGELUARAN', margin, currentY);
  currentY += 8;
  
  // Table headers
  const headers = ['Nama Pengeluaran', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des', 'Total'];
  let colWidths = [34, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 22];

  // Hitung skala dan posisi tengah
  const pageWidth = pdf.internal.pageSize.getWidth();
  const fitWidth = pageWidth - margin * 2;
  const totalWidth = colWidths.reduce((s, w) => s + w, 0);
  let scale = 1;
  if (totalWidth > fitWidth) {
    scale = fitWidth / totalWidth;
    colWidths = colWidths.map((w) => Math.max(8, w * scale));
  }
  const tableWidth = colWidths.reduce((s, w) => s + w, 0);
  const startXBase = (pageWidth - tableWidth) / 2;
  
  // Draw table header
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  
  let x = startXBase;
  headers.forEach((header, index) => {
    pdf.rect(x, currentY, colWidths[index], 7);
    pdf.text(header, x + 2, currentY + 5);
    x += colWidths[index];
  });
  currentY += 7;
  
  // Draw table data
  pdf.setFont('helvetica', 'normal');
  data.forEach((row) => {
    x = startXBase;
    const values = [
      row.nama,
      formatCurrency(row.jan),
      formatCurrency(row.feb),
      formatCurrency(row.mar),
      formatCurrency(row.apr),
      formatCurrency(row.mei),
      formatCurrency(row.jun),
      formatCurrency(row.jul),
      formatCurrency(row.aug),
      formatCurrency(row.sep),
      formatCurrency(row.okt),
      formatCurrency(row.nov),
      formatCurrency(row.des),
      formatCurrency(row.total)
    ];
    
    values.forEach((value, index) => {
      pdf.rect(x, currentY, colWidths[index], 7);
      // Truncate text if too long
      const maxChars = Math.floor(colWidths[index] / 2);
      const displayText = value.length > maxChars ? value.substring(0, maxChars - 3) + '...' : value;
      pdf.text(displayText, x + 1, currentY + 5);
      x += colWidths[index];
    });
    currentY += 7;
  });
  
  // Add total row
  const totalPengeluaran = data.reduce((sum, row) => sum + row.total, 0);
  pdf.setFont('helvetica', 'bold');
  x = startXBase;
  pdf.rect(x, currentY, colWidths[0], 7);
  pdf.text('TOTAL PENGELUARAN', x + 2, currentY + 5);
  const leftWidth = colWidths.slice(0, -1).reduce((sum, width) => sum + width, 0);
  x += leftWidth;
  pdf.rect(x, currentY, colWidths[colWidths.length - 1], 7);
  pdf.text(formatCurrency(totalPengeluaran), x + 2, currentY + 5);
  currentY += 7;

  return currentY;
}

function addSummarySection(
  pdf: jsPDF,
  startY: number,
  margin: number,
  contentWidth: number,
  pemasukanData: RekapPemasukan[],
  pengeluaranData: RekapPengeluaran[]
): void {
  let currentY = startY;
  
  // Section title
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RINGKASAN KEUANGAN', margin, currentY);
  currentY += 15;
  
  // Calculate totals
  const totalPemasukan = pemasukanData.reduce((sum, row) => sum + row.total, 0);
  const totalPengeluaran = pengeluaranData.reduce((sum, row) => sum + row.total, 0);
  const selisih = totalPemasukan - totalPengeluaran;
  
  // Summary table
  pdf.setFontSize(10);
  const summaryData = [
    ['Total Pemasukan', formatCurrency(totalPemasukan)],
    ['Total Pengeluaran', formatCurrency(totalPengeluaran)],
    ['Selisih (Saldo)', formatCurrency(selisih)]
  ];
  
  const colWidth1 = 60;
  const colWidth2 = 50;
  
  summaryData.forEach((row, index) => {
    if (index === 2) {
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setFont('helvetica', 'normal');
    }
    
    // Draw cells
    pdf.rect(margin, currentY, colWidth1, 10);
    pdf.rect(margin + colWidth1, currentY, colWidth2, 10);
    
    // Add text
    pdf.text(row[0], margin + 2, currentY + 7);
    pdf.text(row[1], margin + colWidth1 + 2, currentY + 7);
    
    currentY += 10;
  });
  
  // Add status
  currentY += 10;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const status = selisih >= 0 ? 'SURPLUS' : 'DEFISIT';
  const statusColor = selisih >= 0 ? [0, 128, 0] : [255, 0, 0]; // Green for surplus, red for deficit
  
  pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Status: ${status}`, margin, currentY);
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
}

function getSumberLabel(sumber: string): string {
  const labels: Record<string, string> = {
    'DONATUR': 'Donatur',
    'KOTAK_AMAL_LUAR': 'Kotak Amal Luar',
    'KOTAK_AMAL_MASJID': 'Kotak Amal Masjid',
    'KOTAK_AMAL_JUMAT': 'Kotak Amal Jumat',
    'DONASI_KHUSUS': 'Donasi Khusus',
    'LAINNYA': 'Lainnya'
  };
  return labels[sumber] || sumber;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('IDR', '').trim();
}

function getJsPdfFormat(paper: PaperFormat): string | [number, number] {
  // jsPDF menerima string preset (mis. 'a4') atau array [width, height] dalam mm
  // F4 (Folio): 210 x 330 mm
  return paper === 'f4' ? [210, 330] : 'a4';
}

function getIndonesianMonthName(monthIndex: number): string {
  const names = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return names[monthIndex] || '';
}