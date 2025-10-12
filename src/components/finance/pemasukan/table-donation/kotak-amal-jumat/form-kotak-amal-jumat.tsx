// src/components/finance/pemasukan/table-donation/kotak-amal-jumat/form-kotak-amal-jumat.tsx
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

interface KotakAmalJumatFormValues {
  tanggal: Date;
  jumlah: number;
}

interface FormKotakAmalJumatProps {
  onSuccess: (data: KotakAmalJumatFormValues) => Promise<void>;
}

export function FormKotakAmalJumat({ onSuccess }: FormKotakAmalJumatProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [jumlahDisplay, setJumlahDisplay] = React.useState("");

  const form = useForm<KotakAmalJumatFormValues>({
    defaultValues: {
      tanggal: new Date(),
      jumlah: 0,
    },
  });

  const onSubmit = async (data: KotakAmalJumatFormValues) => {
    setIsSubmitting(true);
    try {
      await onSuccess(data);

      await Swal.fire({
        title: "Berhasil!",
        text: "Data kotak amal jumat berhasil disimpan",
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        iconColor: "#10B981",
      });

      form.reset();
      setJumlahDisplay("");
    } catch (error) {
      console.error("Error saat menyimpan data kotak amal jumat:", error);
      await Swal.fire({
        title: "Error!",
        text: "Gagal menyimpan data kotak amal jumat",
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="min-w-[440px]">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="tanggal"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-base">Tanggal</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-11 pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd MMMM yyyy", { locale: id })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                        <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
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
            render={() => (
              <FormItem>
                <FormLabel className="text-base">Jumlah (Rp)</FormLabel>
                <FormControl>
                  <InputField
                    type="text"
                    className="h-11"
                    placeholder="0"
                    value={jumlahDisplay}
                    onChange={handleJumlahChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="mt-8">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white" size="lg"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}