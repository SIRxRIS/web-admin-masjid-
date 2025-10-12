// src/components/content/form/content-form/form-tabs/general-tab.tsx
"use client";

import { UseFormReturn } from "react-hook-form";
import { safeFormatDate } from "@/components/content/date-helper";
import { CalendarIcon, Clock, MapPin } from "lucide-react";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { TabsContent } from "@/components/ui/tabs";

import { ContentFormValues, kategoriKontenContoh } from "@/lib/schema/konten/schema";

interface GeneralTabProps {
  form: UseFormReturn<ContentFormValues>;
  isSubmitting: boolean;
}

export function GeneralTab({ form, isSubmitting }: GeneralTabProps) {
  return (
    <TabsContent value="umum" className="space-y-6">
      <FormField
        control={form.control}
        name="judul"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Judul Konten</FormLabel>
            <FormControl>
              <Input
                placeholder="Masukkan judul konten"
                {...field}
                className="border-gray-300 dark:border-gray-700"
              />
            </FormControl>
            <FormDescription>
              Judul akan ditampilkan sebagai header konten
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="kategoriId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori Konten</FormLabel>
              <Select
                onValueChange={(val) => field.onChange(Number(val))}
                defaultValue={field.value ? String(field.value) : undefined}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="border-gray-300 dark:border-gray-700">
                    <SelectValue placeholder="Pilih kategori konten" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {kategoriKontenContoh.map((kategori) => (
                    <SelectItem
                      key={kategori.id}
                      value={String(kategori.id)}
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
          name="tanggal"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal Konten</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className="pl-3 text-left font-normal border-gray-300 dark:border-gray-700"
                      disabled={isSubmitting}
                    >
                      {field.value ? (
                        safeFormatDate(field.value)
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Field Waktu Kegiatan (Opsional) */}
        <FormField
          control={form.control}
          name="waktu"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Waktu Kegiatan
                <span className="ml-2 text-xs text-muted-foreground font-normal">(Opsional)</span>
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

        {/* Field Lokasi (Opsional) - Baru */}
        <FormField
          control={form.control}
          name="lokasi"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Lokasi
                <span className="ml-2 text-xs text-muted-foreground font-normal">(Opsional)</span>
              </FormLabel>
              <div className="flex items-center">
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      placeholder="Lokasi kegiatan"
                      {...field}
                      value={field.value || ""}
                      disabled={isSubmitting}
                      className="border-gray-300 dark:border-gray-700 pl-10"
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
              </div>
              <FormDescription>
                Masukkan lokasi kegiatan jika relevan
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="deskripsi"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Deskripsi Konten</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Masukkan deskripsi konten lengkap"
                {...field}
                disabled={isSubmitting}
                className="min-h-32 border-gray-300 dark:border-gray-700"
              />
            </FormControl>
            <FormDescription>
              Informasi lengkap tentang konten atau kegiatan
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Field Penulis - Baru */}
      <FormField
        control={form.control}
        name="penulis"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nama Penulis/Pengunggah</FormLabel>
            <FormControl>
              <Input
                placeholder="Masukkan nama penulis atau pengunggah konten"
                {...field}
                value={field.value ?? ""}
                disabled={isSubmitting}
                className="border-gray-300 dark:border-gray-700"
              />
            </FormControl>
            <FormDescription>
              Nama penanggung jawab atau pengunggah konten
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="tampilkanDiBeranda"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Tampilkan di Beranda</FormLabel>
                  <FormDescription>
                    Konten akan ditampilkan di halaman utama website masjid
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="penting"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Tandai Sebagai Penting</FormLabel>
                  <FormDescription>
                    Konten akan ditampilkan dengan penanda khusus
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>
    </TabsContent>
  );
}