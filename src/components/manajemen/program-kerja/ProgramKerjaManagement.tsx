// src/components/manajemen/program-kerja/ProgramKerjaManagement.tsx
"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProgramKerjaCard from './ProgramKerjaCard';
import ProgramKerjaForm from './ProgramKerjaForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type KategoriOrganisasi = 'PENGURUS_MASJID' | 'REMAS' | 'MAJLIS_TALIM';

interface ProgramKerjaManagementProps {
    initialData: {
        id: number;
        kategori: KategoriOrganisasi;
        seksi: string;
        programKerja: string;
        urutan: number;
        tahun: number | null;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }[];
    error?: string | null;
}

const ProgramKerjaManagement: React.FC<ProgramKerjaManagementProps> = ({
    initialData,
    error
}) => {
    const [activeTab, setActiveTab] = useState<KategoriOrganisasi>('PENGURUS_MASJID');
    const [editingItem, setEditingItem] = useState<ProgramKerjaManagementProps['initialData'][0] | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleAddNew = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingItem(null);
        // Data will be refreshed on next page load
    };

    const tabs = [
        { value: 'PENGURUS_MASJID', label: 'Pengurus Masjid' },
        { value: 'REMAS', label: 'Remas' },
        { value: 'MAJLIS_TALIM', label: 'Majlis Ta\'lim' },
    ];

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as KategoriOrganisasi)}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        {tabs.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value}>
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Program Kerja
                    </Button>
                </div>

                {tabs.map((tab) => (
                    <TabsContent key={tab.value} value={tab.value} className="space-y-6">
                        <ProgramKerjaCard
                            kategori={tab.value as KategoriOrganisasi}
                            onEdit={handleEdit}
                            initialData={initialData.filter(item => item.kategori === tab.value)}
                            error={error}
                        />
                    </TabsContent>
                ))}
            </Tabs>

            {isFormOpen && (
                <ProgramKerjaForm
                    kategori={activeTab}
                    editingItem={editingItem}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    );
};

export default ProgramKerjaManagement;