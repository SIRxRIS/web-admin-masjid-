"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VisiMisiCard from './VisiMisiCard';
import VisiMisiForm from './VisiMisiForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type KategoriVisiMisi = 'MASJID' | 'REMAS' | 'MAJLIS_TALIM';

interface VisiMisiManagementProps {
  initialData: any[];
  error?: string | null;
}

const VisiMisiManagement: React.FC<VisiMisiManagementProps> = ({ 
  initialData, 
  error 
}) => {
  const [activeTab, setActiveTab] = useState<KategoriVisiMisi>('MASJID');
  const [editingItem, setEditingItem] = useState<any>(null);
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
    { value: 'MASJID', label: 'Pengurus Masjid' },
    { value: 'REMAS', label: 'Remas' },
    { value: 'MAJLIS_TALIM', label: 'Majlis Ta\'lim' },
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as KategoriVisiMisi)}>
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white" size="lg">
            <Plus className="w-4 h-4" />
            Tambah Visi/Misi
          </Button>
        </div>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-6">
            <VisiMisiCard 
              kategori={tab.value as KategoriVisiMisi}
              onEdit={handleEdit}
              initialData={initialData.filter(item => item.kategori === tab.value)}
              error={error}
            />
          </TabsContent>
        ))}
      </Tabs>

      {isFormOpen && (
        <VisiMisiForm
          kategori={activeTab}
          editingItem={editingItem}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default VisiMisiManagement;