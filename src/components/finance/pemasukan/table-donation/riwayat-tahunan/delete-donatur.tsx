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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { deleteDonaturAction } from "@/actions/donatur";

interface DeleteDonaturDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<boolean>;
  donaturName: string;
  donaturId: number;
}

export function DeleteDonaturDialog({
  isOpen,
  onClose,
  onConfirm,
  donaturName,
  donaturId,
}: DeleteDonaturDialogProps) {
  const handleConfirm = async () => {
    try {
      const result = await deleteDonaturAction(donaturId);

      if (!result.success) {
        console.error("Error deleting donatur:", result.error);
        Swal.fire({
          title: "Error!",
          text: result.error || "Gagal menghapus data donatur",
          icon: "error",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return;
      }
      await onConfirm(donaturId);

      Swal.fire({
        title: "Terhapus!",
        text: "Data donatur berhasil dihapus",
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
          <AlertDialogTitle>Hapus Data Donatur</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus data donatur{" "}
            <strong>{donaturName}</strong>? Tindakan ini tidak dapat dibatalkan.
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
