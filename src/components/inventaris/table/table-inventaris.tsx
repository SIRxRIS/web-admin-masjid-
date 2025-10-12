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
import { type InventarisData } from "@/lib/schema/inventaris/schema";
import { TablePagination } from "./table-pagination";
import { DraggableRow } from "../draggable-row";
import { DetailInventaris } from "../form/detail-inventaris";
import { EditInventaris } from "../form/edit-inventaris";

interface TableInventarisProps {
  inventarisData: InventarisData[];
  onDataChange?: (data: InventarisData[]) => void;
  onUpdateInventaris?: (
    id: number,
    data: any,
    file?: File
  ) => Promise<InventarisData>;
  onDeleteInventaris?: (id: number) => Promise<boolean>;
}

export function TableInventaris({
  inventarisData,
  onDataChange,
  onUpdateInventaris,
  onDeleteInventaris,
}: TableInventarisProps) {
  const [data, setData] = React.useState<InventarisData[]>([]);

  React.useEffect(() => {
    if (inventarisData && Array.isArray(inventarisData)) {
      setData(inventarisData);
    }
  }, [inventarisData]);

  const handleSaveEdit = async (id: number, updateData: any, file?: File): Promise<InventarisData> => {
    try {
      // Jika ada callback onUpdateInventaris dari parent, gunakan itu
      if (onUpdateInventaris) {
        const updatedItem = await onUpdateInventaris(id, updateData, file);
        
        // Update local state
        const newData = data.map((item) => {
          if (item.id === id) {
            return updatedItem;
          }
          return item;
        });
        
        setData(newData);
        if (onDataChange) {
          onDataChange(newData);
        }
        
        setIsEditOpen(false);
        setSelectedInventaris(null);
        
        return updatedItem;
      } else {
        // Fallback: update local state saja
        const updatedItem: InventarisData = {
          ...data.find(item => item.id === id)!,
          ...updateData,
          id,
        };
        
        const newData = data.map((item) => {
          if (item.id === id) {
            return updatedItem;
          }
          return item;
        });
        
        setData(newData);
        if (onDataChange) {
          onDataChange(newData);
        }
        
        setIsEditOpen(false);
        setSelectedInventaris(null);
        
        return updatedItem;
      }
    } catch (error) {
      console.error("Error updating inventaris:", error);
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // Jika ada callback onDeleteInventaris dari parent, gunakan itu
      if (onDeleteInventaris) {
        const success = await onDeleteInventaris(id);
        if (success) {
          const filteredData = data.filter((item) => item.id !== id);
          const updatedData = filteredData.map((item, index) => ({
            ...item,
            no: index + 1,
          }));
          setData(updatedData);
          if (onDataChange) {
            onDataChange(updatedData);
          }
        }
      } else {
        // Fallback: hapus dari local state saja
        const itemExists = data.some(item => item.id === id);
        if (!itemExists) {
          console.error(`Item dengan ID ${id} tidak ditemukan.`);
          return;
        }
        
        const filteredData = data.filter((item) => item.id !== id);
        const updatedData = filteredData.map((item, index) => ({
          ...item,
          no: index + 1,
        }));
        setData(updatedData);
        if (onDataChange) {
          onDataChange(updatedData);
        }
      }
    } catch (error) {
      console.error("Error deleting inventaris:", error);
    }
  };

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

  const dataIds = React.useMemo(() => 
    data?.map((item) => item.id.toString()) || [], 
    [data]
  );

  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [selectedInventaris, setSelectedInventaris] = 
    React.useState<InventarisData | null>(null);

  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const handleViewDetail = (data: InventarisData) => {
    setSelectedInventaris(data);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedInventaris(null);
  };

  const handleEdit = (data: InventarisData) => {
    setSelectedInventaris(data);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedInventaris(null);
  };
  
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
        const oldIndex = data.findIndex((item) => item.id.toString() === active.id);
        const newIndex = data.findIndex((item) => item.id.toString() === over.id);
        
        if (oldIndex === -1 || newIndex === -1) {
          console.error("Tidak dapat menemukan item yang di-drag");
          return data;
        }

        const reorderedData = arrayMove(data, oldIndex, newIndex);

        return reorderedData.map((item, index) => ({
          ...item,
          no: index + 1,
        }));
      });
    }
  }

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
                    Tidak ada data inventaris.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <TablePagination table={table} />

      <DetailInventaris
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        data={selectedInventaris}
      />
      
      <EditInventaris
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        data={selectedInventaris}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

export default TableInventaris;