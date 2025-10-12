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
import { deletePengeluaranAction } from "@/actions/pengeluaran";

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
      const result = await deletePengeluaranAction(pengeluaranId, { success: false, message: "" }, new FormData());

      if (!result.success) {
        console.error("Error deleting pengeluaran:", result.message);
        Swal.fire({
          title: "Error!",
          text: result.message || "Gagal menghapus data pengeluaran",
          icon: "error",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return;
      }

      // Panggil onConfirm untuk memperbarui UI atau melakukan tindakan lain setelah penghapusan
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
