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
import { deleteDonasiKhususAction } from "@/actions/donasi-khusus";

interface DeleteDonasiKhususDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
  donasiName: string;
  donasiId: number;
}

export function DeleteDonasiKhususDialog({
  isOpen,
  onClose,
  onConfirm,
  donasiName,
  donasiId,
}: DeleteDonasiKhususDialogProps) {
  const handleConfirm = async () => {
    try {
      const result = await deleteDonasiKhususAction(donasiId);

      if (!result.success) {
        console.error("Error deleting donasi:", result.error);
        Swal.fire({
          title: "Error!",
          text: result.error || "Gagal menghapus data donasi",
          icon: "error",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return;
      }

      await onConfirm(donasiId);
      Swal.fire({
        title: "Terhapus!",
        text: "Data donasi berhasil dihapus",
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
          <AlertDialogTitle>Hapus Data Donasi</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus data donasi dari{" "}
            <strong>{donasiName}</strong>? Tindakan ini tidak dapat dibatalkan.
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
