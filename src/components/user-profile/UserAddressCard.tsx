// src/components/user-profile/UserAddress.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

interface UserAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export default function UserAddress() {
  const { isOpen, openModal, closeModal } = useModal();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [address, setAddress] = useState<UserAddress>({
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: ""
  });

  // Menggunakan refs untuk mengelola form data
  const streetRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);
  const postalCodeRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  // Style untuk input yang konsisten
  const inputClassName = `w-full px-4 py-3 text-sm border border-gray-200 rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
    dark:border-gray-700 dark:bg-gray-800 dark:text-white 
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    disabled:opacity-50 disabled:cursor-not-allowed`;

  useEffect(() => {
    getUser();
  }, []);

  // Update refs ketika address berubah
  useEffect(() => {
    if (streetRef.current) streetRef.current.value = address.street;
    if (cityRef.current) cityRef.current.value = address.city;
    if (stateRef.current) stateRef.current.value = address.state;
    if (postalCodeRef.current) postalCodeRef.current.value = address.postal_code;
    if (countryRef.current) countryRef.current.value = address.country;
  }, [address]);

  const getUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error getting user:", error);
        return;
      }

      if (user) {
        setUser(user);

        // Set data dari user metadata
        const userData = user.user_metadata || {};

        setAddress({
          street: userData.street || "",
          city: userData.city || "",
          state: userData.state || "",
          postal_code: userData.postal_code || "",
          country: userData.country || ""
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Ambil nilai dari refs
    const street = streetRef.current?.value || "";
    const city = cityRef.current?.value || "";
    const state = stateRef.current?.value || "";
    const postal_code = postalCodeRef.current?.value || "";
    const country = countryRef.current?.value || "";

    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          street: street,
          city: city,
          state: state,
          postal_code: postal_code,
          country: country
        }
      });

      if (error) {
        throw error;
      }

      // Update local state
      setAddress({
        street: street,
        city: city,
        state: state,
        postal_code: postal_code,
        country: country
      });

      toast.success("Alamat berhasil diperbarui!");
      closeModal();

    } catch (error: any) {
      console.error("Error updating address:", error);
      toast.error(error?.message || "Gagal memperbarui alamat");
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
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Informasi Alamat
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Alamat Jalan
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address.street || "Belum diatur"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Kota
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address.city || "Belum diatur"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Kecamatan
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address.state || "Belum diatur"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Kode Pos
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address.postal_code || "Belum diatur"}
              </p>
            </div>


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

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Alamat Jalan</Label>
                    <input
                      ref={streetRef}
                      type="text"
                      name="street"
                      placeholder="Masukkan alamat jalan lengkap"
                      className={inputClassName}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Kota</Label>
                    <input
                      ref={cityRef}
                      type="text"
                      name="city"
                      placeholder="Masukkan nama kota"
                      className={inputClassName}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Kecamatan</Label>
                    <input
                      ref={stateRef}
                      type="text"
                      name="state"
                      placeholder="Masukkan nama kecamatan"
                      className={inputClassName}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Kode Pos</Label>
                    <input
                      ref={postalCodeRef}
                      type="text"
                      name="postal_code"
                      placeholder="Masukkan kode pos"
                      className={inputClassName}
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