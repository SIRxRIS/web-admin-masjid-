// src/components/manajemen/daftar-pengurus/edit.tsx
"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PengurusData } from "@/lib/schema/pengurus/schema"; 
import { updatePengurusAction } from "@/actions/pengurus"; 
import { jabatanToNoMap } from "../tambah-pengurus/pengurus-schema";

const EditSchema = z.object({
  id: z.number(),
  nama: z.string().min(1, "Nama wajib diisi"),
  jabatan: z.string().min(1, "Jabatan wajib diisi"),
  periode: z.string().min(1, "Periode wajib diisi"),
  no: z.number(),
});

type EditFormData = z.infer<typeof EditSchema>;

interface EditPengurusProps {
  isOpen: boolean;
  onClose: () => void;
  data: PengurusData | null;
  onSave: (data: PengurusData) => void;
}

export function EditPengurus({ isOpen, onClose, data, onSave }: EditPengurusProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<EditFormData>({
    resolver: zodResolver(EditSchema),
    defaultValues: {
      id: data?.id || 0,
      nama: data?.nama || "",
      jabatan: data?.jabatan || "",
      periode: data?.periode || "",
      no: data?.no || 0,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        id: data.id,
        nama: data.nama,
        jabatan: data.jabatan,
        periode: data.periode,
        no: data.no,
      });
    }
  }, [data, form]);

  const onSubmit = async (formData: EditFormData) => {
    if (!data) return;
    
    setIsSubmitting(true);
    try {
      // Create FormData for server action
      const form = new FormData();
      form.append("id", formData.id.toString());
      form.append("nama", formData.nama);
      form.append("jabatan", formData.jabatan);
      form.append("periode", formData.periode);
      form.append("no", formData.no.toString());
      
      if (selectedFile) {
        form.append("foto", selectedFile);
      }

      const result = await updatePengurusAction(form);
      
      if (result.success) {
        onSave(result.data);
        toast.success("Berhasil", { description: "Data pengurus berhasil diperbarui" });
        onClose();
      } else {
        toast.error("Error", { description: result.error });
      }
    } catch (error) {
      console.error("Error updating pengurus:", error);
      toast.error("Error", { description: "Gagal memperbarui data pengurus" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Data Pengurus</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Nama Lengkap <Badge variant="destructive">Wajib</Badge>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama lengkap" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jabatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Jabatan <Badge variant="destructive">Wajib</Badge>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("no", jabatanToNoMap[value] || 0);
                        }}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jabatan" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(jabatanToNoMap).map(([jabatan, no]) => (
                            <SelectItem key={no} value={jabatan}>
                              {jabatan}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="periode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Periode <Badge variant="destructive">Wajib</Badge>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: 2023-2027" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Nomor Urut <Badge variant="secondary">Auto</Badge>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        readOnly 
                        {...field} 
                        value={field.value || 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* File input for photo */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Foto (Opsional)
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}