// src/components/pdf-export/inventaris-pdf.ts
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import type { InventarisData } from '@/lib/schema/inventaris/schema';

type PaperFormat = 'a4' | 'f4';

export async function exportInventarisToPDF(
  data: InventarisData[],
  year: string,
  paper: PaperFormat = 'a4'
) {
  try {
    const pdf = new jsPDF('l', 'mm', getJsPdfFormat(paper));
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 12;
    let currentY = margin;

    // Header: judul tengah
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    const title = `DAFTAR INVENTARIS TAHUN ${year}`;
    const titleX = (pageWidth - pdf.getTextWidth(title)) / 2;
    pdf.text(title, titleX, currentY + 6);
    currentY += 12;

    // Subheader konsisten
    const now = new Date();
    const monthName = getIndonesianMonthName(now.getMonth());
    const subTitle = `Bulan ${monthName} Tahun ${now.getFullYear()}`;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    const subTitleX = (pageWidth - pdf.getTextWidth(subTitle)) / 2;
    pdf.text(subTitle, subTitleX, currentY + 5);
    currentY += 12;

    // Tabel
    const headers = ['No','Nama Barang','Kategori','Jumlah','Satuan','Lokasi','Kondisi','Tanggal Masuk','Tahun','Keterangan'];
    const rows = data.map((item, idx) => [
      String(item.no ?? idx + 1),
      String(item.namaBarang ?? ''),
      String(item.kategori ?? ''),
      String(item.jumlah ?? 0),
      String(item.satuan ?? ''),
      String(item.lokasi ?? ''),
      String(item.kondisi ?? ''),
      formatDate(item.tanggalMasuk),
      String(item.tahun ?? ''),
      String(item.keterangan ?? '')
    ]);

    renderTable(pdf, headers, rows, margin, currentY);

    const fileName = `${sanitizeFileName(title)}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
    pdf.save(fileName);
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF inventaris:', error);
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

  const totalWidth = colWidths.reduce((s, w) => s + w, 0);
  const fitWidth = pageWidth - margin * 2;
  let scale = 1;
  if (totalWidth > fitWidth) {
    scale = fitWidth / totalWidth;
    colWidths = colWidths.map((w) => Math.max(8, w * scale));
  }
  const tableWidth = colWidths.reduce((s, w) => s + w, 0);
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

  // Rows with page break + header redraw
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  rows.forEach((row) => {
    if (y + rowHeight > maxY) {
      pdf.addPage(undefined, 'l');
      // Recalculate page dims in case format differs
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      maxY = ph - margin;
      y = margin;
      x = startXBase; // startXBase tetap valid karena lebar sama di format halaman berikutnya
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
  return headers.map((h) => {
    if (/^(No)$/i.test(h)) return 10;
    if (/^(Nama Barang|Lokasi|Keterangan)$/i.test(h)) return 30;
    if (/^(Kategori)$/i.test(h)) return 22;
    if (/^(Jumlah)$/i.test(h)) return 14;
    if (/^(Satuan)$/i.test(h)) return 16;
    if (/^(Kondisi)$/i.test(h)) return 18;
    if (/^(Tanggal Masuk|Tahun)$/i.test(h)) return 18;
    return 16;
  });
}

function getJsPdfFormat(paper: PaperFormat): string | [number, number] {
  return paper === 'f4' ? [210, 330] : 'a4';
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

function formatDate(d: any): string {
  try {
    const date = typeof d === 'string' ? new Date(d) : d;
    if (!date || isNaN(date.getTime())) return String(d || '');
    return format(date, 'dd/MM/yyyy');
  } catch {
    return String(d || '');
  }
}