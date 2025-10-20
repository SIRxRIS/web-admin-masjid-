// src/components/user-profile/UserMetaCard.tsx
"use client";
import React, { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { useAuth } from "../../hooks/useAuth";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userProfile) return;

    setIsUpdating(true);
    const formData = new FormData(event.currentTarget);

    try {
      const payload = {
        nama: (formData.get('nama') as string) || undefined,
        phone: (formData.get('phone') as string) || undefined,
        alamat: (formData.get('alamat') as string) || undefined,
      };

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || result?.error) {
        throw new Error(result?.error || 'Gagal mengupdate profile');
      }

      // Panggil refreshUserProfile untuk memuat ulang data
      await refreshUserProfile();

      Swal.fire({
        title: "Berhasil!",
        text: "Profile berhasil diupdate!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true
      });
      closeModal();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      await Swal.fire({
        title: "Gagal!",
        text: error?.message || "Gagal mengupdate profile",
        icon: "error",
        confirmButtonText: "OK"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2 text-gray-500 dark:text-gray-400">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Silakan login terlebih dahulu untuk melihat profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <Image
                width={80}
                height={80}
                src={userProfile.avatar_url || "/default-avatar.png"}
                alt="user"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {userProfile.nama || userProfile.full_name || `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Nama tidak tersedia'}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(userProfile as any).jabatan || 'Jabatan Belum diatur'}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Role Otomatis diatur berdasarkan jabatan
                </p>
              </div>
              
              {/* Informasi Kontak - Improved UI */}
              <div className="mt-4 space-y-2">
                <div className="flex flex-col items-center gap-2 xl:items-start">
                  {userProfile.phone && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 w-full xl:w-auto">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Telepon</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {userProfile.phone}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 w-full xl:w-auto">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Email</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {userProfile.email || 'Email tidak tersedia'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              {/* Social media links - bisa ditambahkan nanti jika diperlukan */}
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
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
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form onSubmit={handleSave} className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Nama Lengkap</Label>
                    <Input
                      type="text"
                      name="nama"
                      defaultValue={userProfile.nama || userProfile.full_name || `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Jabatan</Label>
                    <Input
                      type="text"
                      name="jabatan"
                      defaultValue={userProfile.jabatan}
                      placeholder="Jabatan diatur otomatis"
                      disabled
                      className="opacity-50 cursor-not-allowed"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input
                      type="text"
                      name="phone"
                      defaultValue={userProfile.phone}
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      defaultValue={userProfile.email}
                      disabled
                      className="opacity-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email tidak bisa diubah</p>
                  </div>

                  <div className="col-span-2">
                    <Label>Alamat</Label>
                    <Input
                      type="text"
                      name="alamat"
                      defaultValue={userProfile.alamat}
                      placeholder="Masukkan alamat lengkap"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={closeModal}
                disabled={isUpdating}
              >
                Close
              </Button>
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}