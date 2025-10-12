// src/lib/excel.ts
import ExcelJS from 'exceljs';
import { DonaturData } from '@/lib/schema/pemasukan/schema';
import { formatRupiah } from '@/lib/utils';

// Interface untuk styling cell
interface CellStyle {
  font?: {
    bold?: boolean;
    color?: { argb: string };
    size?: number;
    name?: string;
  };
  fill?: {
    type: 'pattern';
    pattern: 'solid';
    fgColor?: { argb: string };
    bgColor?: { argb: string };
  };
  border?: {
    top?: { style: ExcelJS.BorderStyle; color?: { argb: string } };
    bottom?: { style: ExcelJS.BorderStyle; color?: { argb: string } };
    left?: { style: ExcelJS.BorderStyle; color?: { argb: string } };
    right?: { style: ExcelJS.BorderStyle; color?: { argb: string } };
  };
  alignment?: {
    horizontal?: 'left' | 'center' | 'right';
    vertical?: 'top' | 'middle' | 'bottom';
    wrapText?: boolean;
  };
  numFmt?: string;
}

// Fungsi untuk apply styling ke cell
function applyCellStyle(cell: ExcelJS.Cell, style: CellStyle) {
  if (style.font) {
    cell.font = style.font;
  }
  if (style.fill) {
    cell.fill = style.fill;
  }
  if (style.border) {
    cell.border = style.border;
  }
  if (style.alignment) {
    cell.alignment = style.alignment;
  }
  if (style.numFmt) {
    cell.numFmt = style.numFmt;
  }
}

// Fungsi untuk apply styling ke range
function applyRangeStyle(worksheet: ExcelJS.Worksheet, range: string, style: CellStyle) {
  const cells = worksheet.getCell(range);
  if (cells) {
    applyCellStyle(cells, style);
  }
}

// Style presets
const headerStyle: CellStyle = {
  font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12, name: 'Arial' },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } },
  border: {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  },
  alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
};

const dataStyle: CellStyle = {
  font: { size: 10, name: 'Arial' },
  border: {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  },
  alignment: { horizontal: 'left', vertical: 'middle' }
};

const currencyStyle: CellStyle = {
  font: { size: 10, name: 'Arial' },
  border: {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  },
  alignment: { horizontal: 'right', vertical: 'middle' },
  numFmt: '#,##0'
};

