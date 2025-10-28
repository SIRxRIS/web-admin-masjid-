import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface LaporanJumatMetadata {
  tanggal: string;
  judul: string;
  file_name: string;
  file_size: number;
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

interface ExportRequest {
  pdfBase64: string;
  metadata: LaporanJumatMetadata;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    console.log("=== export-laporan-jumat START ===");
    const { pdfBase64, metadata }: ExportRequest = await req.json();

    if (!pdfBase64 || !metadata) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing pdfBase64 or metadata",
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${metadata.file_name}-${timestamp}.pdf`;
    const filePath = `laporan-jumat/${new Date(metadata.tanggal).getFullYear()}/${fileName}`;

    console.log("📝 [export] Converting base64 to Uint8Array...");
    const pdfBytes = base64ToUint8Array(pdfBase64);
    const fileSize = pdfBytes.length;

    console.log(`📤 [export] Uploading PDF to storage: ${filePath} (${fileSize} bytes)`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("reports")
      .upload(filePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ [export] Upload error:", uploadError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Gagal upload file: ${uploadError.message}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("✓ [export] PDF uploaded successfully");

    const { data: urlData } = supabase.storage
      .from("reports")
      .getPublicUrl(filePath);

    console.log("💾 [export] Saving metadata to database...");
    const recordId = crypto.randomUUID();
    const { data: insertData, error: dbError } = await supabase
      .from("laporan_jumat_files")
      .insert([
        {
          id: recordId,
          tanggal: new Date(metadata.tanggal).toISOString(),
          judul: metadata.judul,
          file_name: metadata.file_name,
          file_path: filePath,
          file_size: fileSize,
          uploaded_by: metadata.uploaded_by,
          is_public: metadata.is_public,
          saldo_kas_awal: metadata.saldo_kas_awal || 0,
          total_pemasukan: metadata.total_pemasukan || 0,
          total_pengeluaran: metadata.total_pengeluaran || 0,
          saldo_kas_akhir: metadata.saldo_kas_akhir || 0,
          khatib: metadata.khatib,
          muadzdzin: metadata.muadzdzin,
          imam: metadata.imam,
          ketua_pengurus: metadata.ketua_pengurus,
          bendahara: metadata.bendahara,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("❌ [export] Database insert error:", dbError);
      await supabase.storage.from("reports").remove([filePath]);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Gagal simpan metadata: ${dbError.message}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("✓ [export] Metadata saved successfully");

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...insertData,
          public_url: urlData.publicUrl,
        },
        message: "PDF berhasil diupload dan metadata tersimpan",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    let errorMessage = "Unknown error";
    let errorStack = "";

    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack || "";
    } else if (typeof error === "object" && error !== null) {
      errorMessage = JSON.stringify(error);
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    console.error("=== CRITICAL ERROR in export-laporan-jumat ===");
    console.error("Message:", errorMessage);
    console.error("Stack:", errorStack);

    return new Response(
      JSON.stringify({
        success: false,
        error: "export_error",
        message: errorMessage,
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
