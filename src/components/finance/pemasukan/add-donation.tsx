// src/components/finance/pemasukan/add-donation
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon } from "lucide-react";
import { FormDonaturRutin } from "./table-donation/riwayat-tahunan/form-donatur";
import { FormDonasiKhusus } from "./table-donation/donasi-khusus/form-donatur-khusus";
import { FormKotakAmal } from "./table-donation/kotak-amal/form-kotak-amal";
import { FormKotakAmalMasjid } from "./table-donation/kotak-amal-masjid/form-kotak-amal-masjid";
import { FormKotakAmalJumat } from "./table-donation/kotak-amal-jumat/form-kotak-amal-jumat";

// Interface untuk FormKotakAmalMasjid
interface KotakAmalMasjidFormValues {
  tanggal: Date;
  jumlah: number;
}

// Interface untuk FormKotakAmalJumat
interface KotakAmalJumatFormValues {
  tanggal: Date;
  jumlah: number;
}

export default function AddDonation() {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState("donatur-rutin");

  // Handler sederhana untuk form yang tidak memerlukan parameter data
  const handleSuccess = () => {
    setOpen(false);
    // Auto refresh halaman setelah berhasil menyimpan
    window.location.reload();
  };

  // Handler khusus untuk FormKotakAmalMasjid
  const handleKotakAmalMasjidSuccess = async (data: KotakAmalMasjidFormValues) => {
    try {
      const response = await fetch("/api/kotak-amal-masjid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tanggal: data.tanggal.toISOString().split('T')[0],
          jumlah: data.jumlah,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save kotak amal masjid");
      }

      // Tutup dialog
      setOpen(false);
      
      // Refresh halaman untuk menampilkan data baru
      window.location.reload();
    } catch (error) {
      console.error("Error saving kotak amal masjid:", error);
      throw error;
    }
  };

  // Handler khusus untuk FormKotakAmalJumat
  const handleKotakAmalJumatSuccess = async (data: KotakAmalJumatFormValues) => {
    try {
      const response = await fetch("/api/kotak-amal-jumat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tanggal: data.tanggal.toISOString().split('T')[0],
          jumlah: data.jumlah,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save kotak amal jumat");
      }

      // Tutup dialog
      setOpen(false);
      
      // Refresh halaman untuk menampilkan data baru
      window.location.reload();
    } catch (error) {
      console.error("Error saving kotak amal jumat:", error);
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button  className="bg-blue-600 hover:bg-blue-700 text-white" size="lg">    
          <PlusIcon className="size-4 mr-1" />
          <span className="font-bold">Tambah</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Donasi Baru</DialogTitle>
          <DialogDescription>
            Pilih jenis donasi dan isi form yang sesuai.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tabValue} onValueChange={setTabValue}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="donatur-rutin">Donasi Rutin</TabsTrigger>
            <TabsTrigger value="donasi-khusus">Donasi Khusus</TabsTrigger>
            <TabsTrigger value="kotak-amal">Kotak Amal</TabsTrigger>
            <TabsTrigger value="kotak-amal-masjid" title="kotak amal masjid">
              Masjid
            </TabsTrigger>
            <TabsTrigger value="kotak-amal-jumat" title="kotak amal jumat">
              Jumat
            </TabsTrigger>
          </TabsList>

          {/* Form Donatur Rutin */}
          <TabsContent value="donatur-rutin">
            <FormDonaturRutin onSuccess={handleSuccess} />
          </TabsContent>

          {/* Form Donasi Khusus */}
          <TabsContent value="donasi-khusus">
            <FormDonasiKhusus onSuccess={handleSuccess} />
          </TabsContent>

          {/* Form Kotak Amal */}
          <TabsContent value="kotak-amal">
            <FormKotakAmal onSuccess={handleSuccess} />
          </TabsContent>

          {/* Form Kotak Amal Masjid */}
          <TabsContent value="kotak-amal-masjid">
            <FormKotakAmalMasjid onSuccess={handleKotakAmalMasjidSuccess} />
          </TabsContent>

          {/* Form Kotak Amal Jumat */}
          <TabsContent value="kotak-amal-jumat">
            <FormKotakAmalJumat onSuccess={handleKotakAmalJumatSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
