// src/components/manajemen/program-kerja/ProgramKerjaCard.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { deleteProgramKerjaAction, toggleProgramKerjaActiveAction } from '@/actions/program-kerja';

type KategoriOrganisasi = 'PENGURUS_MASJID' | 'REMAS' | 'MAJLIS_TALIM';

interface ProgramKerjaItem {
    id: number;
    kategori: KategoriOrganisasi;
    seksi: string;
    programKerja: string;
    urutan: number;
    tahun?: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ProgramKerjaCardProps {
    kategori: KategoriOrganisasi;
    onEdit: (item: ProgramKerjaItem) => void;
    initialData: any[];
    error?: string | null;
}

const ProgramKerjaCard: React.FC<ProgramKerjaCardProps> = ({
    kategori,
    onEdit,
    initialData,
    error
}) => {
    const router = useRouter();
    const [programKerjaItems, setProgramKerjaItems] = useState<ProgramKerjaItem[]>([]);
    const [groupedBySeksi, setGroupedBySeksi] = useState<Record<string, ProgramKerjaItem[]>>({});

    // Initialize data from server-provided props only
    useEffect(() => {
        const items = initialData.filter((item: ProgramKerjaItem) =>
            item.kategori === kategori
        );

        setProgramKerjaItems(items);

        // Group by seksi
        const grouped = items.reduce((acc: Record<string, ProgramKerjaItem[]>, item: ProgramKerjaItem) => {
            if (!acc[item.seksi]) {
                acc[item.seksi] = [];
            }
            acc[item.seksi].push(item);
            return acc;
        }, {});

        // Sort items within each seksi by urutan
        Object.keys(grouped).forEach(seksi => {
            grouped[seksi].sort((a: ProgramKerjaItem, b: ProgramKerjaItem) => a.urutan - b.urutan);
        });

        setGroupedBySeksi(grouped);
    }, [kategori, initialData]);

    // Show error if any
    useEffect(() => {
        if (error) {
            toast.error('Error memuat data program kerja: ' + error);
        }
    }, [error]);

    const handleToggleActive = async (item: ProgramKerjaItem) => {
        try {
            const result = await toggleProgramKerjaActiveAction(item.id, !item.isActive);

            if (!result.success) {
                throw new Error(result.error || 'Gagal mengubah status');
            }

            toast.success(`Program kerja berhasil ${item.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);

            // Refresh the page to show updated data
            router.refresh();
        } catch (error) {
            console.error('Error toggling active status:', error);
            toast.error(error instanceof Error ? error.message : 'Gagal mengubah status');
        }
    };

    const handleDelete = async (item: ProgramKerjaItem) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus program kerja ini?`)) {
            return;
        }

        try {
            const result = await deleteProgramKerjaAction(item.id);

            if (!result.success) {
                throw new Error(result.error || 'Gagal menghapus data');
            }

            toast.success('Program kerja berhasil dihapus');

            // Refresh the page to show updated data
            router.refresh();
        } catch (error) {
            console.error('Error deleting program kerja:', error);
            toast.error(error instanceof Error ? error.message : 'Gagal menghapus data');
        }
    };

    const renderSeksiCard = (seksi: string, items: ProgramKerjaItem[]) => (
        <Card key={seksi}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Seksi {seksi}</span>
                    <Badge variant="outline">{items.length} program</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        Belum ada program kerja di seksi ini
                    </p>
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={`p-4 border rounded-lg ${item.isActive ? 'bg-white' : 'bg-gray-50 opacity-60'
                                    }`}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="secondary">#{item.urutan}</Badge>
                                            {item.tahun && (
                                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                                    Tahun {item.tahun}
                                                </Badge>
                                            )}
                                            {!item.isActive && (
                                                <Badge variant="outline" className="text-gray-500">
                                                    Tidak Aktif
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-gray-800 leading-relaxed">{item.programKerja}</div>
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
        <div className="space-y-6">
            {Object.keys(groupedBySeksi).length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <p className="text-gray-500 text-center">
                            Belum ada program kerja yang ditambahkan untuk kategori ini
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {Object.keys(groupedBySeksi).sort().map(seksi =>
                        renderSeksiCard(seksi, groupedBySeksi[seksi])
                    )}
                </div>
            )}
        </div>
    );
};

export default ProgramKerjaCard;