const totalStyle: CellStyle = {
  font: { bold: true, size: 11, name: 'Arial' },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE699' } },
  border: {
    top: { style: 'medium', color: { argb: 'FF000000' } },
    bottom: { style: 'medium', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  },
  alignment: { horizontal: 'right', vertical: 'middle' },
  numFmt: '#,##0'
};

// Helper function to format sumber enum to user-friendly names
function formatSumberName(sumber: string): string {
  const sumberMap: Record<string, string> = {
    'DONATUR': 'Donatur',
    'KOTAK_AMAL_LUAR': 'Kotak Amal Luar',
    'KOTAK_AMAL_MASJID': 'Kotak Amal Masjid',
    'KOTAK_AMAL_JUMAT': 'Kotak Amal Jumat',
    'DONASI_KHUSUS': 'Donasi Khusus',
    'LAINNYA': 'Lainnya'
  };
  return sumberMap[sumber] || sumber;
}

// Fungsi utama untuk export data donatur ke Excel
export async function exportToExcel(data: DonaturData[], filename: string = 'data-donasi.xlsx') {
  try {
    // Buat workbook baru
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Donasi');

    // Set column headers
    const headers = [
      'No', 'Nama Donatur', 'Alamat', 'Januari', 'Februari', 'Maret', 
      'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 
      'Oktober', 'November', 'Desember', 'Infaq', 'Total', 'Tahun'
    ];

    // Add headers
    worksheet.addRow(headers);

    // Apply header styling
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      applyCellStyle(cell, headerStyle);
    });

    // Set column widths
    const columnWidths = [5, 25, 30, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 15, 8];
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // Add data rows
    data.forEach((item, index) => {
      const total = item.jan + item.feb + item.mar + item.apr + item.mei + item.jun + 
                   item.jul + item.aug + item.sep + item.okt + item.nov + item.des + item.infaq;
      
      const rowData = [
        item.no || index + 1,
        item.nama,
        item.alamat,
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
        total,
        item.tahun
      ];

      const row = worksheet.addRow(rowData);
      
      // Apply styling to each cell
      row.eachCell((cell, colNumber) => {
        if (colNumber === 1 || colNumber === 2 || colNumber === 3 || colNumber === 18) {
          // No, Nama, Alamat, Tahun - text style
          applyCellStyle(cell, dataStyle);
        } else {
          // Currency columns
          applyCellStyle(cell, currencyStyle);
        }
        
        // Alternate row colors
        if ((index + 1) % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9F9F9' }
          };
        }
      });
    });

    // Calculate totals
    const totals = data.reduce((acc, item) => ({
      totalDonatur: data.length,
      jan: acc.jan + item.jan,
      feb: acc.feb + item.feb,
      mar: acc.mar + item.mar,
      apr: acc.apr + item.apr,
      mei: acc.mei + item.mei,
      jun: acc.jun + item.jun,
      jul: acc.jul + item.jul,
      aug: acc.aug + item.aug,
      sep: acc.sep + item.sep,
      okt: acc.okt + item.okt,
      nov: acc.nov + item.nov,
      des: acc.des + item.des,
      infaq: acc.infaq + item.infaq,
      grandTotal: acc.grandTotal + (item.jan + item.feb + item.mar + item.apr + item.mei + item.jun + 
                                   item.jul + item.aug + item.sep + item.okt + item.nov + item.des + item.infaq)
    }), {
      totalDonatur: 0, jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0,
      jul: 0, aug: 0, sep: 0, okt: 0, nov: 0, des: 0, infaq: 0, grandTotal: 0
    });

    // Add empty row
    worksheet.addRow([]);

    // Add total row
    const totalRowData = [
      'TOTAL', '', '', totals.jan, totals.feb, totals.mar, totals.apr,
      totals.mei, totals.jun, totals.jul, totals.aug, totals.sep,
      totals.okt, totals.nov, totals.des, totals.infaq, totals.grandTotal, ''
    ];

    const totalRow = worksheet.addRow(totalRowData);
    totalRow.eachCell((cell, colNumber) => {
      if (colNumber === 1) {
        applyCellStyle(cell, {
          ...totalStyle,
          alignment: { horizontal: 'left', vertical: 'middle' },
          numFmt: undefined
        });
      } else if (colNumber === 2 || colNumber === 3 || colNumber === 18) {
        applyCellStyle(cell, {
          ...totalStyle,
          alignment: { horizontal: 'center', vertical: 'middle' },
          numFmt: undefined
        });
      } else {
        applyCellStyle(cell, totalStyle);
      }
    });

    // Simpan file: jika di browser, gunakan writeBuffer dan trigger download
    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    if (isBrowser) {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Node.js/server: tulis file ke disk
      await workbook.xlsx.writeFile(filename);
    }

    console.log(`Data berhasil diekspor ke ${filename}`);
    return true;
  } catch (error) {
    console.error('Error saat mengekspor ke Excel:', error);
    throw new Error('Gagal mengekspor data ke Excel');
  }
}

