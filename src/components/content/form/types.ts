// src/components/content/form/types.ts
export interface ContentListItem {
  id: number;
  judul: string;
  deskripsi: string;
  tanggal: string; 
  waktu?: string;
  penulis: string;
  kategoriId: number;
  fotoUrl?: string;
  penting: boolean;
  no: number;
}