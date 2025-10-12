"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { createVisiMisiAction, updateVisiMisiAction } from '@/actions/visi-misi';

type KategoriVisiMisi = 'MASJID' | 'REMAS' | 'MAJLIS_TALIM';
type JenisVisiMisi = 'VISI' | 'MISI';

const visiMisiSchema = z.object({
  kategori: z.enum(['MASJID', 'REMAS', 'MAJLIS_TALIM']),
  jenis: z.enum(['VISI', 'MISI']),
  konten: z.string().min(10, 'Konten minimal 10 karakter').max(1000, 'Konten maksimal 1000 karakter'),
  divisi: z.string().optional().nullable(),
  urutan: z.number().min(1, 'Urutan minimal 1').max(100, 'Urutan maksimal 100'),
  isActive: z.boolean(),
});

type VisiMisiFormData = z.infer<typeof visiMisiSchema>;

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

interface VisiMisiFormProps {
  kategori: KategoriVisiMisi;
  editingItem?: VisiMisiItem | null;
  onClose: () => void;
}

const VisiMisiForm: React.FC<VisiMisiFormProps> = ({
  kategori,
  editingItem,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const isEditing = !!editingItem;

  const form = useForm<VisiMisiFormData>({
    resolver: zodResolver(visiMisiSchema),
    defaultValues: {
      kategori: kategori,
      jenis: 'VISI',
      konten: '',
      divisi: '',
      urutan: 1,
      isActive: true,
    },
  });

  useEffect(() => {
    if (editingItem) {
      form.reset({
        kategori: editingItem.kategori,
        jenis: editingItem.jenis,
        konten: editingItem.konten,
        divisi: editingItem.divisi || '',
        urutan: editingItem.urutan,
        isActive: editingItem.isActive,
      });
    } else {
      form.reset({
        kategori: kategori,
        jenis: 'VISI',
        konten: '',
        divisi: '',
        urutan: 1,
        isActive: true,
      });
    }
  }, [editingItem, kategori, form]);

  const onSubmit = async (data: VisiMisiFormData) => {
    try {
      setLoading(true);
      
      let result;
      
      if (isEditing && editingItem) {
        // Update existing item
        result = await updateVisiMisiAction(editingItem.id, data);

        if (!result.success) {
          throw new Error(result.error || 'Gagal memperbarui visi/misi');
        }

        toast.success('Visi/Misi berhasil diperbarui');
      } else {
        // Create new item
        result = await createVisiMisiAction(data);

        if (!result.success) {
          throw new Error(result.error || 'Gagal menambahkan visi/misi');
        }

        toast.success('Visi/Misi berhasil ditambahkan');
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving visi misi:', error);
      toast.error(error.message || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const kategoriOptions = [
    { value: 'MASJID', label: 'Pengurus Masjid' },
    { value: 'REMAS', label: 'Remas' },
    { value: 'MAJLIS_TALIM', label: 'Majlis Ta\'lim' },
  ];

  const jenisOptions = [
    { value: 'VISI', label: 'Visi' },
    { value: 'MISI', label: 'Misi' },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Visi/Misi' : 'Tambah Visi/Misi'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kategori"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {kategoriOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jenis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jenisOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="konten"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konten</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan konten visi atau misi..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="divisi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Divisi/Seksi (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Divisi Dakwah, Seksi Pemuda, dll..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <div className="text-sm text-muted-foreground">
                    Kosongkan jika berlaku untuk seluruh organisasi
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="urutan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urutan</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status Aktif</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Tampilkan di halaman publik
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : isEditing ? 'Perbarui' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VisiMisiForm;