// src/components/content/form/types.ts
export interface ContentListItem {
  id: number;
  judul: string;
  deskripsi: string;
  tanggal: string; 
  waktu?: string;
  penulis: string;
  kategori: string;
  fotoUrl?: string;
  penting: boolean;
  no: number;
}