import { ColumnDef } from "@tanstack/react-table";
import { KotakAmalJumatData } from "../schema";
import { formatCurrency } from "../utils";
import { TableActions } from "./table-actions";
import { format, isValid } from "date-fns";
import { id } from "date-fns/locale";

interface ColumnOptions {
  onEdit?: (kotakAmal: KotakAmalJumatData) => void;
  onViewDetail?: (kotakAmal: KotakAmalJumatData) => void;
  onDelete?: (id: number) => void;
}

export const columns = ({
  onEdit,
  onViewDetail,
  onDelete,
}: ColumnOptions = {}): ColumnDef<KotakAmalJumatData>[] => [
  {
    accessorKey: "id",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "tanggal",
    header: () => <div className="text-center">Tanggal</div>,
    cell: ({ row }) => {
      try {
        const dateValue = row.getValue("tanggal");
        const date =
          dateValue instanceof Date ? dateValue : new Date(dateValue as string);

        if (!isValid(date)) {
          return <div className="text-center">Format tanggal tidak valid</div>;
        }

        return (
          <div className="text-center">
            {format(date, "dd MMMM yyyy", { locale: id })}
          </div>
        );
      } catch (error) {
        console.error("Error formatting date:", error);
        return <div className="text-center">Format tanggal tidak valid</div>;
      }
    },
  },
  {
    accessorKey: "jumlah",
    header: () => <div className="text-center">Jumlah</div>,
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {formatCurrency(row.getValue("jumlah"))}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-center gap-2">
        <TableActions
          donasi={row.original}
          onViewDetail={onViewDetail}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    ),
    size: 100,
  },
];