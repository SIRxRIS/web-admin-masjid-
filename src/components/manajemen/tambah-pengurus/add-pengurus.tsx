// src/components/manajemen/tambah-pengurus/add-pengurus.tsx
"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { FormPengurus } from "./form-pengurus";

interface AddPengurusProps {
  onSuccess?: () => void;
  children?: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export default function AddPengurus({ 
  onSuccess, 
  children,
}: AddPengurusProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white" size="lg"
          >
            <PlusIcon className="size-4 mr-1" />
            <span className="font-bold">Tambah</span>
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Tambah Pengurus Baru
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Lengkapi data pengurus dan upload foto untuk menambahkan pengurus baru.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <FormPengurus onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}