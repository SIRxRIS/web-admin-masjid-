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
import { formatCurrency } from "../utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DraggableRow } from "../draggable-row";
import { type KotakAmalData } from "../schema";
import { columns } from "./columns";
import { EditKotakAmal } from "./edit-kotak-amal";
import { DetailKotakAmal } from "./detail-kotak-amal";
import { DeleteKotakAmalDialog } from "./delete-kotak-amal";

interface DataTableProps {
  data: KotakAmalData[];
  year: string;
}

export function DataTable({ data, year }: DataTableProps) {
  const [items, setItems] = React.useState(data);
  const [selectedKotakAmal, setSelectedKotakAmal] = React.useState<KotakAmalData | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const handleEdit = React.useCallback((kotakAmal: KotakAmalData) => {
    setSelectedKotakAmal(kotakAmal);
    setIsEditOpen(true);
  }, []);

  const handleViewDetail = React.useCallback((kotakAmal: KotakAmalData) => {
    setSelectedKotakAmal(kotakAmal);
    setIsDetailOpen(true);
  }, []);

  const handleDelete = React.useCallback((id: number) => {
    const kotakAmal = items.find(item => item.id === id);
    if (kotakAmal) {
      setSelectedKotakAmal(kotakAmal);
      setIsDeleteOpen(true);
    }
  }, [items]);

  const handleSave = React.useCallback((updatedKotakAmal: KotakAmalData) => {
    setItems(prev => 
      prev.map(item => 
        item.id === updatedKotakAmal.id ? updatedKotakAmal : item
      )
    );
    setIsEditOpen(false);
  }, []);

  const handleDeleteConfirm = React.useCallback(async (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setIsDeleteOpen(false);
    return true;
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

  const monthlyTotals = React.useMemo(() => {
    return items.reduce(
      (totals, item) => ({
        jan: totals.jan + item.jan,
        feb: totals.feb + item.feb,
        mar: totals.mar + item.mar,
        apr: totals.apr + item.apr,
        mei: totals.mei + item.mei,
        jun: totals.jun + item.jun,
        jul: totals.jul + item.jul,
        aug: totals.aug + item.aug,
        sep: totals.sep + item.sep,
        okt: totals.okt + item.okt,
        nov: totals.nov + item.nov,
        des: totals.des + item.des,
      }),
      {
        jan: 0,
        feb: 0,
        mar: 0,
        apr: 0,
        mei: 0,
        jun: 0,
        jul: 0,
        aug: 0,
        sep: 0,
        okt: 0,
        nov: 0,
        des: 0,
      }
    );
  }, [items]);

  const totalDonations = React.useMemo(() => {
    return Object.values(monthlyTotals).reduce((sum, value) => sum + value, 0);
  }, [monthlyTotals]);

  return (
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
            {table.getRowModel().rows?.length > 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center border-t bg-muted/50 font-medium"
                >
                  Total:
                </TableCell>
                <TableCell className="text-center border-t bg-muted/50 font-medium">
                  {formatCurrency(monthlyTotals.jan)}
                </TableCell>
                <TableCell className="text-center border-t bg-muted/50 font-medium">
                  {formatCurrency(monthlyTotals.feb)}
                </TableCell>
                <TableCell className="text-center border-t bg-muted/50 font-medium">
                  {formatCurrency(monthlyTotals.mar)}
                </TableCell>
                <TableCell className="text-center border-t bg-muted/50 font-medium">
                  {formatCurrency(monthlyTotals.apr)}
                </TableCell>
                <TableCell className="text-center border-t bg-muted/50 font-medium">
                  {formatCurrency(monthlyTotals.mei)}
                </TableCell>
                <TableCell className="text-center border-t bg-muted/50 font-medium">
                  {formatCurrency(monthlyTotals.jun)}
                </TableCell>
                <TableCell className="text-center border-t bg-muted/50 font-medium">
                  {formatCurrency(monthlyTotals.jul)}
                </TableCell>
                <TableCell className="text-center border-t bg-muted/50 font-medium">
                  {formatCurrency(monthlyTotals.aug)}
                </TableCell>
                <TableCell className="text-center border-t bg-muted/50 font-medium">
                  {formatCurrency(monthlyTotals.sep)}
                </TableCell>
                <TableCell className="text-center border-t bg-muted/50 font-medium">
                  {formatCurrency(monthlyTotals.okt)}
                </TableCell>
                <TableCell className="text-center border-t bg-muted/50 font-medium">
                  {formatCurrency(monthlyTotals.nov)}
                </TableCell>
                <TableCell className="text-center border-t bg-muted/50 font-medium">
                  {formatCurrency(monthlyTotals.des)}
                </TableCell>
                <TableCell className="text-center border-t bg-muted/50 font-medium">
                  {formatCurrency(totalDonations)}
                </TableCell>
                <TableCell className="border-t bg-muted/50"></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DndContext>

      <EditKotakAmal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        kotakAmal={selectedKotakAmal}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <DetailKotakAmal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        kotakAmal={selectedKotakAmal}
        year={year}  
      />

      <DeleteKotakAmalDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        kotakAmalName={selectedKotakAmal?.nama || ""}
        kotakAmalId={selectedKotakAmal?.id || 0}
      />
    </div>
  );
}
