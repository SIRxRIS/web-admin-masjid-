// src/components/manajemen/program-kerja/ProgramKerjaForm.tsx
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
import { createProgramKerjaAction, updateProgramKerjaAction } from '@/actions/program-kerja';

type KategoriOrganisasi = 'PENGURUS_MASJID' | 'REMAS' | 'MAJLIS_TALIM';

const programKerjaSchema = z.object({
    kategori: z.enum(['PENGURUS_MASJID', 'REMAS', 'MAJLIS_TALIM']),
    seksi: z.string().min(2, 'Seksi minimal 2 karakter'),
    programKerja: z.string().min(10, 'Program kerja minimal 10 karakter'),
    urutan: z.number().min(1, 'Urutan minimal 1'),
    tahun: z.number().nullable(),
    isActive: z.boolean(),
});

type ProgramKerjaFormData = z.infer<typeof programKerjaSchema>;

interface ProgramKerjaItem {
    id: number;
    kategori: KategoriOrganisasi;
    seksi: string;
    programKerja: string;
    urutan: number;
    tahun: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ProgramKerjaFormProps {
    kategori: KategoriOrganisasi;
    editingItem?: ProgramKerjaItem | null;
    onClose: () => void;
}

const ProgramKerjaForm: React.FC<ProgramKerjaFormProps> = ({
    kategori,
    editingItem,
    onClose,
}) => {
    const [loading, setLoading] = useState(false);
    const isEditing = !!editingItem;

    const form = useForm<ProgramKerjaFormData>({
        resolver: zodResolver(programKerjaSchema),
        defaultValues: {
            kategori: kategori,
            seksi: '',
            programKerja: '',
            urutan: 1,
            tahun: null,
            isActive: true,
        },
    });

    useEffect(() => {
        if (editingItem) {
            form.reset({
                kategori: editingItem.kategori,
                seksi: editingItem.seksi,
                programKerja: editingItem.programKerja,
                urutan: editingItem.urutan,
                tahun: editingItem.tahun || new Date().getFullYear(),
                isActive: editingItem.isActive,
            });
        } else {
            form.reset({
                kategori: kategori,
                seksi: '',
                programKerja: '',
                urutan: 1,
                tahun: null,
                isActive: true,
            });
        }
    }, [editingItem, kategori, form]);

    const onSubmit = async (data: ProgramKerjaFormData) => {
        try {
            setLoading(true);

            let result;

            if (isEditing && editingItem) {
                // Update existing item
                result = await updateProgramKerjaAction(editingItem.id, data);

                if (!result.success) {
                    throw new Error(result.error || 'Gagal memperbarui program kerja');
                }

                toast.success('Program kerja berhasil diperbarui');
            } else {
                // Create new item
                result = await createProgramKerjaAction(data);

                if (!result.success) {
                    throw new Error(result.error || 'Gagal menambahkan program kerja');
                }

                toast.success('Program kerja berhasil ditambahkan');
            }

            onClose();
        } catch (error: any) {
            console.error('Error saving program kerja:', error);
            toast.error(error.message || 'Gagal menyimpan data');
        } finally {
            setLoading(false);
        }
    };

    const kategoriOptions = [
        { value: 'PENGURUS_MASJID', label: 'Pengurus Masjid' },
        { value: 'REMAS', label: 'Remas' },
        { value: 'MAJLIS_TALIM', label: 'Majlis Ta\'lim' },
    ];

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Program Kerja' : 'Tambah Program Kerja'}
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
                                name="seksi"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Seksi/Divisi</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Masukkan nama seksi..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="programKerja"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Program Kerja</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Masukkan program kerja..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                name="tahun"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tahun (Opsional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="2020"
                                                max="2100"
                                                placeholder="2024"
                                                {...field}
                                                value={field.value || ''}
                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
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
                                    <FormItem className="flex flex-col justify-end rounded-lg border p-3">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-sm">Status Aktif</FormLabel>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Tampilkan di publik
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={loading} className='bg-blue-600 hover:bg-blue-700 text-white'>
                                {loading ? 'Menyimpan...' : isEditing ? 'Perbarui' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default ProgramKerjaForm;