// src/components/pdf-export/laporan-jumat-pdf.ts
import jsPDF from 'jspdf';
import { LaporanJumatExport } from '@/lib/schema/laporan/laporan-jumat-schema';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export interface LaporanJumatMetadata {
  id?: string;
  tanggal: string;
  judul: string;
  file_name: string;
  file_size?: number;
  uploaded_at?: string;
  uploaded_by?: string;
  is_public: boolean;
  saldo_kas_awal: number;
  total_pemasukan: number;
  total_pengeluaran: number;
  saldo_kas_akhir: number;
  khatib?: string;
  muadzdzin?: string;
  imam?: string;
  ketua_pengurus?: string;
  bendahara?: string;
}

export async function exportLaporanJumatToPDF(
  data: LaporanJumatExport, 
  paperSize: 'a4' | 'f4' = 'a4',
  options?: {
    uploadToSupabase?: boolean;
    isPublic?: boolean;
    uploadedBy?: string;
  }
) {
  try {
    // Create new PDF document with specified paper size
    // F4 size: 210 x 330 mm, A4 size: 210 x 297 mm
    const pdf = paperSize === 'f4' 
      ? new jsPDF('p', 'mm', [210, 330])
      : new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set margins - reduced for single page layout
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    let currentY = margin;
    
    // Add header with mosque logo and information
    currentY = await addHeader(pdf, currentY, pageWidth, margin);
    currentY += 8; // Reduced spacing
    
    // Add title
    currentY = addTitle(pdf, currentY, pageWidth, data.tanggalLaporan);
    currentY += 8; // Reduced spacing
    
    // Add main content sections with reduced spacing
    currentY = addSectionA(pdf, currentY, margin, contentWidth, data);
    currentY += 6; // Reduced spacing
    
    currentY = addSectionB(pdf, currentY, margin, contentWidth, data);
    currentY += 6; // Reduced spacing
    
    currentY = addSectionC(pdf, currentY, margin, contentWidth, data);
    currentY += 6; // Reduced spacing
    
    currentY = addSectionD(pdf, currentY, margin, contentWidth, data);
    currentY += 8; // Reduced spacing
    
    // Add signature section
    currentY = addSignatureSection(pdf, currentY, margin, contentWidth, data);
    
    // Generate filename
    const filename = `Laporan_Jumat_${format(data.tanggalLaporan, 'dd_MM_yyyy')}.pdf`;
    
    // Save PDF manually
    pdf.save(filename);
    
    // Upload to Supabase if requested
    let uploadResult = null;
    if (options?.uploadToSupabase) {
      try {
        const pdfBlob = pdf.output('blob');
        uploadResult = await handleSupabaseUpload(pdfBlob, filename, data, options);
      } catch (uploadError) {
        console.error('Upload error in exportLaporanJumatToPDF:', uploadError);
        uploadResult = { 
          success: false, 
          error: uploadError instanceof Error ? uploadError.message : 'Gagal upload ke Supabase' 
        };
      }
    }
    
    return { success: true, filename, uploadResult };
  } catch (error) {
    console.error('Error exporting laporan jumat to PDF:', error);
    throw new Error('Gagal mengekspor laporan ke PDF');
  }
}

async function addHeader(pdf: jsPDF, startY: number, pageWidth: number, margin: number): Promise<number> {
  try {
    // Load the kop-masjid image
    const logoImg = await loadImageAsBase64('/images/kop-masjid.png');
    if (logoImg) {
      // Get actual image dimensions
      const imgData = await getImageDimensions(logoImg);
      
      // Calculate proportional dimensions
      // Set desired width (full width minus margins)
      const desiredWidth = pageWidth - (margin * 2);
      
      // Calculate height maintaining aspect ratio
      const aspectRatio = imgData.height / imgData.width;
      const calculatedHeight = desiredWidth * aspectRatio;
      
      // Add image with proper proportions
      pdf.addImage(logoImg, 'PNG', margin, startY, desiredWidth, calculatedHeight);
      
      // Add horizontal line below header
      const lineY = startY + calculatedHeight + 3;
      pdf.setLineWidth(0.5);
      pdf.line(margin, lineY, pageWidth - margin, lineY);
      
      return lineY + 5;
    }
  } catch (error) {
    console.warn('Could not load mosque logo, using text header instead');
  }
  
  // Fallback: simplified text-only header
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  
  const title = 'MASJID JAWAAHIRUZZARQA VILA MUTIARA BIRU';
  const titleWidth = pdf.getTextWidth(title);
  const titleX = (pageWidth - titleWidth) / 2;
  pdf.text(title, titleX, startY + 10);
  
  // Add horizontal line
  pdf.setLineWidth(0.5);
  pdf.line(margin, startY + 20, pageWidth - margin, startY + 20);
  
  return startY + 25;
}

