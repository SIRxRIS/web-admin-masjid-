"use client";

import * as React from "react";
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
import { createClient } from "@/lib/supabase/client";

interface DeleteRekapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<boolean>;
  type: "pemasukan" | "pengeluaran";
  id: number;
}

export function DeleteRekapDialog({
  isOpen,
  onClose,
  onConfirm,
  type,
  id,
}: DeleteRekapDialogProps) {
  const handleConfirm = async () => {
    try {
      const tableName = type === "pemasukan" ? "Pemasukan" : "Pengeluaran";
      const supabase = createClient();
      const { error } = await supabase.from(tableName).delete().eq("id", id);

      if (error) {
        console.error(`Error menghapus ${type}:`, error);
        throw new Error(`Gagal menghapus data ${type}`);
      }

      await onConfirm(id);
      onClose();
    } catch (err) {
      console.error("Error dalam handleConfirm:", err);
      throw new Error("Terjadi kesalahan saat menghapus data");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Hapus Data {type === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat
            dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}