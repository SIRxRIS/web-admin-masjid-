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
import InputField from "@/components/form/input/InputField";
import { DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { createPengeluaranSimpleAction } from "@/actions/pengeluaran";
import { createDonaturSimpleAction } from "@/actions/donatur";
import Swal from "sweetalert2";
import { formatAngkaInput, parseFormattedNumber, cn } from "@/lib/utils";
import TextArea from "@/components/form/input/TextArea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { safeFormatDate } from "@/lib/date-helper";
import { id } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DonaturFormValues {
  nama: string;
  alamat: string;
  jumlah: number;
  bulan: string;
}

const bulanOptions = [
  { value: "jan", label: "Januari" },
  { value: "feb", label: "Februari" },
  { value: "mar", label: "Maret" },
  { value: "apr", label: "April" },
  { value: "mei", label: "Mei" },
  { value: "jun", label: "Juni" },
  { value: "jul", label: "Juli" },
  { value: "aug", label: "Agustus" },
  { value: "sep", label: "September" },
  { value: "okt", label: "Oktober" },
  { value: "nov", label: "November" },
  { value: "des", label: "Desember" },
];

interface FormDonaturRutinProps {
  onSuccess: () => void;
}

export function FormDonaturRutin({ onSuccess }: FormDonaturRutinProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [jumlahDisplay, setJumlahDisplay] = React.useState("");

  const form = useForm<DonaturFormValues>({
    defaultValues: {
      nama: "",
      alamat: "",
      jumlah: 0,
      bulan: "jan",
    },
  });

  const handleJumlahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAngkaInput(e.target.value);
    setJumlahDisplay(formatted);
    const numericValue = Number(parseFormattedNumber(formatted));
    form.setValue("jumlah", numericValue);
  };

  const onSubmit = async (data: DonaturFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createDonaturSimpleAction({
        nama: data.nama,
        alamat: data.alamat,
        bulan: data.bulan,
        jumlah: data.jumlah,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      await Swal.fire({
        title: "Berhasil!",
        text: "Data donatur berhasil disimpan",
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
      console.error("Error saat menyimpan data donatur:", error);
      await Swal.fire({
        title: "Error!",
        text: error instanceof Error ? error.message : "Gagal menyimpan data donatur",
        icon: "error",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } finally {
      setIsSubmitting(false);
    }
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
                  <InputField placeholder="Masukkan nama donatur" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alamat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alamat</FormLabel>
                <FormControl>
                  <InputField placeholder="Masukkan alamat donatur" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bulan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bulan</FormLabel>
                  <FormControl>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      {...field}
                    >
                      {bulanOptions.map((bulan) => (
                        <option key={bulan.value} value={bulan.value}>
                          {bulan.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jumlah"
              render={() => (
                <FormItem>
                  <FormLabel>Jumlah (Rp)</FormLabel>
                  <FormControl>
                    <InputField
                      type="text"
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
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

interface PengeluaranFormValues {
  nama: string;
  tanggal: Date;
  jumlah: number;
  keterangan: string;
}

interface FormPengeluaranProps {
  onSuccess: () => void;
}

export function FormPengeluaran({ onSuccess }: FormPengeluaranProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [jumlahDisplay, setJumlahDisplay] = React.useState("");

  const form = useForm<PengeluaranFormValues>({
    defaultValues: {
      nama: "",
      tanggal: new Date(),
      jumlah: 0,
      keterangan: "",
    },
  });

  const handleJumlahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAngkaInput(e.target.value);
    setJumlahDisplay(formatted);
    const numericValue = Number(parseFormattedNumber(formatted));
    form.setValue("jumlah", numericValue);
  };

  const onSubmit = async (data: PengeluaranFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createPengeluaranSimpleAction({
        nama: data.nama,
        tanggal: data.tanggal,
        jumlah: data.jumlah,
        keterangan: data.keterangan,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      await Swal.fire({
        title: "Berhasil!",
        text: "Data pengeluaran berhasil disimpan",
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
      console.error("Error saat menyimpan data pengeluaran:", error);
      await Swal.fire({
        title: "Error!",
        text: error instanceof Error ? error.message : "Gagal menyimpan data pengeluaran",
        icon: "error",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } finally {
      setIsSubmitting(false);
    }
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
                <FormLabel>Nama Pengeluaran</FormLabel>
                <FormControl>
                  <InputField placeholder="Masukkan nama pengeluaran" {...field} />
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
                <FormLabel>Tanggal</FormLabel>
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
                          safeFormatDate(field.value, "dd MMMM yyyy")
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
            render={() => (
              <FormItem>
                <FormLabel>Jumlah (Rp)</FormLabel>
                <FormControl>
                  <InputField
                    type="text"
                    placeholder="0"
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
                    placeholder="Masukkan keterangan pengeluaran"
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
