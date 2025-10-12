// src/components/finance/pemasukan/table-donation/riwayat-tahunan/table-riwayat-tahunan
"use client";

import * as React from "react";
import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DndContext,
  type DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
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
import { columns } from "./columns";
import { type DonaturData, type KotakAmalData, type DonasiKhususData, type KotakAmalMasjidData, type KotakAmalJumatData } from "@/lib/schema/pemasukan/schema";
import { TablePagination } from "./table-pagination";
import { DraggableRow } from "../draggable-row";
import { formatCurrency } from "../../../pemasukan/table-donation/utils";
import { DetailDonatur } from "./detail-donatur";
import { EditDonatur } from "./edit-donatur";
import { DetailKotakAmal } from "../kotak-amal/detail-kotak-amal";
import { EditKotakAmal } from "../kotak-amal/edit-kotak-amal";
import { DetailDonasiKhusus } from "../donasi-khusus/detail-donasi-khusus";
import { EditDonasiKhusus } from "../donasi-khusus/edit-donasi-khusus";
import { integrateData, type IntegratedData } from "@/lib/services/supabase/data-integration";
import { useRiwayatTahunanHandlers } from "./riwayat-tahunan-handlers";

interface TableRiwayatTahunanProps {
  donaturData: DonaturData[];
  kotakAmalData: KotakAmalData[];
  donasiKhususData: DonasiKhususData[];
  kotakAmalMasjidData: KotakAmalMasjidData[];
  kotakAmalJumatData: KotakAmalJumatData[];
  year: string;
}

