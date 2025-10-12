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
import { type KotakAmalMasjidData } from "../schema";
import { columns } from "./columns";
import { EditKotakAmalMasjid } from "./edit-kotak-amal-masjid";
import { DetailKotakAmalMasjid } from "./detail-kotak-amal-masjid";
import { DeleteKotakAmalMasjidDialog } from "./delete-kotak-amal-masjid";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export type KotakAmalMasjidItem = KotakAmalMasjidData;

interface DataTableProps {
  data: KotakAmalMasjidItem[];
  year: string;
}

export function DataTable({ data, year }: DataTableProps) {
  const formattedData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      tanggal:
        item.tanggal instanceof Date ? item.tanggal : new Date(item.tanggal),
    }));
  }, [data]);

  const [items, setItems] = React.useState(formattedData);
  const [selectedKotakAmal, setSelectedKotakAmal] =
    React.useState<KotakAmalMasjidData | null>(null);
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

  const handleEdit = React.useCallback((kotakAmal: KotakAmalMasjidData) => {
    setSelectedKotakAmal(kotakAmal);
    setIsEditOpen(true);
  }, []);

  const handleViewDetail = React.useCallback(
    (kotakAmal: KotakAmalMasjidData) => {
      setSelectedKotakAmal(kotakAmal);
      setIsDetailOpen(true);
    },
    []
  );

  const handleDelete = React.useCallback(
    (id: number) => {
      const kotakAmal = items.find((item) => item.id === id);
      if (kotakAmal) {
        setSelectedKotakAmal(kotakAmal);
        setIsDeleteOpen(true);
      }
    },
    [items]
  );

  const handleSave = React.useCallback(
    async (updatedKotakAmal: KotakAmalMasjidData) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === updatedKotakAmal.id
            ? {
                ...updatedKotakAmal,
                tanggal:
                  updatedKotakAmal.tanggal instanceof Date
                    ? updatedKotakAmal.tanggal
                    : new Date(updatedKotakAmal.tanggal),
              }
            : item
        )
      );
    },
    []
  );

  const handleDeleteConfirm = React.useCallback(async (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
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

  const totalAmount = React.useMemo(() => {
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
                    colSpan={5}
                    className="h-[200px] text-center align-middle text-muted-foreground"
                  >
                    Tidak ada data kotak amal masjid.
                  </TableCell>
                </TableRow>
              )}

              {/* Summary row */}
              {table.getRowModel().rows?.length > 0 && (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center border-t bg-muted/50 font-medium"
                  >
                    Total:
                  </TableCell>
                  <TableCell className="text-center border-t bg-muted/50 font-medium">
                    {formatCurrency(totalAmount)}
                  </TableCell>
                  <TableCell colSpan={1} className="border-t bg-muted/50" />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <EditKotakAmalMasjid
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        kotakAmal={selectedKotakAmal}
        onSave={handleSave}
        onDelete={handleDelete}
        year={year}
      />

      <DetailKotakAmalMasjid
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        kotakAmal={selectedKotakAmal}
        year={year}
      />

      <DeleteKotakAmalMasjidDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        kotakAmalName={
          selectedKotakAmal
            ? format(new Date(selectedKotakAmal.tanggal), "dd MMMM yyyy", {
                locale: id,
              })
            : ""
        }
        kotakAmalId={selectedKotakAmal?.id ?? 0}
      />
    </>
  );
}
