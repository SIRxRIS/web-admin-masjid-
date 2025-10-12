"use client";

import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { formatCurrency } from "../../../pemasukan/table-donation/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DraggableRow } from "../draggable-row";
import { type DonasiKhususData } from "@/lib/schema/pemasukan/schema";
import { columns } from "./columns";
import { EditDonasiKhusus } from "./edit-donasi-khusus";
import { DetailDonasiKhusus } from "./detail-donasi-khusus";
import { DeleteDonasiKhususDialog } from "./delete-donasi-khusus";

export type DonationData = DonasiKhususData;

interface DataTableProps {
  data: DonationData[];
  year: string;
}

export function DataTable({ data, year }: DataTableProps) {
  const formattedData = React.useMemo(() => {
    return data.map(item => ({
      ...item,
      tanggal: item.tanggal instanceof Date ? 
        item.tanggal : 
        new Date(item.tanggal)
    }));
  }, [data]);

  const [items, setItems] = React.useState(formattedData);
  const [selectedDonasi, setSelectedDonasi] = React.useState<DonasiKhususData | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    setItems(formattedData);
  }, [formattedData]);

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const handleEdit = React.useCallback((donasi: DonasiKhususData) => {
    setSelectedDonasi(donasi);
    setIsEditOpen(true);
  }, []);

  const handleViewDetail = React.useCallback((donasi: DonasiKhususData) => {
    setSelectedDonasi(donasi);
    setIsDetailOpen(true);
  }, []);

  const handleDelete = React.useCallback((id: number) => {
    const donasi = items.find(item => item.id === id);
    if (donasi) {
      setSelectedDonasi(donasi);
      setIsDeleteOpen(true);
    }
  }, [items]);

  const handleSave = React.useCallback((updatedDonasi: DonasiKhususData) => {
    setItems(prev => prev.map(item => 
      item.id === updatedDonasi.id 
        ? {
            ...updatedDonasi,
            tanggal: updatedDonasi.tanggal instanceof Date ? 
              updatedDonasi.tanggal : 
              new Date(updatedDonasi.tanggal)
          } 
        : item
    ));
  }, []);

  const handleDeleteConfirm = React.useCallback(async (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const table = useReactTable({
    data: items,
    columns: columns({
      onEdit: handleEdit,
      onViewDetail: handleViewDetail,
      onDelete: handleDelete,
    }),
    getCoreRowModel: getCoreRowModel(),
  });

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => items.map(({ id }) => id),
    [items]
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = dataIds.indexOf(active.id);
      const newIndex = dataIds.indexOf(over.id);
      const newItems = [...items];
      const [movedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, movedItem);
      setItems(newItems);
    }
  }

  const totalDonations = React.useMemo(() => {
    return items.reduce((sum, item) => sum + item.jumlah, 0);
  }, [items]);

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center border-t bg-muted/50 font-medium"
                  >
                    Total:
                  </TableCell>
                  <TableCell className="text-center border-t bg-muted/50 font-medium">
                    {formatCurrency(totalDonations)}
                  </TableCell>
                  <TableCell
                    colSpan={2}
                    className="border-t bg-muted/50"
                  ></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <EditDonasiKhusus
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        donasi={selectedDonasi}
        onSave={handleSave}
        onDelete={handleDeleteConfirm}
        year={year}
      />

      <DetailDonasiKhusus
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        donasi={selectedDonasi}
        year={year}
      />

      <DeleteDonasiKhususDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        donasiName={selectedDonasi?.nama ?? ""}
        donasiId={selectedDonasi?.id ?? 0}
      />
    </>
  );
}