// Fungsi untuk export data terintegrasi (riwayat tahunan)
export async function exportIntegratedDataToExcel(data: any[], filename: string = 'riwayat-tahunan.xlsx') {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Riwayat Tahunan');

    // Set headers
    const headers = [
      'No', 'Nama', 'Alamat', 'Tipe', 'Januari', 'Februari', 'Maret',
      'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September',
      'Oktober', 'November', 'Desember', 'Infaq', 'Total'
    ];

    worksheet.addRow(headers);

    // Apply header styling with blue color for integrated data
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      applyCellStyle(cell, {
        ...headerStyle,
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } }
      });
    });

    // Set column widths
    const columnWidths = [5, 25, 30, 15, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 15];
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // Add data rows
    data.forEach((item, index) => {
      const rowData = [
        item.no || index + 1,
        item.nama,
        item.alamat || item.lokasi || '',
        item.sourceType === 'donatur' ? 'Donatur' : 
        item.sourceType === 'kotakAmal' ? 'Kotak Amal' :
        item.sourceType === 'donasiKhusus' ? 'Donasi Khusus' :
        item.sourceType === 'kotakAmalMasjid' ? 'Kotak Amal Masjid' : 'Lainnya',
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
      ];

      const row = worksheet.addRow(rowData);
      
      // Apply styling
      row.eachCell((cell, colNumber) => {
        if (colNumber <= 4) {
          // Text columns
          applyCellStyle(cell, dataStyle);
        } else {
          // Currency columns
          applyCellStyle(cell, currencyStyle);
        }
        
        // Alternate row colors
        if ((index + 1) % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9F9F9' }
          };
        }
      });
    });

    // Calculate totals by type
    const totalsByType = data.reduce((acc, item) => {
      const type = item.sourceType === 'donatur' ? 'Donatur' : 
                  item.sourceType === 'kotakAmal' ? 'Kotak Amal' :
                  item.sourceType === 'donasiKhusus' ? 'Donasi Khusus' :
                  item.sourceType === 'kotakAmalMasjid' ? 'Kotak Amal Masjid' : 'Lainnya';
      
      if (!acc[type]) {
        acc[type] = { count: 0, total: 0, months: {} };
      }
      acc[type].count++;
      acc[type].total += item.total || 0;
      return acc;
    }, {} as any);

    // Add grand total
    const grandTotal = data.reduce((sum, item) => sum + (item.total || 0), 0);
    const monthlyTotals = data.reduce((acc, item) => ({
      jan: acc.jan + (item.jan || 0),
      feb: acc.feb + (item.feb || 0),
      mar: acc.mar + (item.mar || 0),
      apr: acc.apr + (item.apr || 0),
      mei: acc.mei + (item.mei || 0),
      jun: acc.jun + (item.jun || 0),
      jul: acc.jul + (item.jul || 0),
      aug: acc.aug + (item.aug || 0),
      sep: acc.sep + (item.sep || 0),
      okt: acc.okt + (item.okt || 0),
      nov: acc.nov + (item.nov || 0),
      des: acc.des + (item.des || 0),
      infaq: acc.infaq + (item.infaq || 0)
    }), { jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, aug: 0, sep: 0, okt: 0, nov: 0, des: 0, infaq: 0 });

    // Add empty row
    worksheet.addRow([]);

    // Add total row
    const totalRowData = [
      'GRAND TOTAL', '', '', '', 
      monthlyTotals.jan, monthlyTotals.feb, monthlyTotals.mar, monthlyTotals.apr,
      monthlyTotals.mei, monthlyTotals.jun, monthlyTotals.jul, monthlyTotals.aug,
      monthlyTotals.sep, monthlyTotals.okt, monthlyTotals.nov, monthlyTotals.des,
      monthlyTotals.infaq, grandTotal
    ];

    const totalRow = worksheet.addRow(totalRowData);
    totalRow.eachCell((cell, colNumber) => {
      if (colNumber <= 4) {
        applyCellStyle(cell, {
          ...totalStyle,
          alignment: { horizontal: 'left', vertical: 'middle' },
          numFmt: undefined
        });
      } else {
        applyCellStyle(cell, totalStyle);
      }
    });

    await workbook.xlsx.writeFile(filename);
    
    console.log(`Data terintegrasi berhasil diekspor ke ${filename}`);
    return true;
  } catch (error) {
    console.error('Error saat mengekspor data terintegrasi:', error);
    throw new Error('Gagal mengekspor data terintegrasi ke Excel');
  }
}

