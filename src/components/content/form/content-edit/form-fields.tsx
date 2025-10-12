// src/components/content/form/content-edit/form-fields.tsx
"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Clock, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  ContentFormValues,
  StatusKonten,
  kategoriKontenContoh,
} from "@/lib/schema/konten/schema";
import { UseFormReturn } from "react-hook-form";
import { ImageUpload } from "./image-upload";

interface FormFieldsProps {
  form: UseFormReturn<ContentFormValues>;
  isSubmitting: boolean;
  tags?: { id: number; nama: string }[];
  previewImage: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage?: () => void;
}

export function FormFields({
  form,
  isSubmitting,
  tags = [],
  previewImage,
  onImageChange,
  onDeleteImage,
}: FormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="judul"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Judul Konten <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Masukkan judul konten" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="kategoriId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Kategori <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString() || ""}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {kategoriKontenContoh.map((kategori) => (
                      <SelectItem
                        key={kategori.id}
                        value={kategori.id.toString()}
                      >
                        {kategori.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Status <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value as StatusKonten)
                  }
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="REVIEWED">Review</SelectItem>
                    <SelectItem value="PUBLISHED">Publikasi</SelectItem>
                    <SelectItem value="ARCHIVED">Arsip</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tanggal"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                Tanggal <span className="text-red-500">*</span>
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-gray-400"
                      )}
                      disabled={isSubmitting}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "dd MMMM yyyy", { locale: id })
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    locale={id}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="waktu"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Waktu Kegiatan
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  (Opsional)
                </span>
              </FormLabel>
              <div className="flex items-center">
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      type="time"
                      placeholder="08:00"
                      {...field}
                      value={field.value || ""}
                      disabled={isSubmitting}
                      className="border-gray-300 dark:border-gray-700 pl-10"
                    />
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <span className="ml-3 text-muted-foreground">WITA</span>
              </div>
              <FormDescription>
                Tentukan waktu mulai kegiatan dalam format 24 jam (jika ada)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lokasi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lokasi</FormLabel>
              <FormControl>
                <Input
                  placeholder="Masukkan lokasi kegiatan"
                  {...field}
                  value={field.value || ""}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Opsional. Contoh: "Ruang Utama Masjid" atau "Halaman Masjid"
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="penulis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Penulis <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Masukkan nama penulis"
                  {...field}
                  value={field.value || ""}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="penting"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Konten Penting</FormLabel>
                  <FormDescription>
                    Tandai sebagai konten penting untuk mendapatkan perhatian
                    lebih
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tampilkanDiBeranda"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Tampilkan di Beranda
                  </FormLabel>
                  <FormDescription>
                    Tampilkan konten ini di halaman beranda website
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="space-y-6">
        <FormField
          control={form.control}
          name="deskripsi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Deskripsi <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tuliskan deskripsi detail tentang konten ini"
                  className="min-h-[200px]"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ImageUpload
          previewImage={previewImage}
          onImageChange={onImageChange}
          onDeleteImage={onDeleteImage}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}