// Helper function to load image as base64
async function loadImageAsBase64(imagePath: string): Promise<string | null> {
  try {
    const response = await fetch(imagePath);
    if (!response.ok) throw new Error('Failed to fetch image');
    
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
}

// Helper function to get image dimensions
async function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      // Default dimensions if error
      resolve({ width: 800, height: 300 });
    };
    img.src = base64;
  });
}

function addTitle(pdf: jsPDF, startY: number, pageWidth: number, tanggalLaporan: Date): number {
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  
  const title = 'PENYAMPAIAN LAPORAN PELAKSANAAN SHOLAT JUMAT';
  const titleWidth = pdf.getTextWidth(title);
  const titleX = (pageWidth - titleWidth) / 2;
  pdf.text(title, titleX, startY);
  
  pdf.setFontSize(12);
  const dateText = format(tanggalLaporan, 'EEEE, dd MMMM yyyy', { locale: id });
  const dateWidth = pdf.getTextWidth(dateText);
  const dateX = (pageWidth - dateWidth) / 2;
  pdf.text(dateText, dateX, startY + 8);
  
  return startY + 8;
}

function addSectionA(pdf: jsPDF, startY: number, margin: number, contentWidth: number, data: LaporanJumatExport): number {
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Penyampaian I. Laporan Keuangan Masjid', margin, startY);
  
  let currentY = startY + 8;
  pdf.setFont('helvetica', 'normal');
  pdf.text('A', margin, currentY);
  pdf.text('Saldo Kas Jum\'at lalu :', margin + 10, currentY);
  
  const saldoText = `Rp ${data.saldoKasJumatLalu.toLocaleString('id-ID')}`;
  const saldoX = margin + contentWidth - pdf.getTextWidth(saldoText);
  pdf.text(saldoText, saldoX, currentY);
  
  return currentY;
}

/**
 * Helper function to handle Supabase upload via Edge Function
 */
async function handleSupabaseUpload(
  pdfBlob: Blob,
  filename: string,
  data: LaporanJumatExport,
  options: { isPublic?: boolean; uploadedBy?: string }
) {
  try {
    // Calculate totals
    const totalPemasukan = (data.kotakAmalJumat || 0) + 
                          (data.sumbangan?.reduce((sum, s) => sum + s.jumlah, 0) || 0);
    const totalPengeluaran = data.pengeluaran?.reduce((sum, p) => sum + p.jumlah, 0) || 0;
    const saldoAkhir = (data.saldoKasJumatLalu || 0) + totalPemasukan - totalPengeluaran;

    // Prepare metadata
    const metadata: LaporanJumatMetadata = {
      tanggal: format(data.tanggalLaporan, 'yyyy-MM-dd'),
      judul: `Laporan Keuangan Jumat - ${format(data.tanggalLaporan, 'dd MMMM yyyy', { locale: id })}`,
      file_name: filename.replace('.pdf', ''),
      uploaded_by: options.uploadedBy,
      is_public: options.isPublic || false,
      saldo_kas_awal: data.saldoKasJumatLalu || 0,
      total_pemasukan: totalPemasukan,
      total_pengeluaran: totalPengeluaran,
      saldo_kas_akhir: saldoAkhir,
      khatib: data.khatib,
      muadzdzin: data.muadzdzin,
      imam: data.imam,
      ketua_pengurus: data.ketuaPengurus,
      bendahara: data.bendahara
    };

    const arrayBuffer = await pdfBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    const pdfBase64 = btoa(binary);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
    }

    // Call Supabase Edge Function
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/export-laporan-jumat`;
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        pdfBase64,
        metadata,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Edge function error: ${errorData.message || response.statusText}`);
    }

    const uploadResult = await response.json();

    if (uploadResult.success) {
      console.log('PDF berhasil diupload melalui Edge Function:', uploadResult.data);
    } else {
      console.error('Gagal upload PDF:', uploadResult.error);
    }
    
    return uploadResult;
  } catch (error) {
    console.error('Error dalam upload Supabase:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal' 
    };
  }
}