// Fungsi untuk export dengan conditional formatting
export async function exportWithConditionalFormatting(
  data: any[],
  filename: string,
  options: {
    sheetName?: string;
    conditionalRules?: {
      column: number;
      type: 'greaterThan' | 'lessThan' | 'between' | 'topPercent';
      value?: number;
      value2?: number;
      format: CellStyle;
    }[];
  } = {}
) {
  try {
    const { sheetName = 'Data', conditionalRules = [] } = options;
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    
    // Add headers
    const headers = Object.keys(data[0] || {});
    worksheet.addRow(headers);
    
    // Apply header styling
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      applyCellStyle(cell, {
        ...headerStyle,
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF607D8B' } }
      });
    });
    
    // Add data
    data.forEach((item, index) => {
      const rowData = headers.map(header => item[header]);
      const row = worksheet.addRow(rowData);
      
      // Apply basic styling
      row.eachCell((cell, colNumber) => {
        applyCellStyle(cell, dataStyle);
        
        // Apply conditional formatting
        conditionalRules.forEach(rule => {
          if (colNumber === rule.column && typeof cell.value === 'number') {
            let shouldApplyFormat = false;
            
            switch (rule.type) {
              case 'greaterThan':
                shouldApplyFormat = cell.value > (rule.value || 0);
                break;
              case 'lessThan':
                shouldApplyFormat = cell.value < (rule.value || 0);
                break;
              case 'between':
                shouldApplyFormat = cell.value >= (rule.value || 0) && cell.value <= (rule.value2 || 0);
                break;
            }
            
            if (shouldApplyFormat) {
              applyCellStyle(cell, rule.format);
            }
          }
        });
      });
    });
    
    await workbook.xlsx.writeFile(filename);
    return true;
  } catch (error) {
    console.error('Error saat mengekspor dengan conditional formatting:', error);
    throw new Error('Gagal mengekspor data dengan conditional formatting');
  }
}

// Fungsi untuk export multi-sheet
export async function exportMultiSheetExcel(
  sheets: Array<{
    name: string;
    data: any[];
    styling?: {
      headerColor?: string;
      currencyColumns?: number[];
    };
  }>,
  filename: string,
  options: {
    includeSummary?: boolean;
  } = {}
) {
  try {
    const workbook = new ExcelJS.Workbook();
    
    sheets.forEach(sheet => {
      const worksheet = workbook.addWorksheet(sheet.name);
      
      if (sheet.data.length > 0) {
        // Add headers
        const headers = Object.keys(sheet.data[0]);
        worksheet.addRow(headers);
        
        // Apply header styling
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
          applyCellStyle(cell, {
            ...headerStyle,
            fill: { 
              type: 'pattern', 
              pattern: 'solid', 
              fgColor: { argb: sheet.styling?.headerColor || 'FF366092' } 
            }
          });
        });
        
        // Add data
        sheet.data.forEach((item, index) => {
          const rowData = headers.map(header => item[header]);
          const row = worksheet.addRow(rowData);
          
          row.eachCell((cell, colNumber) => {
            if (sheet.styling?.currencyColumns?.includes(colNumber)) {
              applyCellStyle(cell, currencyStyle);
            } else {
              applyCellStyle(cell, dataStyle);
            }
          });
        });
      }
    });
    
    // Add summary sheet if requested
    if (options.includeSummary) {
      const summaryWorksheet = workbook.addWorksheet('Summary');
      const summaryData = sheets.map(sheet => ({
        'Sheet': sheet.name,
        'Records': sheet.data.length,
        'Last Updated': new Date().toLocaleDateString('id-ID')
      }));
      
      const summaryHeaders = ['Sheet', 'Records', 'Last Updated'];
      summaryWorksheet.addRow(summaryHeaders);
      
      const summaryHeaderRow = summaryWorksheet.getRow(1);
      summaryHeaderRow.eachCell((cell) => {
        applyCellStyle(cell, {
          ...headerStyle,
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF9800' } }
        });
      });
      
      summaryData.forEach(item => {
        const row = summaryWorksheet.addRow([item.Sheet, item.Records, item['Last Updated']]);
        row.eachCell((cell) => {
          applyCellStyle(cell, dataStyle);
        });
      });
    }
    
    await workbook.xlsx.writeFile(filename);
    return true;
  } catch (error) {
    console.error('Error saat mengekspor multi-sheet Excel:', error);
    throw new Error('Gagal mengekspor multi-sheet Excel');
  }
}

