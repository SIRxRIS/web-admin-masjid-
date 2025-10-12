"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { columns, processRekapData } from "./columns";
import { type RekapPengeluaran, type RekapPemasukan } from "@/lib/schema/laporan/schema";
import { TablePagination } from "./table-pagination";
import { TableToolbar } from "../../table-toolbar";

interface TableRekapTahunanProps {
  pemasukanData: RekapPemasukan[];
  pengeluaranData: RekapPengeluaran[];
  tahun: number;
  namaMasjid?: string;
  onDataChange?: (type: 'pemasukan' | 'pengeluaran', data: RekapPemasukan[] | RekapPengeluaran[]) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  availableYears?: string[];
  setYear?: (year: string) => void;
}

export function TableRekapTahunan({
  pemasukanData,
  pengeluaranData,
  tahun,
  namaMasjid = 'Jawahiruzzarqa', 
  onDataChange,
  searchQuery = "",
  setSearchQuery,
  availableYears = [],
  setYear,
}: TableRekapTahunanProps) {
  const processedData = React.useMemo(() => 
    processRekapData(pemasukanData, pengeluaranData), 
    [pemasukanData, pengeluaranData]
  );

  const [data, setData] = React.useState(processedData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 100, 
  });

  React.useEffect(() => {
    setData(processRekapData(pemasukanData, pengeluaranData));
  }, [pemasukanData, pengeluaranData]);

  const handleViewDetail = (data: RekapPemasukan | RekapPengeluaran) => {
    console.log("Lihat detail", data);
  };

  const handleEdit = (data: RekapPemasukan | RekapPengeluaran) => {
    console.log("Edit data", data);
  };
  
  const handleDelete = (id: number) => {
    const findItemInPemasukan = pemasukanData.find(item => item.id === id);
    const findItemInPengeluaran = pengeluaranData.find(item => item.id === id);
    
    if (findItemInPemasukan) {
      const newPemasukanData = pemasukanData.filter(item => item.id !== id);
      if (onDataChange) {
        onDataChange('pemasukan', newPemasukanData);
      }
    } else if (findItemInPengeluaran) {
      const newPengeluaranData = pengeluaranData.filter(item => item.id !== id);
      if (onDataChange) {
        onDataChange('pengeluaran', newPengeluaranData);
      }
    }
  };

  const tableColumns = React.useMemo(() => 
    columns({
      onViewDetail: handleViewDetail,
      onEdit: handleEdit,
      onDelete: handleDelete
    }), 
    []
  );
  
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: false,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* TableToolbar untuk export dan filter */}
      {setSearchQuery && setYear && (
        <TableToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          year={tahun.toString()}
          setYear={setYear}
          availableYears={availableYears}
          pemasukanData={pemasukanData}
          pengeluaranData={pengeluaranData}
        />
      )}
      
      {/* Judul tabel */}
      <div className="text-center font-bold text-xl mb-4">
        REKAPITULASI BUKU KAS UMUM MASJID {namaMasjid.toUpperCase()} TAHUN {tahun}
      </div>
      
      {/* Tabel rekapitulasi */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    colSpan={header.colSpan}
                    className="text-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const rowData = row.original;
                return (
                  <TableRow 
                    key={row.id} 
                    className={`
                      ${rowData.tipe === "header" ? "bg-muted/30 dark:bg-muted/20 font-bold" : ""}
                      ${rowData.isTotal ? "bg-muted/20 dark:bg-muted/10 font-bold" : ""}
                      ${rowData.tipe === "saldo_akhir" ? "bg-blue-50/50 dark:bg-blue-900/20" : ""}
                    `}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada data rekap keuangan untuk tahun {tahun}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Komponen paginasi */}
      <TablePagination table={table} />
    </div>
  );
}

export default TableRekapTahunan;