function addSectionB(pdf: jsPDF, startY: number, margin: number, contentWidth: number, data: LaporanJumatExport): number {
  let currentY = startY;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('B', margin, currentY);
  pdf.text('Penerimaan :', margin + 10, currentY);
  
  currentY += 8;
  pdf.setFont('helvetica', 'normal');
  
  // Kotak Amal Jumat
  pdf.text('1', margin + 10, currentY);
  const kotakAmalText = `Kotak Amal Jumat, ${data.kotakAmalJumatTanggal || ''}`;
  pdf.text(kotakAmalText, margin + 20, currentY);
  
  const kotakAmalAmount = `Rp ${data.kotakAmalJumat.toLocaleString('id-ID')}`;
  const kotakAmalX = margin + contentWidth - pdf.getTextWidth(kotakAmalAmount);
  pdf.text(kotakAmalAmount, kotakAmalX, currentY);
  
  currentY += 6;
  
  // Sumbangan/Donasi
  pdf.text('2', margin + 10, currentY);
  pdf.text('Sumbangan/ Donasi dari :', margin + 20, currentY);
  currentY += 6;
  
  // List sumbangan
  data.sumbangan.forEach((sumbangan, index) => {
    if (sumbangan.nama && sumbangan.jumlah > 0) {
      pdf.text(`${index + 1})`, margin + 20, currentY);
      pdf.text(sumbangan.nama, margin + 30, currentY);
      
      const sumbanganAmount = `Rp ${sumbangan.jumlah.toLocaleString('id-ID')}`;
      const sumbanganX = margin + contentWidth - pdf.getTextWidth(sumbanganAmount);
      pdf.text(sumbanganAmount, sumbanganX, currentY);
      
      currentY += 4;
    }
  });
  
  // Add limited empty numbered lines for remaining slots
  const filledSlots = data.sumbangan.filter(s => s.nama && s.jumlah > 0).length;
  const remainingSlots = Math.min(5, 10 - filledSlots);
  
  for (let i = 0; i < remainingSlots; i++) {
    const lineNumber = filledSlots + i + 1;
    pdf.text(`${lineNumber})`, margin + 20, currentY);
    currentY += 4;
  }
  
  // Total Pemasukan
  currentY += 3;
  
  pdf.setLineWidth(0.3);
  pdf.line(margin + 120, currentY - 2, margin + contentWidth, currentY - 2);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Jumlah Pemasukan', margin + 80, currentY + 3);
  const totalPenerimaanText = `Rp ${data.totalPenerimaan.toLocaleString('id-ID')}`;
  const totalPenerimaanX = margin + contentWidth - pdf.getTextWidth(totalPenerimaanText);
  pdf.text(totalPenerimaanText, totalPenerimaanX, currentY + 3);
  
  return currentY + 3;
}

function addSectionC(pdf: jsPDF, startY: number, margin: number, contentWidth: number, data: LaporanJumatExport): number {
  let currentY = startY;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('C', margin, currentY);
  pdf.text('Pengeluaran :', margin + 10, currentY);
  
  currentY += 6;
  pdf.setFont('helvetica', 'normal');
  
  // List pengeluaran
  data.pengeluaran.forEach((pengeluaran, index) => {
    if (pengeluaran.nama && pengeluaran.jumlah > 0) {
      pdf.text(`${index + 1}`, margin + 10, currentY);
      pdf.text(pengeluaran.nama, margin + 20, currentY);
      
      const pengeluaranAmount = `Rp ${pengeluaran.jumlah.toLocaleString('id-ID')}`;
      const pengeluaranX = margin + contentWidth - pdf.getTextWidth(pengeluaranAmount);
      pdf.text(pengeluaranAmount, pengeluaranX, currentY);
      
      currentY += 4;
    }
  });
  
  // Add limited empty numbered lines for remaining slots
  const filledSlots = data.pengeluaran.filter(p => p.nama && p.jumlah > 0).length;
  const remainingSlots = Math.min(3, 5 - filledSlots);
  
  for (let i = 0; i < remainingSlots; i++) {
    const lineNumber = filledSlots + i + 1;
    pdf.text(`${lineNumber}`, margin + 10, currentY);
    currentY += 4;
  }
  
  // Total Pengeluaran
  currentY += 3;
  
  pdf.setLineWidth(0.3);
  pdf.line(margin + 120, currentY - 2, margin + contentWidth, currentY - 2);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Jumlah Pengeluaran', margin + 80, currentY + 3);
  const totalPengeluaranText = `Rp ${data.totalPengeluaran.toLocaleString('id-ID')}`;
  const totalPengeluaranX = margin + contentWidth - pdf.getTextWidth(totalPengeluaranText);
  pdf.text(totalPengeluaranText, totalPengeluaranX, currentY + 3);
  
  return currentY + 3;
}

