// src/components/admin/layout/inventaris/form/form-inventaris.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { id } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  KategoriInventaris,
  KondisiInventaris,
  SatuanInventaris,
  InventarisData,
} from "@/lib/schema/inventaris/schema";

const formSchema = z.object({
  namaBarang: z.string().min(1, "Nama barang harus diisi"),
  kategori: KategoriInventaris,
  jumlah: z.number().min(1, "Jumlah minimal 1"),
  satuan: SatuanInventaris,
  lokasi: z.string().min(1, "Lokasi harus diisi"),
  kondisi: KondisiInventaris,
  tanggalMasuk: z.date(),
  keterangan: z.string().optional(),
});

type InventarisFormValues = z.infer<typeof formSchema>;

// 6. Perbaikan FormInventaris props
interface FormInventarisProps {
  onSuccess: (newData?: InventarisData) => void;
  onDataChange?: (data: InventarisData) => void;
  onCreate?: (data: any, file?: File) => Promise<InventarisData>;
}

export function FormInventaris({
  onSuccess,
  onDataChange,
  onCreate,
}: FormInventarisProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | undefined>(
    undefined
  );

  const form = useForm<InventarisFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      namaBarang: "",
      kategori: "PERLENGKAPAN",
      jumlah: 1,
      satuan: "UNIT",
      lokasi: "",
      kondisi: "BAIK",
      tanggalMasuk: new Date(),
      keterangan: "",
    },
  });

  const onSubmit = async (data: InventarisFormValues) => {
    setIsSubmitting(true);
    try {
      const inventarisData = {
        no: 0,
        namaBarang: data.namaBarang,
        kategori: data.kategori,
        jumlah: data.jumlah,
        satuan: data.satuan,
        lokasi: data.lokasi,
        kondisi: data.kondisi,
        tanggalMasuk: data.tanggalMasuk,
        keterangan: data.keterangan || undefined,
      };

      if (onCreate) {
        // Menggunakan callback onCreate yang diterima dari parent
        const newInventaris = await onCreate(inventarisData, selectedFile);

        await Swal.fire({
          title: "Berhasil!",
          text: "Data inventaris berhasil disimpan",
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          iconColor: "#10B981",
        });

        form.reset();
        setSelectedFile(undefined);
        onSuccess(newInventaris);

        if (onDataChange) {
          onDataChange(newInventaris);
        }
      } else {
        throw new Error("onCreate function not provided");
      }
    } catch (error) {
      console.error("Error saat menyimpan data inventaris:", error);
      await Swal.fire({
        title: "Error!",
        text: "Gagal menyimpan data inventaris",
        icon: "error",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTanggal = (date: Date) => {
    try {
      return format(date, "dd MMMM yyyy", { locale: id });
    } catch (error) {
      return "Pilih tanggal";
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="namaBarang"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Barang</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama barang" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="kategori"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <FormControl>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  {...field}
                >
                  <option value="PERLENGKAPAN">Perlengkapan</option>
                  <option value="ELEKTRONIK">Elektronik</option>
                  <option value="KEBERSIHAN">Kebersihan</option>
                  <option value="DOKUMEN">Dokumen</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="jumlah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    min={1}
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || 1)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="satuan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Satuan</FormLabel>
                <FormControl>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    {...field}
                  >
                    <option value="UNIT">Unit</option>
                    <option value="BUAH">Buah</option>
                    <option value="LEMBAR">Lembar</option>
                    <option value="SET">Set</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="lokasi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lokasi</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan lokasi barang" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="kondisi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kondisi</FormLabel>
              <FormControl>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  {...field}
                >
                  <option value="BAIK">Baik</option>
                  <option value="CUKUP">Cukup</option>
                  <option value="RUSAK">Rusak</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tanggalMasuk"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal Masuk</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        formatTanggal(field.value)
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
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
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
          name="keterangan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keterangan</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Masukkan keterangan tambahan (opsional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Foto Barang</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <DialogFooter className="mt-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
