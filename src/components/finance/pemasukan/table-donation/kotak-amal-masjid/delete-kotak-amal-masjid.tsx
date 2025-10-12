// src/components/finance/pemasukan/table-donation/kotak-amal-masjid/delete-kotak-amal-masjid.tsx
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
import { deleteKotakAmalMasjid } from "@/actions/kotak-amal-masjid"; 

interface DeleteKotakAmalMasjidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
  kotakAmalName: string;
  kotakAmalId: number;
}

export function DeleteKotakAmalMasjidDialog({
  isOpen,
  onClose,
  onConfirm,
  kotakAmalName,
  kotakAmalId,
}: DeleteKotakAmalMasjidDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirm = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const result = await deleteKotakAmalMasjid(kotakAmalId);

      if (!result.success) {
        console.error("Error deleting kotak amal masjid:", result.error);
        throw new Error(result.error || "Gagal menghapus data kotak amal masjid");
      }

      await onConfirm(kotakAmalId);

      await Swal.fire({
        title: "Terhapus!",
        text: "Data kotak amal masjid berhasil dihapus",
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
          <AlertDialogTitle>Hapus Data Kotak Amal Masjid</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus data kotak amal masjid tanggal{" "}
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