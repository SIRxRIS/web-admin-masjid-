import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical } from "@tabler/icons-react";
import { KotakAmalData } from "../schema";

interface TableActionsProps {
  kotakAmal: KotakAmalData;
  onEdit?: (kotakAmal: KotakAmalData) => void;
  onViewDetail?: (kotakAmal: KotakAmalData) => void;
  onDelete?: (id: number) => void;
}

export function TableActions({
  kotakAmal,
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
          <DropdownMenuItem onClick={() => onEdit?.(kotakAmal)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onViewDetail?.(kotakAmal)}>
            Lihat Detail
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            variant="destructive" 
            onClick={() => onDelete?.(kotakAmal.id)}
          >
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}