"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { deleteVisiMisiAction, toggleVisiMisiActiveAction } from '@/actions/visi-misi';

type KategoriVisiMisi = 'MASJID' | 'REMAS' | 'MAJLIS_TALIM';
type JenisVisiMisi = 'VISI' | 'MISI';

interface VisiMisiItem {
  id: number;
  kategori: KategoriVisiMisi;
  jenis: JenisVisiMisi;
  konten: string;
  divisi?: string | null;
  urutan: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VisiMisiCardProps {
  kategori: KategoriVisiMisi;
  onEdit: (item: VisiMisiItem) => void;
  initialData: any[];
  error?: string | null;
}

const VisiMisiCard: React.FC<VisiMisiCardProps> = ({ 
  kategori, 
  onEdit, 
  initialData,
  error
}) => {
  const router = useRouter();
  const [visiItems, setVisiItems] = useState<VisiMisiItem[]>([]);
  const [misiItems, setMisiItems] = useState<VisiMisiItem[]>([]);

  // Initialize data from server-provided props only
  useEffect(() => {
    const visi = initialData.filter((item: VisiMisiItem) => 
      item.kategori === kategori && item.jenis === 'VISI'
    );
    const misi = initialData.filter((item: VisiMisiItem) => 
      item.kategori === kategori && item.jenis === 'MISI'
    );
    
    setVisiItems(visi);
    setMisiItems(misi);
  }, [kategori, initialData]);

  // Show error if any
  useEffect(() => {
    if (error) {
      toast.error('Error memuat data visi misi: ' + error);
    }
  }, [error]);

  const handleToggleActive = async (item: VisiMisiItem) => {
    try {
      const result = await toggleVisiMisiActiveAction(item.id, !item.isActive);

      if (!result.success) {
        throw new Error(result.error || 'Gagal mengubah status');
      }

      toast.success(`${item.jenis} berhasil ${item.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
      
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal mengubah status');
    }
  };

  const handleDelete = async (item: VisiMisiItem) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${item.jenis.toLowerCase()} ini?`)) {
      return;
    }

    try {
      const result = await deleteVisiMisiAction(item.id);

      if (!result.success) {
        throw new Error(result.error || 'Gagal menghapus data');
      }

      toast.success(`${item.jenis} berhasil dihapus`);
      
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error deleting visi misi:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus data');
    }
  };

  const renderItems = (items: VisiMisiItem[], title: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="outline">{items.length} item</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Belum ada {title.toLowerCase()} yang ditambahkan
          </p>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg ${
                  item.isActive ? 'bg-white' : 'bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">#{item.urutan}</Badge>
                      {item.divisi && (
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {item.divisi}
                        </Badge>
                      )}
                      {!item.isActive && (
                        <Badge variant="outline" className="text-gray-500">
                          Tidak Aktif
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{item.konten}</p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(item)}
                      title={item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      {item.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item)}
                      title="Hapus"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {renderItems(visiItems, 'Visi')}
      {renderItems(misiItems, 'Misi')}
    </div>
  );
};

export default VisiMisiCard;