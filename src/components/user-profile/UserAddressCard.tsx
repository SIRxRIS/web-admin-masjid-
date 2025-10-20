// src/components/user-profile/UserAddress.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useModal } from "../../hooks/useModal";
import { useAuth } from "../../hooks/useAuth";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  // Menggunakan refs untuk mengelola form data
  const alamatRef = useRef<HTMLTextAreaElement>(null);

  // Style untuk input yang konsisten
  const inputClassName = `w-full px-4 py-3 text-sm border border-gray-200 rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
    dark:border-gray-700 dark:bg-gray-800 dark:text-white 
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    disabled:opacity-50 disabled:cursor-not-allowed`;

  // Update refs ketika userProfile berubah
  useEffect(() => {
    if (alamatRef.current && userProfile?.alamat) {
      alamatRef.current.value = userProfile.alamat;
    }
  }, [userProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const alamat = alamatRef.current?.value || "";

    setSaving(true);

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alamat }),
      });
      const result = await res.json();
      if (!res.ok || result?.error) {
        throw new Error(result?.error || 'Gagal memperbarui alamat');
      }

      // Panggil refreshUserProfile untuk memuat ulang data
      await refreshUserProfile();

      await Swal.fire({
        title: "Berhasil!",
        text: "Alamat berhasil diperbarui!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true
      });
      closeModal();

    } catch (error: any) {
      console.error("Error updating address:", error);
      await Swal.fire({
        title: "Gagal!",
        text: error?.message || "Gagal memperbarui alamat",
        icon: "error",
        confirmButtonText: "OK"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2 text-gray-500 dark:text-gray-400">Loading address...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Silakan login untuk melihat alamat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Informasi Alamat
            </h4>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full mt-1">
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Alamat Lengkap
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90 leading-relaxed">
                    {userProfile?.alamat || (
                      <span className="text-gray-500 dark:text-gray-400 italic">
                        Belum diatur - Klik tombol Edit untuk menambahkan alamat
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto transition-colors"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Informasi Alamat
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Perbarui alamat Anda untuk pengiriman dan informasi lokasi.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Alamat Lengkap
                </h5>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Alamat Lengkap</Label>
                    <textarea
                      ref={alamatRef}
                      rows={3}
                      name="alamat"
                      placeholder="Masukkan alamat lengkap"
                      className={inputClassName}
                      defaultValue={userProfile?.alamat || ""}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} disabled={saving}>
                Tutup
              </Button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}