// Export function for pengeluaran data
export async function exportPengeluaranToExcel(data: any[], filename: string = 'data-pengeluaran.xlsx') {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Pengeluaran');

    const headers = ['No', 'Nama Pengeluaran', 'Tanggal', 'Tahun', 'Jumlah', 'Keterangan'];
    worksheet.addRow(headers);

    // Apply header styling
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      applyCellStyle(cell, {
        ...headerStyle,
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF44336' } } // Red for expenses
      });
    });

    // Set column widths
    const columnWidths = [5, 25, 15, 10, 15, 30];
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // Add data rows
    data.forEach((item, index) => {
      const rowData = [
        item.no || index + 1,
        item.nama || item.pengeluaran || '',
        item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '',
        item.tahun || '',
        item.jumlah || 0,
        item.keterangan || ''
      ];

      const row = worksheet.addRow(rowData);
      
      // Apply styling
      row.eachCell((cell, colNumber) => {
        if (colNumber === 5) { // Jumlah column
          applyCellStyle(cell, currencyStyle);
        } else {
          applyCellStyle(cell, dataStyle);
        }
        
        // Alternate row colors
        if ((index + 1) % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9F9F9' }
          };
        }
      });
    });

    await workbook.xlsx.writeFile(filename);
    return true;
  } catch (error) {
    console.error('Error saat mengekspor data pengeluaran ke Excel:', error);
    throw new Error('Gagal mengekspor data pengeluaran ke Excel');
  }
}

// Export function for pengeluaran tahunan data
export async function exportPengeluaranTahunanToExcel(data: any[], filename: string = 'pengeluaran-tahunan.xlsx') {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pengeluaran Tahunan');

    const headers = [
      'No', 'Pengeluaran', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    worksheet.addRow(headers);

    // Apply header styling
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      applyCellStyle(cell, {
        ...headerStyle,
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF44336' } } // Red for expenses
      });
    });

    // Set column widths
    const columnWidths = [5, 25, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12];
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // Add data rows
    data.forEach((item, index) => {
      const rowData = [
        item.no || index + 1,
        item.pengeluaran || '',
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
      ];

      const row = worksheet.addRow(rowData);
      
      // Apply styling
      row.eachCell((cell, colNumber) => {
        if (colNumber === 1 || colNumber === 2) { // No and Pengeluaran columns
          applyCellStyle(cell, dataStyle);
        } else {
          applyCellStyle(cell, currencyStyle);
        }
        
        // Alternate row colors
        if ((index + 1) % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9F9F9' }
          };
        }
      });
    });

    await workbook.xlsx.writeFile(filename);
    return true;
  } catch (error) {
    console.error('Error saat mengekspor data pengeluaran tahunan ke Excel:', error);
    throw new Error('Gagal mengekspor data pengeluaran tahunan ke Excel');
  }
}

