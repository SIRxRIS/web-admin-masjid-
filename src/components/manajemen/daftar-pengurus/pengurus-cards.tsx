// src/components/manajemen/daftar-pengurus/pengurus-cards.tsx
"use client";

import { useState, useEffect, useOptimistic, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PengurusData } from "@/lib/schema/pengurus/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { EditPengurus } from "./edit";
import { deletePengurusAction } from "@/actions/pengurus";
import { TableViewTabs } from "./table-view-tabs";

interface PengurusCardsProps {
  initialData: PengurusData[];
  error: string | null;
  onAddClick?: () => void;
}

export function PengurusCards({ initialData, error, onAddClick }: PengurusCardsProps) {
  const [pengurus, setPengurus] = useState<PengurusData[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editData, setEditData] = useState<PengurusData | null>(null);

  // State untuk search dan filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("ALL");

  // Optimistic updates untuk better UX
  const [optimisticPengurus, addOptimisticPengurus] = useOptimistic(
    pengurus,
    (state, action: { type: 'delete', id: number } | { type: 'update', data: PengurusData }) => {
      if (action.type === 'delete') {
        return state.filter(item => item.id !== action.id);
      } else {
        return state.map(item => 
          item.id === action.data.id ? action.data : item
        );
      }
    }
  );

  // Function untuk fetch years dari data pengurus
  const fetchYears = async (): Promise<number[]> => {
    try {
      // Extract years dari periode (format: "2023-2027")
      const years = optimisticPengurus.map(item => {
        const periode = item.periode;
        const yearMatch = periode.match(/(\d{4})/);
        return yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
      });
      
      // Return unique years
      return [...new Set(years)].sort((a, b) => b - a);
    } catch (error) {
      console.error("Error fetching years:", error);
      return [new Date().getFullYear()];
    }
  };

  // Filter data berdasarkan search, year, dan kategori
  const filteredPengurus = useMemo(() => {
    return optimisticPengurus.filter(item => {
      const matchesSearch = searchQuery === "" || 
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.jabatan.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesYear = selectedYear === "" || 
        item.periode.includes(selectedYear);
      
      const matchesKategori = selectedKategori === "ALL" || 
        item.kategori === selectedKategori;
      
      return matchesSearch && matchesYear && matchesKategori;
    });
  }, [optimisticPengurus, searchQuery, selectedYear, selectedKategori]);

  useEffect(() => {
    if (error) {
      toast.error("Error", { description: error });
    }
  }, [error]);

  const handleDelete = async () => {
    if (deleteId === null) return;

    setLoading(true);
    
    // Optimistic delete
    addOptimisticPengurus({ type: 'delete', id: deleteId });
    
    try {
      const result = await deletePengurusAction(deleteId);
      
      if (result.success) {
        setPengurus(prev => prev.filter(item => item.id !== deleteId));
        toast.success("Berhasil", {
          description: "Data pengurus berhasil dihapus",
        });
      } else {
        // Revert optimistic update pada error
        setPengurus(pengurus);
        toast.error("Error", { description: result.error });
      }
    } catch (error) {
      // Revert optimistic update pada error
      setPengurus(pengurus);
      toast.error("Error", { description: "Gagal menghapus data pengurus" });
      console.error("Error deleting pengurus:", error);
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const handleEdit = (data: PengurusData) => {
    setEditData(data);
    setShowEditDialog(true);
  };

  const handleSaveEdit = (updatedData: PengurusData) => {
    // Optimistic update
    addOptimisticPengurus({ type: 'update', data: updatedData });
    setPengurus(prev =>
      prev.map(item =>
        item.id === updatedData.id ? updatedData : item
      )
    );
  };

  // Loading skeleton
  if (loading && optimisticPengurus.length === 0) {
    return (
      <div className="space-y-4">
        <TableViewTabs
          isLoading={true}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          year={selectedYear}
          setYear={setSelectedYear}
          kategori={selectedKategori}
          setKategori={setSelectedKategori}
          fetchYears={fetchYears}
          onAddClick={onAddClick} // ✅ Sekarang sudah sesuai dengan interface
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-[22px] p-6 bg-gray-200 dark:bg-gray-800"
            >
              <div className="w-full h-64 bg-gray-300 dark:bg-gray-700 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
              <div className="flex gap-2 justify-center">
                <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table View Tabs - Search, Year Filter, dan Tambah */}
      <TableViewTabs
        isLoading={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        year={selectedYear}
        setYear={setSelectedYear}
        kategori={selectedKategori}
        setKategori={setSelectedKategori}
        fetchYears={fetchYears}
        onAddClick={onAddClick} // ✅ Sekarang sudah sesuai dengan interface
        placeholder="Cari nama pengurus atau jabatan..."
      />

      {/* Cards Grid */}
      {filteredPengurus.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8">
          <h3 className="text-lg font-medium">
            {searchQuery || selectedYear ? "Tidak ada data yang sesuai" : "Belum ada data pengurus"}
          </h3>
          <p className="text-sm text-gray-500">
            {searchQuery || selectedYear 
              ? "Coba ubah kata kunci pencarian atau filter tahun"
              : "Silakan tambahkan data pengurus baru"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {filteredPengurus.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
                ease: "easeOut",
              }}
            >
              <Card className="group h-full overflow-hidden border transition-all duration-300 hover:border-primary/20 hover:shadow-lg rounded-[22px] bg-white dark:bg-zinc-900">
                <CardContent className="pt-6 px-4 sm:px-6 flex flex-col items-center">
                  <div className="w-full aspect-[4/5] overflow-hidden rounded-xl">
                    <img
                      src={item.fotoUrl}
                      alt={item.nama}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="text-center mt-4">
                    <CardTitle className="text-lg font-semibold text-black dark:text-white">
                      {item.nama}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {item.jabatan}
                    </CardDescription>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {item.periode}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-center gap-2 pb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    disabled={loading}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => confirmDelete(item.id)}
                    disabled={loading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Alert Dialog Hapus */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data pengurus ini? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Edit Pengurus */}
      <EditPengurus
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        data={editData}
        onSave={handleSaveEdit}
      />
    </div>
  );
}