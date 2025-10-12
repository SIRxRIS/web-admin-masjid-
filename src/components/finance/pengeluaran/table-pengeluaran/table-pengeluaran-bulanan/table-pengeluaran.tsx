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
import { type PengeluaranData } from "@/lib/schema/pengeluaran/schema";
import { TablePagination } from "./table-pagination";
import { DraggableRow } from "../draggable-row";
import { formatCurrency } from "../utils";
import { DetailPengeluaran } from "./detail-pengeluaran";
import { EditPengeluaran } from "./edit-pengeluaran";

interface TablePengeluaranProps {
  pengeluaranData: PengeluaranData[];
  year: string;
  onDataChange?: (updatedData: PengeluaranData[]) => void;
}

export function TablePengeluaran({
  pengeluaranData,
  year,
  onDataChange,
}: TablePengeluaranProps) {
  const [data, setData] = React.useState<PengeluaranData[]>(pengeluaranData);
  const [selectedPengeluaran, setSelectedPengeluaran] = 
    React.useState<PengeluaranData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  React.useEffect(() => {
    setData(pengeluaranData);
  }, [pengeluaranData]);

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );
  const dataIds = React.useMemo(() => data?.map(({ id }) => id) || [], [data]);

  const totalPengeluaran = React.useMemo(() => 
    data.reduce((total, item) => total + item.jumlah, 0),
  [data]);

  const monthlyTotals = React.useMemo(() => {
    const totals = Array(12).fill(0);
    data.forEach(item => {
      const month = new Date(item.tanggal).getMonth();
      totals[month] += item.jumlah;
    });
    return totals;
  }, [data]);

  const updateData = (newData: PengeluaranData[]) => {
    setData(newData);
    if (onDataChange) {
      onDataChange(newData);
    }
  };
  
  const handleViewDetail = (data: PengeluaranData) => {
    setSelectedPengeluaran(data);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedPengeluaran(null);
  };

  const handleEdit = (data: PengeluaranData) => {
    setSelectedPengeluaran(data);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedPengeluaran(null);
  };

  const handleSaveEdit = (updatedData: PengeluaranData) => {
    const newData = data.map((item) => 
      item.id === updatedData.id ? updatedData : item
    );
    updateData(newData);
  };

  const handleDelete = (id: number) => {
    const filteredData = data
      .filter((item) => item.id !== id)
      .map((item, index) => ({
        ...item,
        no: index + 1,
      }));
    
    updateData(filteredData);
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const newData = (() => {
        const oldIndex = data.findIndex((item) => item.id === active.id);
        const newIndex = data.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(data, oldIndex, newIndex);
        
        return reordered.map((item, index) => ({
          ...item,
          no: index + 1,
        }));
      })();
      
      updateData(newData);
    }
  }

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
                    colSpan={columns({}).length}
                    className="h-24 text-center"
                  >
                    Tidak ada data pengeluaran.
                  </TableCell>
                </TableRow>
              )}

              {/* Summary row */}
              {table.getRowModel().rows?.length > 0 && (
                <TableRow className="bg-muted font-medium sticky bottom-0 border-t-2">
                  <TableCell colSpan={2} className="text-right font-bold px-4 py-3">
                    Total:
                  </TableCell>
                  <TableCell />
                  <TableCell className="text-center font-bold px-4 py-3">
                    {formatCurrency(totalPengeluaran)}
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <TablePagination table={table} />

      {/* Modals */}
      {selectedPengeluaran && (
        <>
          <DetailPengeluaran
            isOpen={isDetailOpen}
            onClose={handleCloseDetail}
            data={selectedPengeluaran}
            year={year}
          />

          <EditPengeluaran
            isOpen={isEditOpen}
            onClose={handleCloseEdit}
            data={selectedPengeluaran}
            onSave={handleSaveEdit}
            onDelete={handleDelete}
            year={year}
          />
        </>
      )}
    </div>
  );
}

export default TablePengeluaran;