// Export functions for Laporan Keuangan
export async function exportLaporanKeuanganToExcel(
  pemasukanData: any[],
  pengeluaranData: any[],
  year: string,
  filename?: string
): Promise<boolean> {
  try {
    const workbook = new ExcelJS.Workbook();

    // Create Pemasukan worksheet
    const pemasukanWorksheet = workbook.addWorksheet('Pemasukan');
    const pemasukanHeaders = [
      'Sumber', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Total'
    ];
    pemasukanWorksheet.addRow(pemasukanHeaders);

    // Apply header styling for pemasukan
    const pemasukanHeaderRow = pemasukanWorksheet.getRow(1);
    pemasukanHeaderRow.eachCell((cell) => {
      applyCellStyle(cell, {
        ...headerStyle,
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } } // Green for income
      });
    });

    // Set column widths for pemasukan
    const pemasukanColumnWidths = [20, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 15];
    pemasukanColumnWidths.forEach((width, index) => {
      pemasukanWorksheet.getColumn(index + 1).width = width;
    });

    // Add pemasukan data
    pemasukanData.forEach((item, index) => {
      const rowData = [
        formatSumberName(item.sumber),
        item.jan, item.feb, item.mar, item.apr, item.mei, item.jun,
        item.jul, item.aug, item.sep, item.okt, item.nov, item.des, item.total
      ];

      const row = pemasukanWorksheet.addRow(rowData);
      
      row.eachCell((cell, colNumber) => {
        if (colNumber === 1) { // Sumber column
          applyCellStyle(cell, dataStyle);
        } else {
          applyCellStyle(cell, currencyStyle);
        }
        
        // Alternate row colors
        if ((index + 1) % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9F9F9' }
          };
        }
      });
    });

    // Create Pengeluaran worksheet
    const pengeluaranWorksheet = workbook.addWorksheet('Pengeluaran');
    const pengeluaranHeaders = [
      'Nama', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Total'
    ];
    pengeluaranWorksheet.addRow(pengeluaranHeaders);

    // Apply header styling for pengeluaran
    const pengeluaranHeaderRow = pengeluaranWorksheet.getRow(1);
    pengeluaranHeaderRow.eachCell((cell) => {
      applyCellStyle(cell, {
        ...headerStyle,
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF44336' } } // Red for expenses
      });
    });

    // Set column widths for pengeluaran
    const pengeluaranColumnWidths = [20, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 15];
    pengeluaranColumnWidths.forEach((width, index) => {
      pengeluaranWorksheet.getColumn(index + 1).width = width;
    });

    // Add pengeluaran data
    pengeluaranData.forEach((item, index) => {
      const rowData = [
        item.nama,
        item.jan, item.feb, item.mar, item.apr, item.mei, item.jun,
        item.jul, item.aug, item.sep, item.okt, item.nov, item.des, item.total
      ];

      const row = pengeluaranWorksheet.addRow(rowData);
      
      row.eachCell((cell, colNumber) => {
        if (colNumber === 1) { // Nama column
          applyCellStyle(cell, dataStyle);
        } else {
          applyCellStyle(cell, currencyStyle);
        }
        
        // Alternate row colors
        if ((index + 1) % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9F9F9' }
          };
        }
      });
    });

    // Create summary worksheet
    const summaryWorksheet = workbook.addWorksheet('Ringkasan');
    const totalPemasukan = pemasukanData.reduce((sum, item) => sum + item.total, 0);
    const totalPengeluaran = pengeluaranData.reduce((sum, item) => sum + item.total, 0);
    const saldoAkhir = totalPemasukan - totalPengeluaran;

    const summaryHeaders = ['Keterangan', 'Jumlah'];
    summaryWorksheet.addRow(summaryHeaders);

    // Apply header styling for summary
    const summaryHeaderRow = summaryWorksheet.getRow(1);
    summaryHeaderRow.eachCell((cell) => {
      applyCellStyle(cell, {
        ...headerStyle,
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9C27B0' } } // Purple for summary
      });
    });

    // Set column widths for summary
    summaryWorksheet.getColumn(1).width = 20;
    summaryWorksheet.getColumn(2).width = 20;

    // Add summary data
    const summaryData = [
      ['Total Pemasukan', totalPemasukan],
      ['Total Pengeluaran', totalPengeluaran],
      ['Saldo Akhir', saldoAkhir]
    ];

    summaryData.forEach((item, index) => {
      const row = summaryWorksheet.addRow(item);
      
      row.eachCell((cell, colNumber) => {
        if (colNumber === 1) { // Keterangan column
          applyCellStyle(cell, dataStyle);
        } else {
          applyCellStyle(cell, currencyStyle);
        }
        
        // Special styling for saldo akhir
        if (index === 2) { // Saldo Akhir row
          applyCellStyle(cell, {
            ...totalStyle,
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: saldoAkhir >= 0 ? 'FF4CAF50' : 'FFF44336' } }
          });
        }
      });
    });

    const finalFilename = filename || `laporan-keuangan-${year}-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Generate buffer for browser download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error saat mengekspor laporan keuangan ke Excel:', error);
    throw new Error('Gagal mengekspor laporan keuangan ke Excel');
  }
}

// Export function for rekap pemasukan
export async function exportRekapPemasukanToExcel(
  data: any[],
  year: string,
  filename?: string
): Promise<boolean> {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rekap Pemasukan');

    const headers = [
      'Sumber', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Total'
    ];
    worksheet.addRow(headers);

    // Apply header styling
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      applyCellStyle(cell, {
        ...headerStyle,
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } } // Green for income
      });
    });

    // Set column widths
    const columnWidths = [20, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 15];
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // Add data rows
    data.forEach((item, index) => {
      const rowData = [
        formatSumberName(item.sumber),
        item.jan, item.feb, item.mar, item.apr, item.mei, item.jun,
        item.jul, item.aug, item.sep, item.okt, item.nov, item.des, item.total
      ];

      const row = worksheet.addRow(rowData);
      
      row.eachCell((cell, colNumber) => {
        if (colNumber === 1) { // Sumber column
          applyCellStyle(cell, dataStyle);
        } else {
          applyCellStyle(cell, currencyStyle);
        }
        
        // Alternate row colors
        if ((index + 1) % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9F9F9' }
          };
        }
      });
    });

    const finalFilename = filename || `rekap-pemasukan-${year}-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Generate buffer for browser download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error saat mengekspor rekap pemasukan ke Excel:', error);
    throw new Error('Gagal mengekspor rekap pemasukan ke Excel');
  }
}

