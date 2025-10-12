"use client";
import React, { useMemo, useState } from "react";
import type { DonaturData } from "@/lib/schema/pemasukan/schema";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Button from "@/components/ui/button/Button";
import { Label } from "@/components/ui/label";
import Badge from "@/components/ui/badge/Badge";
import InputField from "@/components/form/input/InputField";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormDonaturRutin } from "@/components/finance/pemasukan/table-donation/riwayat-tahunan/form-donatur";
import { formatAngkaInput, parseFormattedNumber } from "@/lib/utils";
import Swal from "sweetalert2";

type CreateTransaksiDonaturInput = {
  donaturId: number;
  tahun: number;
  jumlah: number; // nominal >= 0
  bulan?: number; // legacy single month
  bulanList?: number[]; // multi-bulan
  mode?: "skip" | "replace" | "accumulate"; // anti duplikasi behavior
};

// Cart item type for donation cart
type DonationCartItem = {
  donaturId: number;
  donaturNama: string;
  donaturAlamat: string;
  bulanList: number[];
  nominal: number;
  totalAmount: number;
  mode: "skip" | "replace" | "accumulate";
};

const monthNames = [
  { key: "jan", label: "Jan", value: 1 },
  { key: "feb", label: "Feb", value: 2 },
  { key: "mar", label: "Mar", value: 3 },
  { key: "apr", label: "Apr", value: 4 },
  { key: "mei", label: "Mei", value: 5 },
  { key: "jun", label: "Jun", value: 6 },
  { key: "jul", label: "Jul", value: 7 },
  { key: "aug", label: "Aug", value: 8 },
  { key: "sep", label: "Sep", value: 9 },
  { key: "okt", label: "Okt", value: 10 },
  { key: "nov", label: "Nov", value: 11 },
  { key: "des", label: "Des", value: 12 },
];

