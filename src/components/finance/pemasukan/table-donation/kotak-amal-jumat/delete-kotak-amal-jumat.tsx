// src/components/finance/pemasukan/table-donation/kotak-amal-jumat/delete-kotak-amal-jumat.tsx
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
import { deleteKotakAmalJumatAction } from "@/actions/kotak-amal-jumat"; 

interface DeleteKotakAmalJumatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
  kotakAmalName: string;
  kotakAmalId: number;
}

export function DeleteKotakAmalJumatDialog({
  isOpen,
  onClose,
  onConfirm,
  kotakAmalName,
  kotakAmalId,
}: DeleteKotakAmalJumatDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirm = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const result = await deleteKotakAmalJumatAction(kotakAmalId);

      if (!result.success) {
        console.error("Error deleting kotak amal jumat:", result.error);
        throw new Error(result.error || "Gagal menghapus data kotak amal jumat");
      }

      await onConfirm(kotakAmalId);

      await Swal.fire({
        title: "Terhapus!",
        text: "Data kotak amal jumat berhasil dihapus",
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      onClose();
    } catch (err) {
      console.error("Error in handleConfirm:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus data";

      await Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Data Kotak Amal Jumat</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus data kotak amal jumat tanggal{" "}
            <strong>{kotakAmalName}</strong>? Tindakan ini tidak dapat
            dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {isDeleting ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}