"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Plus, Trash2, Download, Upload, Globe } from "lucide-react";
import { format, addDays } from "date-fns";
import { id } from "date-fns/locale";
import { cn, formatAngkaInput, parseFormattedNumber } from "@/lib/utils";
import { LaporanJumatExport, getNextFriday } from "@/lib/schema/laporan/laporan-jumat-schema";
import { exportLaporanJumatToPDF } from "@/components/pdf-export/laporan-jumat-pdf";
import { toast } from "sonner";

interface SumbanganItem {
  nama: string;
  jumlah: number;
}
 
interface PengeluaranItem {
  nama: string;
  jumlah: number;
}

function TableLaporanJumat() {
  const [selectedDate, setSelectedDate] = useState<Date>(getNextFriday());
  const [paperSize, setPaperSize] = useState<'a4' | 'f4'>('a4');
  const [uploadToSupabase, setUploadToSupabase] = useState<boolean>(false);
  const [makePublic, setMakePublic] = useState<boolean>(false);
  
  // Manual input states
  const [saldoKasJumatLalu, setSaldoKasJumatLalu] = useState<number>(0);
  const [saldoKasJumatLaluDisplay, setSaldoKasJumatLaluDisplay] = useState<string>("");
  const [kotakAmalJumat, setKotakAmalJumat] = useState<number>(0);
  const [kotakAmalJumatDisplay, setKotakAmalJumatDisplay] = useState<string>("");
  const [sumbangan, setSumbangan] = useState<SumbanganItem[]>([]);
  const [pengeluaran, setPengeluaran] = useState<PengeluaranItem[]>([]);
  const [kasBsi, setKasBsi] = useState<number>(0);
  const [kasBsiDisplay, setKasBsiDisplay] = useState<string>("");
  const [kasBankSulselbar, setKasBankSulselbar] = useState<number>(0);
  const [kasBankSulselbarDisplay, setKasBankSulselbarDisplay] = useState<string>("");
  const [kasTunai, setKasTunai] = useState<number>(0);
  const [kasTunaiDisplay, setKasTunaiDisplay] = useState<string>("");
  const [khatib, setKhatib] = useState<string>("");
  const [muadzdzin, setMuadzdzin] = useState<string>("");
  const [imam, setImam] = useState<string>("");

  // Helper function to get previous Friday
  const getPreviousFriday = (date: Date): Date => {
    const dayOfWeek = date.getDay();
    const daysToSubtract = dayOfWeek === 5 ? 7 : (dayOfWeek + 2) % 7;
    return addDays(date, -daysToSubtract);
  };

  // Helper functions for number formatting
  const handleNumberInput = (
    value: string,
    setter: (num: number) => void,
    displaySetter: (str: string) => void
  ) => {
    const formatted = formatAngkaInput(value);
    displaySetter(formatted);
    const numeric = parseFormattedNumber(formatted);
    setter(Number(numeric) || 0);
  };

  // Helper functions for managing sumbangan items
  const addSumbanganItem = () => {
    setSumbangan([...sumbangan, { nama: "", jumlah: 0 }]);
  };

  const removeSumbanganItem = (index: number) => {
    setSumbangan(sumbangan.filter((_, i) => i !== index));
  };

  const updateSumbanganItem = (index: number, field: keyof SumbanganItem, value: string | number) => {
    const updated = [...sumbangan];
    if (field === 'jumlah' && typeof value === 'string') {
      const formatted = formatAngkaInput(value);
      const numeric = parseFormattedNumber(formatted);
      updated[index] = { ...updated[index], [field]: Number(numeric) || 0 };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setSumbangan(updated);
  };

  // Helper functions for managing pengeluaran items
  const addPengeluaranItem = () => {
    setPengeluaran([...pengeluaran, { nama: "", jumlah: 0 }]);
  };

  const removePengeluaranItem = (index: number) => {
    setPengeluaran(pengeluaran.filter((_, i) => i !== index));
  };

  const updatePengeluaranItem = (index: number, field: keyof PengeluaranItem, value: string | number) => {
    const updated = [...pengeluaran];
    if (field === 'jumlah' && typeof value === 'string') {
      const formatted = formatAngkaInput(value);
      const numeric = parseFormattedNumber(formatted);
      updated[index] = { ...updated[index], [field]: Number(numeric) || 0 };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setPengeluaran(updated);
  };

  // Calculate totals
  const totalSumbangan = sumbangan.reduce((sum, item) => sum + item.jumlah, 0);
  const totalPenerimaan = kotakAmalJumat + totalSumbangan;
  const totalPengeluaran = pengeluaran.reduce((sum, item) => sum + item.jumlah, 0);
  const saldoKasHariIni = saldoKasJumatLalu + totalPenerimaan - totalPengeluaran;

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const previousFriday = getPreviousFriday(selectedDate);

  // Export function
  const handleExportPDF = async () => {
    try {
      const exportData: LaporanJumatExport = {
        tanggalLaporan: selectedDate,
        saldoKasJumatLalu,
        kotakAmalJumat,
        kotakAmalJumatTanggal: format(previousFriday, "dd MMMM yyyy", { locale: id }),
        sumbangan: sumbangan.map(item => ({
          nama: item.nama,
          jumlah: item.jumlah
        })),
        totalPenerimaan,
        pengeluaran: pengeluaran.map(item => ({
          nama: item.nama,
          jumlah: item.jumlah
        })),
        totalPengeluaran,
        saldoKasHariIni,
        kasBsi,
        kasBankSulselbar,
        kasTunai,
        khatib,
        muadzdzin,
        imam,
        ketuaPengurus: "Muhammad Arifin, SE",
        bendahara: "Lalu Budiaksa"
      };

      const result = await exportLaporanJumatToPDF(exportData, paperSize, {
        uploadToSupabase,
        isPublic: makePublic,
        uploadedBy: "admin" // TODO: Get from user session
      });
      
      let message = `Laporan Jumat berhasil diekspor ke PDF (${paperSize.toUpperCase()})`;
      
      if (uploadToSupabase && result.uploadResult) {
        if (result.uploadResult.success) {
          message += " dan disimpan ke database";
          if (makePublic) {
            message += " (tersedia untuk publik)";
          }
        } else {
          message += `, namun gagal disimpan ke database: ${result.uploadResult.error}`;
        }
      }
      
      toast.success(message);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Gagal mengekspor laporan ke PDF");
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Laporan Pelaksanaan Sholat Jumat</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Label htmlFor="paper-size" className="text-sm font-medium">
                  Ukuran Kertas:
                </Label>
                <Select value={paperSize} onValueChange={(value: 'a4' | 'f4') => setPaperSize(value)}>
                  <SelectTrigger id="paper-size" className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="f4">F4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Supabase upload options */}
              <div className="flex items-center space-x-4 border-l pl-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="upload-supabase"
                    checked={uploadToSupabase}
                    onCheckedChange={setUploadToSupabase}
                  />
                  <Label htmlFor="upload-supabase" className="text-sm flex items-center space-x-1">
                    <Upload className="h-3 w-3" />
                    <span>Simpan ke Database</span>
                  </Label>
                </div>
                
                {uploadToSupabase && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="make-public"
                      checked={makePublic}
                      onCheckedChange={setMakePublic}
                    />
                    <Label htmlFor="make-public" className="text-sm flex items-center space-x-1">
                      <Globe className="h-3 w-3" />
                      <span>Tampilkan di Landing Page</span>
                    </Label>
                  </div>
                )}
              </div>
              
              <Button
                onClick={handleExportPDF}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2" 
              >
                <Download className="h-4 w-4" />
                <span>Export PDF</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: id }) : "Pilih tanggal"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Manual Input Forms */}
      <div className="space-y-6">
        {/* Section A: Saldo Kas Jumat Lalu */}
        <Card>
          <CardHeader>
            <CardTitle>A. Saldo Kas Jum'at lalu</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="saldoKasJumatLalu">Saldo Kas Jum'at lalu</Label>
              <Input
                id="saldoKasJumatLalu"
                type="text"
                value={saldoKasJumatLaluDisplay}
                onChange={(e) => handleNumberInput(e.target.value, setSaldoKasJumatLalu, setSaldoKasJumatLaluDisplay)}
                placeholder="Masukkan saldo kas Jumat lalu"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section B: Penerimaan */}
        <Card>
          <CardHeader>
            <CardTitle>B. Penerimaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Kotak Amal Jumat */}
            <div>
              <Label htmlFor="kotakAmalJumat">1. Kotak Amal Jumat, {format(previousFriday, "dd MMMM yyyy", { locale: id })}</Label>
              <Input
                id="kotakAmalJumat"
                type="text"
                value={kotakAmalJumatDisplay}
                onChange={(e) => handleNumberInput(e.target.value, setKotakAmalJumat, setKotakAmalJumatDisplay)}
                placeholder="Masukkan jumlah kotak amal Jumat"
                className="mt-1"
              />
            </div>

            {/* Sumbangan/Donasi */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>2. Sumbangan/Donasi dari:</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSumbanganItem}
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah</span>
                </Button>
              </div>
              
              {sumbangan.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <span className="text-sm w-8">{index + 1})</span>
                  <Input
                    placeholder="Nama pemberi sumbangan"
                    value={item.nama}
                    onChange={(e) => updateSumbanganItem(index, 'nama', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="text"
                    placeholder="Jumlah"
                    value={item.jumlah > 0 ? formatAngkaInput(item.jumlah.toString()) : ""}
                    onChange={(e) => updateSumbanganItem(index, 'jumlah', e.target.value)}
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSumbanganItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Total Penerimaan */}
            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Jumlah Pemasukan</span>
                <span>Rp {totalPenerimaan.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section C: Pengeluaran */}
        <Card>
          <CardHeader>
            <CardTitle>C. Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Daftar Pengeluaran:</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPengeluaranItem}
                className="flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah</span>
              </Button>
            </div>
            
            {pengeluaran.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <span className="text-sm w-8">{index + 1}.</span>
                <Input
                  placeholder="Nama pengeluaran"
                  value={item.nama}
                  onChange={(e) => updatePengeluaranItem(index, 'nama', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="text"
                  placeholder="Jumlah"
                  value={item.jumlah > 0 ? formatAngkaInput(item.jumlah.toString()) : ""}
                  onChange={(e) => updatePengeluaranItem(index, 'jumlah', e.target.value)}
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removePengeluaranItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Total Pengeluaran */}
            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Jumlah Pengeluaran</span>
                <span>Rp {totalPengeluaran.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section D: Saldo Kas Hari Ini */}
        <Card>
          <CardHeader>
            <CardTitle>D. Saldo Kas Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded mb-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Saldo Kas Hari Ini</span>
                <span>Rp {saldoKasHariIni.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Breakdown Kas */}
            <div className="space-y-4">
              <h4 className="font-semibold">Terdiri dari:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="kasBsi">1. Kas BSI</Label>
                  <Input
                    id="kasBsi"
                    type="text"
                    value={kasBsiDisplay}
                    onChange={(e) => handleNumberInput(e.target.value, setKasBsi, setKasBsiDisplay)}
                    placeholder="Kas BSI"
                  />
                </div>
                <div>
                  <Label htmlFor="kasBankSulselbar">2. Kas Bank Sulselbar</Label>
                  <Input
                    id="kasBankSulselbar"
                    type="text"
                    value={kasBankSulselbarDisplay}
                    onChange={(e) => handleNumberInput(e.target.value, setKasBankSulselbar, setKasBankSulselbarDisplay)}
                    placeholder="Kas Bank Sulselbar"
                  />
                </div>
                <div>
                  <Label htmlFor="kasTunai">3. Kas Tunai</Label>
                  <Input
                    id="kasTunai"
                    type="text"
                    value={kasTunaiDisplay}
                    onChange={(e) => handleNumberInput(e.target.value, setKasTunai, setKasTunaiDisplay)}
                    placeholder="Kas Tunai"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Penandatangan */}
        <Card>
          <CardHeader>
            <CardTitle>Yang Bertindak Sebagai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="khatib">1. Khatib</Label>
                <Input
                  id="khatib"
                  type="text"
                  value={khatib}
                  onChange={(e) => setKhatib(e.target.value)}
                  placeholder="Nama Khatib"
                />
              </div>
              <div>
                <Label htmlFor="muadzdzin">2. Muadzdzin</Label>
                <Input
                  id="muadzdzin"
                  type="text"
                  value={muadzdzin}
                  onChange={(e) => setMuadzdzin(e.target.value)}
                  placeholder="Nama Muadzdzin"
                />
              </div>
              <div>
                <Label htmlFor="imam">3. Imam</Label>
                <Input
                  id="imam"
                  type="text"
                  value={imam}
                  onChange={(e) => setImam(e.target.value)}
                  placeholder="Nama Imam"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signature Section */}
        <Card>
          <CardHeader>
            <CardTitle>Penandatangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="font-semibold">Mengetahui,</p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <p className="font-semibold mb-16">Ketua Pengurus</p>
                <div className="border-b border-black pb-1">
                  <p className="font-semibold">Muhammad Arifin, SE</p>
                </div>
              </div>
              <div>
                <p className="font-semibold mb-16">Bendahara</p>
                <div className="border-b border-black pb-1">
                  <p className="font-semibold">Lalu Budiaksa</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TableLaporanJumat;
