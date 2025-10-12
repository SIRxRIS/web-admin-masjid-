import { ColumnDef } from "@tanstack/react-table";
import { KotakAmalData } from "../schema";
import { formatCurrency } from "../utils";
import { TableActions } from "./table-actions";

interface ColumnOptions {
  onEdit?: (kotakAmal: KotakAmalData) => void;
  onViewDetail?: (kotakAmal: KotakAmalData) => void;
  onDelete?: (id: number) => void;
}

export const columns = ({
  onEdit,
  onViewDetail,
  onDelete,
}: ColumnOptions = {}): ColumnDef<KotakAmalData>[] => [
  {
    accessorKey: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("no")}</div>,
  },
  {
    accessorKey: "nama",
    header: () => <div className="text-center">Nama Kotak Amal</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("nama")}</div>
    ),
  },
  {
    accessorKey: "lokasi",
    header: () => <div className="text-center">Lokasi</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("lokasi")}</div>
    ),
  },
  {
    accessorKey: "jan",
    header: () => <div className="text-center">Jan</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("jan"))}</div>
    ),
  },
  {
    accessorKey: "feb",
    header: () => <div className="text-center">Feb</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("feb"))}</div>
    ),
  },
  {
    accessorKey: "mar",
    header: () => <div className="text-center">Mar</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("mar"))}</div>
    ),
  },
  {
    accessorKey: "apr",
    header: () => <div className="text-center">Apr</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("apr"))}</div>
    ),
  },
  {
    accessorKey: "mei",
    header: () => <div className="text-center">Mei</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("mei"))}</div>
    ),
  },
  {
    accessorKey: "jun",
    header: () => <div className="text-center">Jun</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("jun"))}</div>
    ),
  },
  {
    accessorKey: "jul",
    header: () => <div className="text-center">Jul</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("jul"))}</div>
    ),
  },
  {
    accessorKey: "aug",
    header: () => <div className="text-center">Agust</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("aug"))}</div>
    ),
  },
  {
    accessorKey: "sep",
    header: () => <div className="text-center">Sept</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("sep"))}</div>
    ),
  },
  {
    accessorKey: "okt",
    header: () => <div className="text-center">Okt</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("okt"))}</div>
    ),
  },
  {
    accessorKey: "nov",
    header: () => <div className="text-center">Nov</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("nov"))}</div>
    ),
  },
  {
    accessorKey: "des",
    header: () => <div className="text-center">Des</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatCurrency(row.getValue("des"))}</div>
    ),
  },
  {
    id: "jumlah",
    header: () => <div className="text-center font-medium">Jumlah</div>,
    cell: ({ row }) => {
      const rowSum =
        (row.getValue("jan") as number) +
        (row.getValue("feb") as number) +
        (row.getValue("mar") as number) +
        (row.getValue("apr") as number) +
        (row.getValue("mei") as number) +
        (row.getValue("jun") as number) +
        (row.getValue("jul") as number) +
        (row.getValue("aug") as number) +
        (row.getValue("sep") as number) +
        (row.getValue("okt") as number) +
        (row.getValue("nov") as number) +
        (row.getValue("des") as number);

      return (
        <div className="text-center font-medium">{formatCurrency(rowSum)}</div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <TableActions
          kotakAmal={row.original}
          onViewDetail={onViewDetail}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    ),
  },
];

export default columns;
