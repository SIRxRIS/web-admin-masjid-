import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical } from "@tabler/icons-react";
import { KotakAmalMasjidData } from "../schema";

interface TableActionsProps {
  donasi: KotakAmalMasjidData;
  onEdit?: (donasi: KotakAmalMasjidData) => void;
  onViewDetail?: (donasi: KotakAmalMasjidData) => void;
  onDelete?: (id: number) => void;
}

export function TableActions({
  donasi,
  onEdit,
  onViewDetail,
  onDelete,
}: TableActionsProps) {
  return (
    <div className="flex justify-end">
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
          <DropdownMenuItem onClick={() => onEdit?.(donasi)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onViewDetail?.(donasi)}>
            Lihat Detail
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            variant="destructive" 
            onClick={() => onDelete?.(donasi.id)}
          >
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}