export default function PenagihanDonaturPage({ initialDonaturList, initialTahun }: { initialDonaturList: DonaturData[]; initialTahun: number; }) {
  const [tahun] = useState<number>(initialTahun);
  const [query, setQuery] = useState("");
  const [donaturList, setDonaturList] = useState<DonaturData[]>(initialDonaturList);
  const [selectedDonatur, setSelectedDonatur] = useState<DonaturData | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([new Date().getMonth() + 1]);
  const [mode, setMode] = useState<"skip" | "replace" | "accumulate">("skip");
  const [jumlah, setJumlah] = useState<number>(0);
  const [jumlahDisplay, setJumlahDisplay] = useState<string>(""); // For formatted display
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  // Donation cart state
  const [donationCart, setDonationCart] = useState<DonationCartItem[]>([]);
  const [savingAllDonations, setSavingAllDonations] = useState(false);

  // Calculate total amount for selected months
  const totalTagihan = useMemo(() => {
    return selectedMonths.length * jumlah;
  }, [selectedMonths.length, jumlah]);

  // Calculate total amount in cart
  const cartTotalAmount = useMemo(() => {
    return donationCart.reduce((sum, item) => sum + item.totalAmount, 0);
  }, [donationCart]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filteredList = donaturList;
    if (q) {
      filteredList = filteredList.filter(
        (d) => d.nama.toLowerCase().includes(q) || d.alamat.toLowerCase().includes(q)
      );
    }
    return filteredList.slice(0, 20);
  }, [query, donaturList]);

  // Helper function to check if a donor is regular (has any monthly donations)
  const isRegularDonor = (donor: DonaturData) => {
    return donor.jan > 0 || donor.feb > 0 || donor.mar > 0 || donor.apr > 0 || 
           donor.mei > 0 || donor.jun > 0 || donor.jul > 0 || donor.aug > 0 || 
           donor.sep > 0 || donor.okt > 0 || donor.nov > 0 || donor.des > 0;
  };

  // Check if specific month is already paid by selected donor
  const isMonthPaid = (donor: DonaturData | null, month: number) => {
    if (!donor) return false;
    switch (month) {
      case 1: return donor.jan > 0;
      case 2: return donor.feb > 0;
      case 3: return donor.mar > 0;
      case 4: return donor.apr > 0;
      case 5: return donor.mei > 0;
      case 6: return donor.jun > 0;
      case 7: return donor.jul > 0;
      case 8: return donor.aug > 0;
      case 9: return donor.sep > 0;
      case 10: return donor.okt > 0;
      case 11: return donor.nov > 0;
      case 12: return donor.des > 0;
      default: return false;
    }
  };

  // Check if donatur is already in cart
  const isDonaturInCart = (donaturId: number) => {
    return donationCart.some(item => item.donaturId === donaturId);
  };

  // Handle nominal input with formatting
  const handleNominalChange = (value: string) => {
    const formatted = formatAngkaInput(value);
    setJumlahDisplay(formatted);
    const numeric = parseFormattedNumber(formatted);
    setJumlah(parseInt(numeric) || 0);
  };

  // Set nominal from quick buttons
  const setNominalFromButton = (amount: number) => {
    setJumlah(amount);
    setJumlahDisplay(formatAngkaInput(amount.toString()));
  };

  // Add to cart function (replaces the old handleSubmit)
  const addToCart = async () => {
    if (!selectedDonatur) {
      await Swal.fire({
        icon: 'warning',
        title: 'Donatur Belum Dipilih',
        text: 'Silakan pilih donatur terlebih dahulu.',
      });
      return;
    }
    if (jumlah <= 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Nominal Tidak Valid',
        text: 'Masukkan nominal yang valid (lebih dari 0).',
      });
      return;
    }
    if (!selectedMonths.length) {
      await Swal.fire({
        icon: 'warning',
        title: 'Bulan Belum Dipilih',
        text: 'Pilih minimal satu bulan.',
      });
      return;
    }

    // Check if donatur already in cart
    if (isDonaturInCart(selectedDonatur.id)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Donatur Sudah Ada',
        text: 'Donatur ini sudah ada dalam daftar donasi. Hapus terlebih dahulu jika ingin mengubah.',
      });
      return;
    }

    const cartItem: DonationCartItem = {
      donaturId: selectedDonatur.id,
      donaturNama: selectedDonatur.nama,
      donaturAlamat: selectedDonatur.alamat,
      bulanList: [...selectedMonths],
      nominal: jumlah,
      totalAmount: selectedMonths.length * jumlah,
      mode: mode,
    };

    setDonationCart(prev => [...prev, cartItem]);
    
    // Reset form
    setSelectedDonatur(null);
    setJumlah(0);
    setJumlahDisplay("");
    setSelectedMonths([new Date().getMonth() + 1]);
    setMessage("Donatur berhasil ditambahkan ke daftar donasi!");
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  // Remove from cart
  const removeFromCart = (donaturId: number) => {
    setDonationCart(prev => prev.filter(item => item.donaturId !== donaturId));
  };

  // Save all donations in cart
  const saveAllDonations = async () => {
    if (donationCart.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Keranjang Kosong',
        text: 'Tidak ada donasi dalam keranjang untuk disimpan.',
      });
      return;
    }

    // Show confirmation
    const result = await Swal.fire({
      title: 'Konfirmasi Simpan Semua Donasi',
      html: `
        <div class="text-left">
          <p><strong>Jumlah Donatur:</strong> ${donationCart.length}</p>
          <p><strong>Total Donasi:</strong> Rp ${cartTotalAmount.toLocaleString('id-ID')}</p>
          <p class="text-sm text-gray-600 mt-2">Apakah Anda yakin ingin menyimpan semua donasi ini?</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Simpan Semua',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });

    if (!result.isConfirmed) return;

    setSavingAllDonations(true);

    // Show loading with progress
    let progressCount = 0;
    Swal.fire({
      title: 'Menyimpan Semua Donasi...',
      html: `
        <div class="text-left">
          <p>Memproses <span id="progress">${progressCount}</span> dari ${donationCart.length} donatur</p>
          <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div id="progress-bar" class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div>
          </div>
        </div>
      `,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const cartItem of donationCart) {
        try {
          const payload: CreateTransaksiDonaturInput = {
            donaturId: cartItem.donaturId,
            tahun,
            jumlah: cartItem.nominal,
            bulanList: cartItem.bulanList,
            mode: cartItem.mode,
          };

          const res = await fetch("/api/penagihan-donatur", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.message || "Gagal menyimpan");
          }

          successCount++;
        } catch (error: any) {
          errorCount++;
          errors.push(`${cartItem.donaturNama}: ${error.message}`);
        }

        // Update progress
        progressCount++;
        const progressPercent = (progressCount / donationCart.length) * 100;
        const progressElement = document.getElementById('progress');
        const progressBar = document.getElementById('progress-bar');
        if (progressElement) progressElement.textContent = progressCount.toString();
        if (progressBar) progressBar.style.width = `${progressPercent}%`;
      }

      Swal.close();

      // Show result
      if (errorCount === 0) {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          html: `
            <div class="text-left">
              <p><strong>Semua donasi berhasil disimpan!</strong></p>
              <p>Jumlah donatur: ${successCount}</p>
              <p>Total donasi: Rp ${cartTotalAmount.toLocaleString('id-ID')}</p>
            </div>
          `,
          confirmButtonText: 'OK'
        });
        
        // Clear cart after successful save
        setDonationCart([]);
        
        // Auto refresh page
        window.location.reload();
      } else {
        await Swal.fire({
          icon: 'warning',
          title: 'Sebagian Berhasil',
          html: `
            <div class="text-left">
              <p><strong>Berhasil:</strong> ${successCount} donatur</p>
              <p><strong>Gagal:</strong> ${errorCount} donatur</p>
              ${errors.length > 0 ? `<div class="mt-2 text-sm"><strong>Error:</strong><br>${errors.slice(0, 3).join('<br>')}</div>` : ''}
            </div>
          `,
          confirmButtonText: 'OK'
        });
      }
    } catch (e: any) {
      Swal.close();
      await Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: e?.message || "Terjadi kesalahan saat menyimpan donasi.",
      });
    } finally {
      setSavingAllDonations(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Penagihan Donatur</h1>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Donatur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Tambah Donatur Baru</DialogTitle>
                <DialogDescription>Isi data donatur rutin seperti pada halaman pemasukan.</DialogDescription>
              </DialogHeader>
              <FormDonaturRutin onSuccess={() => { /* optionally refresh list */ }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Cari Donatur</CardTitle>
          </CardHeader>
          <CardContent>
            <InputField
              id="search"
              placeholder="Nama atau alamat"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            
            {/* Results count */}
            <div className="text-xs text-muted-foreground mt-2">
              {filtered.length} donatur
              {filtered.length >= 20 && " (menampilkan 20 teratas)"}
            </div>
            
            <div className="mt-2 max-h-64 overflow-y-auto border rounded p-2 space-y-2">
              {filtered.map((d) => (
                <Button
                  key={d.id}
                  variant={selectedDonatur?.id === d.id ? "primary" : "outline"}
                  className={`w-full justify-start ${isDonaturInCart(d.id) ? "opacity-50" : ""}`}
                  onClick={() => setSelectedDonatur(d)}
                  disabled={isDonaturInCart(d.id)}
                >
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <span className={selectedDonatur?.id === d.id ? "font-medium text-white" : "font-medium"}>{d.nama}</span>
                      {isRegularDonor(d) && <Badge variant="secondary" className="text-xs">Rutin</Badge>}
                      {isDonaturInCart(d.id) && <Badge variant="default" className="text-xs bg-green-600">Dalam Keranjang</Badge>}
                    </div>
                    <span className={selectedDonatur?.id === d.id ? "text-xs text-white/80" : "text-xs text-muted-foreground"}>{d.alamat}</span>
                  </div>
                </Button>
              ))}
              {filtered.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Tidak ada donatur ditemukan
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detail Penagihan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tahun */}
             <div>
               <Label>Tahun</Label>
               <InputField value={tahun.toString()} disabled className="max-w-32" />
             </div>

             {/* Nominal */}
             <div>
               <Label>Nominal per Bulan</Label>
               <InputField
                 type="text"
                 value={jumlahDisplay}
                 onChange={(e) => handleNominalChange(e.target.value)}
                 placeholder="0"
                 className="text-lg font-medium"
               />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {[10000, 20000, 50000, 100000].map((n) => (
                  <Button key={n} variant="outline" size="sm" onClick={() => setNominalFromButton(n)}>
                    {n.toLocaleString("id-ID")}
                  </Button>
                ))}
              </div>
            </div>

            {/* Pilih Bulan */}
            <div>
              <Label className="text-base font-medium">Pilih Bulan</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-2">
                {monthNames.map((m) => {
                  const active = selectedMonths.includes(m.value);
                  const paid = isMonthPaid(selectedDonatur, m.value);
                  return (
                    <Button
                      key={m.value}
                      size="sm"
                      variant={active ? "primary" : "outline"}
                      onClick={() => {
                        setSelectedMonths((prev) => {
                          return prev.includes(m.value)
                            ? prev.filter((x) => x !== m.value)
                            : [...prev, m.value].sort((a,b)=>a-b);
                        });
                      }}
                      className={`h-10 ${paid ? "!bg-emerald-100 !border-emerald-400 !text-emerald-700 hover:!bg-emerald-200" : ""}`}
                    >
                      {m.label}
                    </Button>
                  );
                })}
              </div>
              
              {/* Selected months summary */}
              {selectedMonths.length > 0 && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Bulan Terpilih: {selectedMonths.length} bulan
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedMonths.sort((a,b) => a-b).map((month) => {
                      const monthName = monthNames.find(m => m.value === month)?.label;
                      return (
                        <Badge key={month} variant="secondary" className="text-xs">
                          {monthName}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Mode */}
            <div>
              <Label className="text-sm font-medium">Mode Penagihan</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant={mode==='skip'? 'primary':'outline'} 
                  onClick={()=>setMode('skip')}
                  className="h-10"
                >
                  Skip
                </Button>
                <Button 
                  size="sm" 
                  variant={mode==='replace'? 'primary':'outline'} 
                  onClick={()=>setMode('replace')}
                  className="h-10"
                >
                  Replace
                </Button>
                <Button 
                  size="sm" 
                  variant={mode==='accumulate'? 'primary':'outline'} 
                  onClick={()=>setMode('accumulate')}
                  className="h-10"
                >
                  Accumulate
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {mode === 'skip' && 'Lewati bulan yang sudah ada data'}
                {mode === 'replace' && 'Ganti data bulan yang sudah ada'}
                {mode === 'accumulate' && 'Tambahkan ke data bulan yang sudah ada'}
              </div>
            </div>

            {/* Total Calculation */}
            {selectedMonths.length > 0 && jumlah > 0 && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Tagihan</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedMonths.length} bulan × Rp {jumlah.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      Rp {totalTagihan.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <div>{message && <p className="text-sm text-green-600">{message}</p>}</div>
            <Button onClick={addToCart} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {loading ? "Menambahkan..." : "Oke"}
            </Button>
          </CardFooter>
        </Card>
      </div>

       {selectedDonatur && (
         <Card>
           <CardHeader>
             <CardTitle>Donatur Terpilih</CardTitle>
           </CardHeader>
           <CardContent className="flex items-center justify-between py-6">
             <div>
               <div className="text-sm font-medium">{selectedDonatur.nama}</div>
               <div className="text-xs text-muted-foreground">{selectedDonatur.alamat}</div>
             </div>
             <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setSelectedDonatur(null)}>
               Batal
             </Button>
           </CardContent>
         </Card>
       )}

      {/* Donation Cart */}
      {donationCart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Keranjang Donasi</span>
              <Badge variant="secondary" className="text-sm">
                {donationCart.length} donatur
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {donationCart.map((item) => (
                <div key={item.donaturId} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.donaturNama}</div>
                    <div className="text-xs text-muted-foreground">{item.donaturAlamat}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.bulanList.length} bulan × Rp {item.nominal.toLocaleString("id-ID")} = Rp {item.totalAmount.toLocaleString("id-ID")}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.bulanList.sort((a,b) => a-b).map((month) => {
                        const monthName = monthNames.find(m => m.value === month)?.label;
                        return (
                          <Badge key={month} variant="outline" className="text-xs">
                            {monthName}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => removeFromCart(item.donaturId)}
                    className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Hapus
                  </Button>
                </div>
              ))}
            </div>
            
            {/* Cart Total */}
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground">Total Keseluruhan</div>
                  <div className="text-xs text-muted-foreground">
                    {donationCart.length} donatur
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    Rp {cartTotalAmount.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={saveAllDonations} 
              disabled={savingAllDonations || donationCart.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {savingAllDonations ? "Menyimpan..." : "Simpan Donasi"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}