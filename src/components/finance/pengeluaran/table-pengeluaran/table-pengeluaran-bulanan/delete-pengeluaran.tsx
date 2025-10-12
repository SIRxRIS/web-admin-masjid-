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
import Swal from "sweetalert2";
import { createClient } from "@/lib/supabase/client";

interface DeletePengeluaranDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<boolean>;
  pengeluaranName: string;
  pengeluaranId: number;
}

export function DeletePengeluaranDialog({
  isOpen,
  onClose,
  onConfirm,
  pengeluaranName,
  pengeluaranId,
}: DeletePengeluaranDialogProps) {
  const handleConfirm = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("Pengeluaran")
        .delete()
        .eq("id", pengeluaranId);

      if (error) {
        console.error("Error deleting pengeluaran:", error);
        Swal.fire({
          title: "Error!",
          text: "Gagal menghapus data pengeluaran",
          icon: "error",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return;
      }
      await onConfirm(pengeluaranId);

      Swal.fire({
        title: "Terhapus!",
        text: "Data pengeluaran berhasil dihapus",
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      onClose();
    } catch (err) {
      console.error("Error in handleConfirm:", err);
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat menghapus data",
        icon: "error",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Data Pengeluaran</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus data pengeluaran{" "}
            <strong>{pengeluaranName}</strong>? Tindakan ini tidak dapat
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