function addSectionD(pdf: jsPDF, startY: number, margin: number, contentWidth: number, data: LaporanJumatExport): number {
  let currentY = startY;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('D', margin, currentY);
  pdf.text('Saldo Kas Hari ini', margin + 10, currentY);
  
  const saldoHariIniText = `Rp ${data.saldoKasHariIni.toLocaleString('id-ID')}`;
  const saldoHariIniX = margin + contentWidth - pdf.getTextWidth(saldoHariIniText);
  pdf.text(saldoHariIniText, saldoHariIniX, currentY);
  
  currentY += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.text('Terdiri dari', margin + 10, currentY);
  
  currentY += 4;
  
  // Breakdown kas
  const kasItems = [
    { label: '1  Kas BSI', amount: data.kasBsi },
    { label: '2  Kas Bank Sulselbar', amount: data.kasBankSulselbar },
    { label: '3  Kas Tunai', amount: data.kasTunai }
  ];
  
  kasItems.forEach(item => {
    pdf.text(item.label, margin + 10, currentY);
    const amountText = `Rp ${item.amount.toLocaleString('id-ID')}`;
    const amountX = margin + contentWidth - pdf.getTextWidth(amountText);
    pdf.text(amountText, amountX, currentY);
    currentY += 4;
  });
  
  // Add section for "Yang Bertindak Sebagai"
  currentY += 6;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Penyampaian II. Yang Bertindak Sebagai', margin, currentY);
  
  currentY += 6;
  pdf.setFont('helvetica', 'normal');
  
  const roles = [
    { label: '1', role: 'Khatib', name: data.khatib || '' },
    { label: '2', role: 'Muadzdzin', name: data.muadzdzin || '' },
    { label: '3', role: 'Imam', name: data.imam || '' }
  ];
  
  roles.forEach(role => {
    pdf.text(role.label, margin + 10, currentY);
    pdf.text(`${role.role} : ${role.name}`, margin + 20, currentY);
    currentY += 4;
  });
  
  return currentY;
}

function addSignatureSection(pdf: jsPDF, startY: number, margin: number, contentWidth: number, data: LaporanJumatExport): number {
  let currentY = startY;
  
  // Date and location
  const dateLocation = `Makassar, ${format(data.tanggalLaporan, 'dd MMMM yyyy', { locale: id })}`;
  const dateLocationX = margin + contentWidth - pdf.getTextWidth(dateLocation);
  pdf.text(dateLocation, dateLocationX, currentY);
  
  currentY += 10;
  
  // "Mengetahui" text - centered between two signatures
  pdf.setFont('helvetica', 'normal');
  const mengetahuiText = 'Mengetahui,';
  const mengetahuiWidth = pdf.getTextWidth(mengetahuiText);
  const mengetahuiX = margin + (contentWidth - mengetahuiWidth) / 2;
  pdf.text(mengetahuiText, mengetahuiX, currentY);
  
  currentY += 8;
  
  // Signature titles
  const ketuaTitle = 'Ketua Pengurus';
  const bendaharaTitle = 'Bendahara';
  
  // Position for left signature (Ketua Pengurus) - 1/4 of width
  const leftSignatureX = margin + (contentWidth / 4);
  // Position for right signature (Bendahara) - 3/4 of width
  const rightSignatureX = margin + (contentWidth * 3 / 4);
  
  // Center the titles
  const ketuaTitleWidth = pdf.getTextWidth(ketuaTitle);
  const bendaharaTitleWidth = pdf.getTextWidth(bendaharaTitle);
  
  pdf.text(ketuaTitle, leftSignatureX - (ketuaTitleWidth / 2), currentY);
  pdf.text(bendaharaTitle, rightSignatureX - (bendaharaTitleWidth / 2), currentY);
  
  currentY += 30;
  
  // Names with underlines - centered
  pdf.setFont('helvetica', 'bold');
  const ketuaNameWidth = pdf.getTextWidth(data.ketuaPengurus);
  const bendaharaNameWidth = pdf.getTextWidth(data.bendahara);
  
  const ketuaNameX = leftSignatureX - (ketuaNameWidth / 2);
  const bendaharaNameX = rightSignatureX - (bendaharaNameWidth / 2);
  
  pdf.text(data.ketuaPengurus, ketuaNameX, currentY);
  pdf.text(data.bendahara, bendaharaNameX, currentY);
  
  // Underlines - centered below names
  pdf.setLineWidth(0.3);
  pdf.line(ketuaNameX, currentY + 2, ketuaNameX + ketuaNameWidth, currentY + 2);
  pdf.line(bendaharaNameX, currentY + 2, bendaharaNameX + bendaharaNameWidth, currentY + 2);
  
  return currentY;
}