import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import InputField from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { id } from "date-fns/locale";
import Swal from "sweetalert2";
import { formatAngkaInput, parseFormattedNumber } from "@/lib/utils";

interface DonasiKhususFormValues {
  nama: string;
  tanggal: Date;
  jumlah: number;
  keterangan: string;
}

interface FormDonasiKhususProps {
  onSuccess: () => void;
}

export function FormDonasiKhusus({ onSuccess }: FormDonasiKhususProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [jumlahDisplay, setJumlahDisplay] = React.useState("");

  const form = useForm<DonasiKhususFormValues>({
    defaultValues: {
      nama: "",
      tanggal: new Date(),
      jumlah: 0,
      keterangan: "",
    },
  });

  const onSubmit = async (data: DonasiKhususFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/donasi-khusus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: data.nama,
          tanggal: format(data.tanggal, "yyyy-MM-dd"),
          jumlah: data.jumlah,
          keterangan: data.keterangan,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save donasi khusus");
      }

      await Swal.fire({
        title: "Berhasil!",
        text: "Data donasi khusus berhasil disimpan",
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        iconColor: "#10B981",
      });

      form.reset();
      setJumlahDisplay("");
      onSuccess();
    } catch (error) {
      console.error("Error saat menyimpan data donasi khusus:", error);
      await Swal.fire({
        title: "Error!",
        text: "Gagal menyimpan data donasi khusus",
        icon: "error",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJumlahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAngkaInput(e.target.value);
    setJumlahDisplay(formatted);
    const numericValue = Number(parseFormattedNumber(formatted));
    form.setValue("jumlah", numericValue);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="nama"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Donatur</FormLabel>
                <FormControl>
                  <InputField 
                    placeholder="Masukkan nama donatur" 
                    className="w-full"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tanggal"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Donasi</FormLabel>
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
                          format(field.value, "dd MMMM yyyy", { locale: id })
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
            name="jumlah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah (Rp)</FormLabel>
                <FormControl>
                  <InputField
                    type="text"
                    placeholder="0"
                    className="w-full"
                    value={jumlahDisplay}
                    onChange={handleJumlahChange}
                  />
                </FormControl>
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
                  <TextArea
                    placeholder="Masukkan keterangan donasi"
                    rows={4}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="mt-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