export function TableRiwayatTahunan({
  donaturData,
  kotakAmalData,
  donasiKhususData,
  kotakAmalMasjidData,
  kotakAmalJumatData,
  year,
}: TableRiwayatTahunanProps) {
  const [isKotakAmalDetailOpen, setIsKotakAmalDetailOpen] = React.useState(false);
  const [isKotakAmalEditOpen, setIsKotakAmalEditOpen] = React.useState(false);
  const [isDonasiKhususDetailOpen, setIsDonasiKhususDetailOpen] = React.useState(false);
  const [isDonasiKhususEditOpen, setIsDonasiKhususEditOpen] = React.useState(false);
  const [selectedKotakAmal, setSelectedKotakAmal] = React.useState<KotakAmalData | null>(null);
  const [selectedDonasiKhusus, setSelectedDonasiKhusus] = React.useState<DonasiKhususData | null>(null);

  const [data, setData] = React.useState<IntegratedData[]>(() => 
    integrateData(donaturData, kotakAmalData, donasiKhususData, kotakAmalMasjidData, kotakAmalJumatData, year)
  );

  React.useEffect(() => {
    setData(integrateData(donaturData, kotakAmalData, donasiKhususData, kotakAmalMasjidData, kotakAmalJumatData, year));
  }, [donaturData, kotakAmalData, donasiKhususData, kotakAmalMasjidData, kotakAmalJumatData, year]);

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo(() => data?.map(({ id }) => id) || [], [data]);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedDonatur, setSelectedDonatur] = React.useState<IntegratedData | null>(null);
  const {
    handleViewDetail,
    handleEdit,
    handleDelete,
    handleCloseDetail,
    handleCloseEdit,
    handleSaveEdit,
    handleSaveKotakAmal,
    handleSaveDonasiKhusus,
    handleCloseDonasiKhususDetail,
    handleCloseDonasiKhususEdit
  } = useRiwayatTahunanHandlers({
    data,
    setData,
    kotakAmalData,
    donasiKhususData,
    setSelectedDonatur,
    setIsDetailOpen,
    setIsEditOpen,
    setSelectedKotakAmal,
    setIsKotakAmalDetailOpen,
    setIsKotakAmalEditOpen,
    setSelectedDonasiKhusus,
    setIsDonasiKhususDetailOpen,
    setIsDonasiKhususEditOpen
  });
  
  const table = useReactTable({
    data,
    columns: columns({
      onViewDetail: handleViewDetail,
      onEdit: handleEdit,
      onDelete: handleDelete,
    }),
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(), 
    enableRowSelection: true,
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = data.findIndex((item) => item.id.toString() === active.id.toString());
        const newIndex = data.findIndex((item) => item.id.toString() === over.id.toString());

        const reorderedData = arrayMove(data, oldIndex, newIndex);

        return reorderedData.map((item, index) => ({
          ...item,
          no: index + 1,
        }));
      });
    }
  }

  const monthlyTotals = React.useMemo(() => {
    return {
      jan: data.reduce((sum, item) => sum + item.jan, 0),
      feb: data.reduce((sum, item) => sum + item.feb, 0),
      mar: data.reduce((sum, item) => sum + item.mar, 0),
      apr: data.reduce((sum, item) => sum + item.apr, 0),
      mei: data.reduce((sum, item) => sum + item.mei, 0),
      jun: data.reduce((sum, item) => sum + item.jun, 0),
      jul: data.reduce((sum, item) => sum + item.jul, 0),
      aug: data.reduce((sum, item) => sum + item.aug, 0),
      sep: data.reduce((sum, item) => sum + item.sep, 0),
      okt: data.reduce((sum, item) => sum + item.okt, 0),
      nov: data.reduce((sum, item) => sum + item.nov, 0),
      des: data.reduce((sum, item) => sum + item.des, 0),
      infaq: data.reduce((sum, item) => sum + item.infaq, 0),
    };
  }, [data]);

  const totalDonations = React.useMemo(() => {
    return Object.values(monthlyTotals).reduce((sum, value) => sum + value, 0);
  }, [monthlyTotals]);

  return (
    <div className="w-full flex-col space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id={sortableId}
        >
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
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
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row} />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={17}
                    className="h-[200px] text-center align-middle text-muted-foreground"
                  >
                    Tidak ada data donatur.
                  </TableCell>
                </TableRow>
              )}

              {/* Summary row */}
              {table.getRowModel().rows?.length > 0 && (
                <TableRow className="bg-muted font-medium sticky bottom-0 border-t-2 ">
                  {/* Kolom No, Nama dan Alamat */}
                  <TableCell className="text-right font-bold px-4 py-3">
                    Total:
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  
                  {/* Bulan Januari sampai Desember */}
                  <TableCell className="text-center font-bold px-4 py-3">
                    {formatCurrency(monthlyTotals.jan)}
                  </TableCell>
                  <TableCell className="text-center font-bold px-4 py-3">
                    {formatCurrency(monthlyTotals.feb)}
                  </TableCell>
                  <TableCell className="text-center font-bold px-4 py-3">
                    {formatCurrency(monthlyTotals.mar)}
                  </TableCell>
                  <TableCell className="text-center font-bold px-4 py-3">
                    {formatCurrency(monthlyTotals.apr)}
                  </TableCell>
                  <TableCell className="text-center font-bold px-4 py-3">
                    {formatCurrency(monthlyTotals.mei)}
                  </TableCell>
                  <TableCell className="text-center font-bold px-4 py-3">
                    {formatCurrency(monthlyTotals.jun)}
                  </TableCell>
                  <TableCell className="text-center font-bold px-4 py-3">
                    {formatCurrency(monthlyTotals.jul)}
                  </TableCell>
                  <TableCell className="text-center font-bold px-4 py-3">
                    {formatCurrency(monthlyTotals.aug)}
                  </TableCell>
                  <TableCell className="text-center font-bold px-4 py-3">
                    {formatCurrency(monthlyTotals.sep)}
                  </TableCell>
                  <TableCell className="text-center font-bold px-4 py-3">
                    {formatCurrency(monthlyTotals.okt)}
                  </TableCell>
                  <TableCell className="text-center font-bold px-4 py-3">
                    {formatCurrency(monthlyTotals.nov)}
                  </TableCell>
                  <TableCell className="text-center font-bold px-4 py-3">
                    {formatCurrency(monthlyTotals.des)}
                  </TableCell>
                  
                  {/* Infaq dan Total */}
                  <TableCell className="text-center font-bold px-4 py-3">
                    {formatCurrency(monthlyTotals.infaq)}
                  </TableCell>
                  <TableCell className="text-center font-bold px-4 py-3">
                    {formatCurrency(totalDonations)}
                  </TableCell>
                  
                  {/* Kolom Aksi */}
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <TablePagination table={table} />

      {/* Dialog Components */}
      <DetailDonatur
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        data={selectedDonatur}
        year={year}  
      />
      <EditDonatur
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        data={selectedDonatur}
        onSave={handleSaveEdit}
        onDelete={handleDelete}  
        year={year}  
      />

      {/* Dialog untuk Kotak Amal */}
      <DetailKotakAmal
        isOpen={isKotakAmalDetailOpen}
        onClose={() => setIsKotakAmalDetailOpen(false)}
        kotakAmal={selectedKotakAmal}
        year={year}
      />
      <EditKotakAmal
        isOpen={isKotakAmalEditOpen}
        onClose={() => setIsKotakAmalEditOpen(false)}
        kotakAmal={selectedKotakAmal}
        onSave={handleSaveKotakAmal}
        onDelete={(id) => {
          if (selectedKotakAmal) {
            const integratedItem = data.find(item => 
              item.sourceType === 'kotakAmal' && 
              (typeof item.sourceId === 'string' 
                ? parseInt(item.sourceId, 10) === selectedKotakAmal.id 
                : item.sourceId === selectedKotakAmal.id)
            );
            if (integratedItem) {
              handleDelete(integratedItem.id);
            }
          }
          setIsKotakAmalEditOpen(false);
          setSelectedKotakAmal(null);
        }}
      />

      {/* Dialog untuk Donasi Khusus */}
      <DetailDonasiKhusus
        isOpen={isDonasiKhususDetailOpen}
        onClose={handleCloseDonasiKhususDetail}
        donasi={selectedDonasiKhusus}
        year={year}
      />
      <EditDonasiKhusus
        isOpen={isDonasiKhususEditOpen}
        onClose={handleCloseDonasiKhususEdit}
        donasi={selectedDonasiKhusus}
        onSave={handleSaveDonasiKhusus}
        onDelete={(id) => {
          if (selectedDonasiKhusus) {
            const integratedItem = data.find(item => 
              item.sourceType === 'donasiKhusus' && 
              (typeof item.sourceId === 'string' 
                ? parseInt(item.sourceId, 10) === selectedDonasiKhusus.id 
                : item.sourceId === selectedDonasiKhusus.id)
            );
            if (integratedItem) {
              handleDelete(integratedItem.id);
            }
          }
          setIsDonasiKhususEditOpen(false);
          setSelectedDonasiKhusus(null);
        }}
        year={year}
      />
    </div>
  );
}

export default TableRiwayatTahunan;