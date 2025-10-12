// src/app/api/konten/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createKontenWithFoto, createGambarKonten, updateKontenWithOptionalFoto, deleteKonten } from "@/lib/services/supabase/konten";
import { ContentFormInputSchema } from "@/lib/schema/konten/schema";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract data dari formData
    const judul = formData.get("judul") as string;
    const kategoriId = parseInt(formData.get("kategoriId") as string);
    const tanggal = formData.get("tanggal") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const penulis = formData.get("penulis") as string || null;
    const waktu = formData.get("waktu") as string || null;
    const lokasi = formData.get("lokasi") as string || null;
    const donaturId = formData.get("donaturId") ? parseInt(formData.get("donaturId") as string) : null;
    const kotakAmalId = formData.get("kotakAmalId") ? parseInt(formData.get("kotakAmalId") as string) : null;
    const tampilkanDiBeranda = formData.get("tampilkanDiBeranda") === "true";
    const penting = formData.get("penting") === "true";
    const status = formData.get("status") as string;
    const tags = formData.get("tags") ? JSON.parse(formData.get("tags") as string) : [];
    
    // Handle multiple files
    const files: File[] = [];
    const fileEntries = formData.getAll("files");
    const mainFile = formData.get("file") as File | null;
    
    // Add main file if exists
    if (mainFile) {
      files.push(mainFile);
    }
    
    // Add additional files
    fileEntries.forEach(entry => {
      if (entry instanceof File) {
        files.push(entry);
      }
    });

    // Validasi data
    if (!judul || !deskripsi || !tanggal || isNaN(kategoriId)) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const kontenData = {
      judul,
      kategoriId,
      tanggal: new Date(tanggal),
      deskripsi,
      penulis,
      waktu,
      lokasi,
      donaturId,
      kotakAmalId,
      tampilkanDiBeranda,
      penting,
      status,
      tags,
      slug: "",
      viewCount: 0,
      fotoUrl: null,
    };

    // Validasi dengan schema
    const validatedData = ContentFormInputSchema.parse(kontenData);

    // Create konten with main photo
    const result = await createKontenWithFoto(validatedData, files[0] || null);

    // Upload additional images if any
    if (files.length > 1) {
      const additionalFiles = files.slice(1);
      const gambarData = additionalFiles.map((file, index) => ({
        file,
        caption: "",
        urutan: index + 1,
        isUtama: false,
      }));

      await createGambarKonten(result.id, gambarData);
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: "Konten berhasil disimpan",
    });
  } catch (error) {
    console.error("Error creating konten:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan konten" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Import getKontenData function
    const { getKontenData } = await import("@/lib/services/supabase/konten");
    
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get("kategori");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    // Get all konten data
    const data = await getKontenData();

    // Apply filters if provided
    let filteredData = data;

    if (kategori && kategori !== "all") {
      filteredData = filteredData.filter(item => item.kategoriId === parseInt(kategori));
    }

    if (status && status !== "all") {
      filteredData = filteredData.filter(item => item.status === status);
    }

    if (limit) {
      filteredData = filteredData.slice(0, parseInt(limit));
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      total: filteredData.length,
    });
  } catch (error) {
    console.error("Error fetching konten:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data konten" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();

    const id = parseInt(formData.get("id") as string);
    if (!id) {
      return NextResponse.json({ error: "ID konten wajib diisi" }, { status: 400 });
    }

    // Ekstrak field optional
    const updates: any = {};
    const fields = [
      "judul","kategoriId","tanggal","deskripsi","penulis","waktu","lokasi",
      "donaturId","kotakAmalId","tampilkanDiBeranda","penting","status","tags","slug"
    ];
    fields.forEach((key) => {
      const val = formData.get(key);
      if (val !== null) updates[key] = val;
    });

    // Normalisasi tipe
    if (updates.kategoriId) updates.kategoriId = parseInt(updates.kategoriId);
    if (updates.tanggal) updates.tanggal = new Date(updates.tanggal);
    if (updates.donaturId) updates.donaturId = parseInt(updates.donaturId);
    if (updates.kotakAmalId) updates.kotakAmalId = parseInt(updates.kotakAmalId);
    if (updates.tampilkanDiBeranda !== undefined) updates.tampilkanDiBeranda = updates.tampilkanDiBeranda === "true";
    if (updates.penting !== undefined) updates.penting = updates.penting === "true";
    if (updates.tags) updates.tags = JSON.parse(updates.tags);

    const file = formData.get("file") as File | null;
    const updated = await updateKontenWithOptionalFoto(id, updates, file ?? undefined);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating konten:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui konten" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID konten wajib diisi" }, { status: 400 });
    }

    await deleteKonten(parseInt(id));
    return NextResponse.json({ success: true, message: "Konten berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting konten:", error);
    return NextResponse.json(
      { error: "Gagal menghapus konten" },
      { status: 500 }
    );
  }
}