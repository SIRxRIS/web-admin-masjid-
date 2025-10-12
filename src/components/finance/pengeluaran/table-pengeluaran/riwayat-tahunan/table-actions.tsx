"use client";

import * as React from "react";
import { IconDotsVertical } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PengeluaranTahunanData } from "../schema";
import { DeletePengeluaranDialog } from "./delete-pengeluaran";

interface TableActionsProps {
  donatur: PengeluaranTahunanData;
  onViewDetail?: (data: PengeluaranTahunanData) => void;
  onEdit?: (data: PengeluaranTahunanData) => void;
  onDelete?: (id: number) => void;
}

export function TableActions({
  donatur,
  onViewDetail,
  onEdit,
  onDelete,
}: TableActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(donatur.id);
      return true;
    }
    return false;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => onEdit?.(donatur)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onViewDetail?.(donatur)}>
            Lihat Detail
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeletePengeluaranDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        pengeluaranName={donatur.pengeluaran}
        pengeluaranId={donatur.id}
      />
    </>
  );
}