// Export function for rekap pengeluaran
export async function exportRekapPengeluaranToExcel(
  data: any[],
  year: string,
  filename?: string
): Promise<boolean> {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rekap Pengeluaran');

    const headers = [
      'Nama', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Total'
    ];
    worksheet.addRow(headers);

    // Apply header styling
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      applyCellStyle(cell, {
        ...headerStyle,
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF44336' } } // Red for expenses
      });
    });

    // Set column widths
    const columnWidths = [20, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 15];
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // Add data rows
    data.forEach((item, index) => {
      const rowData = [
        item.nama,
        item.jan, item.feb, item.mar, item.apr, item.mei, item.jun,
        item.jul, item.aug, item.sep, item.okt, item.nov, item.des, item.total
      ];

      const row = worksheet.addRow(rowData);
      
      row.eachCell((cell, colNumber) => {
        if (colNumber === 1) { // Nama column
          applyCellStyle(cell, dataStyle);
        } else {
          applyCellStyle(cell, currencyStyle);
        }
        
        // Alternate row colors
        if ((index + 1) % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9F9F9' }
          };
        }
      });
    });

    const finalFilename = filename || `rekap-pengeluaran-${year}-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Generate buffer for browser download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error saat mengekspor rekap pengeluaran ke Excel:', error);
    throw new Error('Gagal mengekspor rekap pengeluaran ke Excel');
  }
}