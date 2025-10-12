// src/app/api/pengurus/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  deletePengurus,
  updatePengurusWithOptionalFoto,
} from "../../../../lib/services/supabase/pengurus";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    const result = await deletePengurus(id);
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    return NextResponse.json({ message: "Pengurus berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting pengurus:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data pengurus" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    const contentType = request.headers.get("content-type");
    
    if (contentType?.includes("multipart/form-data")) {
      // Handle multipart form data (with file)
      const formData = await request.formData();
      const file = formData.get("foto") as File | null;
      
      const data = {
        nama: formData.get("nama") as string,
        jabatan: formData.get("jabatan") as string,
        periode: formData.get("periode") as string,
        no: parseInt(formData.get("no") as string),
      };

      const result = await updatePengurusWithOptionalFoto(id, data, file);

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json(result.data);
    } else {
      // Handle JSON data (without file)
      const data = await request.json();

      const result = await updatePengurusWithOptionalFoto(id, {
        nama: data.nama,
        jabatan: data.jabatan,
        periode: data.periode,
        no: data.no,
      });

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json(result.data);
    }
  } catch (error) {
    console.error("Error updating pengurus:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate data pengurus" },
      { status: 500 }
    );
  }
}
