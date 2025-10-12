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
import { RekapPemasukan, RekapPengeluaran } from "@/lib/schema/laporan/schema";
import { DeleteRekapDialog } from "./delete-rekap";

interface TableActionsProps {
  data: RekapPemasukan | RekapPengeluaran;
  onViewDetail?: (data: RekapPemasukan | RekapPengeluaran) => void;
  onEdit?: (data: RekapPemasukan | RekapPengeluaran) => void;
  onDelete?: (id: number) => void;
  type: 'pemasukan' | 'pengeluaran';
}

export function TableActions({
  data,
  onViewDetail,
  onEdit,
  onDelete,
  type,
}: TableActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(data.id);
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
          <DropdownMenuItem onClick={() => onEdit?.(data)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onViewDetail?.(data)}>
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

      <DeleteRekapDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        type={type}
        id={data.id}
      />
    </>
  );
}
