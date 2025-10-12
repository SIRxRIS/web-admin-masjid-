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
import Swal from "sweetalert2";
import { formatAngkaInput, parseFormattedNumber } from "@/lib/utils";

interface DonaturFormValues {
  nama: string;
  alamat: string;
  jumlah: number;
  bulan: string;
  tahun: number;
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
      tahun: new Date().getFullYear(), 
    },
  });

  const onSubmit = async (data: DonaturFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/donatur", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: data.nama,
          alamat: data.alamat,
          jumlah: data.jumlah,
          bulan: data.bulan,
          tahun: data.tahun,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save donatur");
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
        text: "Gagal menyimpan data donatur",
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
              name="tahun"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tahun</FormLabel>
                  <FormControl>
                    <InputField
                      type="number"
                      placeholder="Masukkan tahun"
                      min="2000"
                      max="2100"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              render={({ field }) => (
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
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
