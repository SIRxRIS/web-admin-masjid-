// src/components/pdf-export/pengeluaran-pdf.ts
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import type { PengeluaranData, PengeluaranTahunanData } from '@/lib/schema/pengeluaran/schema';

type ActiveTab = 'riwayat-tahunan' | 'pengeluaran-bulanan';
type PaperFormat = 'a4' | 'f4';

export async function exportPengeluaranTabsToPDF(
  data: (PengeluaranData | PengeluaranTahunanData)[],
  activeTab: ActiveTab,
  year: string,
  paper: PaperFormat = 'a4'
) {
  try {
    const pdf = new jsPDF('l', 'mm', getJsPdfFormat(paper));
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 12;
    let currentY = margin;

    // Header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    const title = getTitle(activeTab, year);
    const titleX = (pageWidth - pdf.getTextWidth(title)) / 2;
    pdf.text(title, titleX, currentY + 6);
    currentY += 12;

    // Subheader
    const now = new Date();
    const monthName = getIndonesianMonthName(now.getMonth());
    const subTitle = `Bulan ${monthName} Tahun ${now.getFullYear()}`;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    const subTitleX = (pageWidth - pdf.getTextWidth(subTitle)) / 2;
    pdf.text(subTitle, subTitleX, currentY + 5);
    currentY += 12;

    if (activeTab === 'riwayat-tahunan') {
      renderTahunanTable(pdf, data as PengeluaranTahunanData[], margin, currentY);
    } else {
      renderBulananTable(pdf, data as PengeluaranData[], margin, currentY);
    }

    const fileName = `${sanitizeFileName(title)}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
    pdf.save(fileName);
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF pengeluaran:', error);
    throw new Error(`Gagal membuat PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function renderTable(
  pdf: jsPDF,
  headers: string[],
  rows: Array<string[]>,
  margin: number,
  startY: number
) {
  let colWidths = getColumnWidths(headers);
  const rowHeight = 7;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let maxY = pageHeight - margin;

  const totalWidth = colWidths.reduce((s: number, w: number) => s + w, 0);
  const fitWidth = pageWidth - margin * 2;
  let scale = 1;
  if (totalWidth > fitWidth) {
    scale = fitWidth / totalWidth;
    colWidths = colWidths.map((w: number) => Math.max(8, w * scale));
  }
  const tableWidth = colWidths.reduce((s: number, w: number) => s + w, 0);
  const startXBase = (pageWidth - tableWidth) / 2;

  // Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  let x = startXBase;
  let y = startY;
  headers.forEach((h, i) => {
    pdf.rect(x, y, colWidths[i], rowHeight);
    pdf.text(h, x + 2, y + 5);
    x += colWidths[i];
  });
  y += rowHeight;

  // Rows
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  rows.forEach((row) => {
    if (y + rowHeight > maxY) {
      pdf.addPage(undefined, 'l');
      const ph = pdf.internal.pageSize.getHeight();
      maxY = ph - margin;
      y = margin;
      x = startXBase;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      headers.forEach((h, i) => {
        pdf.rect(x, y, colWidths[i], rowHeight);
        pdf.text(h, x + 2, y + 5);
        x += colWidths[i];
      });
      y += rowHeight;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
    }

    x = startXBase;
    row.forEach((val, i) => {
      pdf.rect(x, y, colWidths[i], rowHeight);
      const maxChars = Math.floor(colWidths[i] / 2);
      const txt = val.length > maxChars ? val.slice(0, maxChars - 3) + '...' : val;
      pdf.text(txt, x + 1, y + 5);
      x += colWidths[i];
    });
    y += rowHeight;
  });
}

function renderTahunanTable(pdf: jsPDF, data: PengeluaranTahunanData[], margin: number, startY: number) {
  const headers = ['Nama Pengeluaran','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Des','Total'];
  const rows = data.map((row) => {
    const total = (row.jan||0)+(row.feb||0)+(row.mar||0)+(row.apr||0)+(row.mei||0)+(row.jun||0)+(row.jul||0)+(row.aug||0)+(row.sep||0)+(row.okt||0)+(row.nov||0)+(row.des||0);
    return [
      String(row.pengeluaran),
      ...['jan','feb','mar','apr','mei','jun','jul','aug','sep','okt','nov','des'].map((m)=>formatNumber((row as any)[m]||0)),
      formatNumber(total)
    ];
  });
  renderTable(pdf, headers, rows, margin, startY);
}

function renderBulananTable(pdf: jsPDF, data: PengeluaranData[], margin: number, startY: number) {
  const headers = ['No','Nama','Tanggal','Tahun','Jumlah','Keterangan'];
  const rows = data.map((row, idx) => [
    String(row.no ?? idx + 1),
    String(row.nama || ''),
    formatDate(row.tanggal),
    String(row.tahun || ''),
    formatNumber(row.jumlah || 0),
    String(row.keterangan || '')
  ]);
  renderTable(pdf, headers, rows, margin, startY);
}

function getJsPdfFormat(paper: PaperFormat): string | [number, number] {
  return paper === 'f4' ? [210, 330] : 'a4';
}

function getTitle(tab: ActiveTab, year: string): string {
  return tab === 'riwayat-tahunan' ? `LAPORAN PENGELUARAN TAHUN ${year}` : `PENGELUARAN BULANAN TAHUN ${year}`;
}

function getIndonesianMonthName(monthIndex: number): string {
  const names = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return names[monthIndex] || '';
}

function sanitizeFileName(name: string): string {
  return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '');
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: any): string {
  try {
    const date = typeof d === 'string' ? new Date(d) : d;
    if (!date || isNaN(date.getTime())) return String(d || '');
    return format(date, 'dd/MM/yyyy');
  } catch {
    return String(d || '');
  }
}

// Hitung lebar kolom berdasarkan header, dengan heuristik sederhana
function getColumnWidths(headers: string[]): number[] {
  return headers.map((h) => {
    const name = h.trim();
    if (name === 'No') return 12;
    if (name === 'Tanggal') return 22;
    if (name === 'Tahun') return 18;
    if (name === 'Jumlah' || name === 'Total') return 22;
    // Bulan-bulan: cukup kecil, tapi tetap terbaca
    if (['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Des'].includes(name)) return 16;
    // Nama/Keterangan biasanya panjang
    if (/Nama|Pengeluaran|Keterangan/i.test(name)) return 40;
    // Default: berdasarkan panjang teks
    const approx = Math.max(16, Math.min(28, name.length * 2));
    return approx;
  });
}