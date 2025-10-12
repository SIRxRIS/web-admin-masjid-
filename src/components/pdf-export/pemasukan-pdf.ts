// src/components/pdf-export/pemasukan-pdf.ts
import jsPDF from 'jspdf';
import { format } from 'date-fns';

type ActiveTab = 'riwayat-tahunan' | 'donasi-khusus' | 'kotak-amal' | 'kotak-amal-masjid' | 'kotak-amal-jumat';
type PaperFormat = 'a4' | 'f4';

export async function exportPemasukanTabsToPDF(
  data: any[],
  activeTab: ActiveTab,
  year: string,
  paper: PaperFormat = 'a4'
) {
  try {
    const pdf = new jsPDF('l', 'mm', getJsPdfFormat(paper)); // Landscape, bisa A4/F4
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 12;
    let currentY = margin;

    // Header: hanya judul
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    const title = getTitle(activeTab, year);
    const titleX = (pageWidth - pdf.getTextWidth(title)) / 2;
    pdf.text(title, titleX, currentY + 6);
    currentY += 12;

    // Subheader: Bulan dan Tahun saat export
    const now = new Date();
    const monthName = getIndonesianMonthName(now.getMonth());
    const subTitle = `Bulan ${monthName} Tahun ${now.getFullYear()}`;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    const subTitleX = (pageWidth - pdf.getTextWidth(subTitle)) / 2;
    pdf.text(subTitle, subTitleX, currentY + 5);
    currentY += 10;

    // Render tabel sesuai tab aktif
    switch (activeTab) {
      case 'riwayat-tahunan':
        renderDonaturTable(pdf, data, margin, currentY);
        break;
      case 'donasi-khusus':
        renderDonasiKhususTable(pdf, data, margin, currentY);
        break;
      case 'kotak-amal':
        renderKotakAmalTable(pdf, data, margin, currentY);
        break;
      case 'kotak-amal-masjid':
      case 'kotak-amal-jumat':
        renderKotakAmalSederhanaTable(pdf, data, margin, currentY);
        break;
      default:
        renderGenericTable(pdf, data, margin, currentY);
        break;
    }

    const fileName = `${sanitizeFileName(title)}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
    pdf.save(fileName);
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF pemasukan:', error);
    throw new Error(`Gagal membuat PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function getJsPdfFormat(paper: PaperFormat): string | [number, number] {
  // jsPDF menerima string preset (mis. 'a4') atau array [width, height] dalam unit dokumen (mm)
  // F4 (Folio) umum di Indonesia: 210 x 330 mm
  if (paper === 'f4') return [210, 330];
  return 'a4';
}

function getTitle(tab: ActiveTab, year: string): string {
  switch (tab) {
    case 'riwayat-tahunan':
      return 'DONATUR MASJID JAWAAHIRUZZARQA MUTIARA BIRU';
    case 'donasi-khusus':
      return `LAPORAN DONASI KHUSUS TAHUN ${year}`;
    case 'kotak-amal':
      return `LAPORAN KOTAK AMAL TAHUN ${year}`;
    case 'kotak-amal-masjid':
      return `LAPORAN KOTAK AMAL MASJID TAHUN ${year}`;
    case 'kotak-amal-jumat':
      return `LAPORAN KOTAK AMAL JUMAT TAHUN ${year}`;
    default:
      return `LAPORAN PEMASUKAN TAHUN ${year}`;
  }
}

function getIndonesianMonthName(monthIndex: number): string {
  const names = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return names[monthIndex] || '';
}

function sanitizeFileName(name: string): string {
  return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '');
}

function renderTable(
  pdf: jsPDF,
  headers: string[],
  rows: Array<string[]>,
  margin: number,
  startY: number
) {
  // Hitung lebar kolom, scale agar muat, dan pusatkan
  let colWidths = getColumnWidths(headers);
  const rowHeight = 7;
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let maxY = pageHeight - margin;

  const totalWidth = colWidths.reduce((s, w) => s + w, 0);
  const fitWidth = pageWidth - margin * 2;
  let scale = 1;
  if (totalWidth > fitWidth) {
    scale = fitWidth / totalWidth;
    colWidths = colWidths.map((w) => Math.max(8, w * scale));
  }
  const tableWidth = colWidths.reduce((s, w) => s + w, 0);
  const startXBase = (pageWidth - tableWidth) / 2; // pusatkan

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
    // Page break if needed, with header redraw
    if (y + rowHeight > maxY) {
      pdf.addPage(undefined, 'l');
      const ph = pdf.internal.pageSize.getHeight();
      maxY = ph - margin;
      y = margin;
      x = startXBase;
      // redraw header on new page
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

function getColumnWidths(headers: string[]): number[] {
  // Simple heuristic: wider for text columns, narrow for months/numbers
  return headers.map((h) => {
    if (/^(No|Nama|Alamat|Lokasi|Keterangan)$/i.test(h)) return 28;
    if (/^(Tanggal|Bulan|Tahun|Tipe)$/i.test(h)) return 18;
    if (/^(Jumlah|Total|Infaq)$/i.test(h)) return 20;
    // months
    if (/^(Jan|Feb|Mar|Apr|Mei|Jun|Jul|Aug|Sep|Okt|Nov|Des)$/i.test(h)) return 14;
    return 16;
  });
}

function renderDonaturTable(pdf: jsPDF, data: any[], margin: number, startY: number) {
  const headers = ['No', 'Nama', 'Alamat', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des', 'Infaq', 'Total'];
  const rows = data.map((item: any, index: number) => {
    const total = (item.jan||0)+(item.feb||0)+(item.mar||0)+(item.apr||0)+(item.mei||0)+(item.jun||0)+(item.jul||0)+(item.aug||0)+(item.sep||0)+(item.okt||0)+(item.nov||0)+(item.des||0)+(item.infaq||0);
    return [
      String(item.no || index + 1),
      String(item.nama || ''),
      String(item.alamat || ''),
      ...['jan','feb','mar','apr','mei','jun','jul','aug','sep','okt','nov','des'].map((m)=>formatNumber(item[m]||0)),
      formatNumber(item.infaq||0),
      formatNumber(total)
    ];
  });
  renderTable(pdf, headers, rows, margin, startY);
}

function renderDonasiKhususTable(pdf: jsPDF, data: any[], margin: number, startY: number) {
  const headers = ['No', 'Nama', 'Tanggal', 'Bulan', 'Tahun', 'Jumlah', 'Keterangan'];
  const rows = data.map((item: any, index: number) => [
    String(item.no || index + 1),
    String(item.nama || ''),
    formatDate(item.tanggal),
    String(item.bulan || ''),
    String(item.tahun || ''),
    formatNumber(item.jumlah || 0),
    String(item.keterangan || '')
  ]);
  renderTable(pdf, headers, rows, margin, startY);
}

function renderKotakAmalTable(pdf: jsPDF, data: any[], margin: number, startY: number) {
  const headers = ['No', 'Nama', 'Lokasi', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des', 'Total', 'Tahun'];
  const rows = data.map((item: any, index: number) => {
    const total = ['jan','feb','mar','apr','mei','jun','jul','aug','sep','okt','nov','des'].reduce((s, m)=> s + (item[m]||0), 0);
    return [
      String(item.no || index + 1),
      String(item.nama || ''),
      String(item.lokasi || ''),
      ...['jan','feb','mar','apr','mei','jun','jul','aug','sep','okt','nov','des'].map((m)=>formatNumber(item[m]||0)),
      formatNumber(total),
      String(item.tahun || '')
    ];
  });
  renderTable(pdf, headers, rows, margin, startY);
}

function renderKotakAmalSederhanaTable(pdf: jsPDF, data: any[], margin: number, startY: number) {
  const headers = ['No', 'Tanggal', 'Jumlah', 'Tahun'];
  const rows = data.map((item: any, index: number) => [
    String(item.no || index + 1),
    formatDate(item.tanggal),
    formatNumber(item.jumlah || 0),
    String(item.tahun || '')
  ]);
  renderTable(pdf, headers, rows, margin, startY);
}

function renderGenericTable(pdf: jsPDF, data: any[], margin: number, startY: number) {
  const headers = Object.keys(data[0] || {});
  const rows = data.map((item: any) => headers.map((h) => String(item[h] ?? '')));
  renderTable(pdf, headers, rows, margin, startY);
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