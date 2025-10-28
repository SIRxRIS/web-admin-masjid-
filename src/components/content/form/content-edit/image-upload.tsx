// src/components/content/form/content-edit/image-upload.tsx
"use client";

import { Trash, Upload, Edit, ImageIcon, Plus } from "lucide-react";
import { FormDescription, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface ImageUploadProps {
  previewImage: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage?: () => void;
  isSubmitting?: boolean;
  allowMultiple?: boolean; // New prop to enable multiple image uploads
}

export function ImageUpload({
  previewImage,
  onImageChange,
  onDeleteImage,
  isSubmitting = false,
  allowMultiple = false, // Default to false for backward compatibility
}: ImageUploadProps) {
  // Local state to track image loading status and errors
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  // Load animate.css for animations
  useEffect(() => {
    const animateCssLink = document.createElement("link");
    animateCssLink.rel = "stylesheet";
    animateCssLink.href =
      "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css";
    document.head.appendChild(animateCssLink);

    return () => {
      if (document.head.contains(animateCssLink)) {
        document.head.removeChild(animateCssLink);
      }
    };
  }, []);

  // Update local preview when previewImage prop changes
  useEffect(() => {
    if (previewImage) {
      setImageStatus('loading');

      // If it's a remote URL, check if it's accessible
      if (previewImage.startsWith('http') || previewImage.startsWith('/')) {
        const img = new Image();
        img.onload = () => {
          setImageStatus('loaded');
          setLocalPreviewUrl(previewImage);
        };
        img.onerror = () => {
          console.log('Image failed to load:', previewImage);
          setImageStatus('error');
          setLocalPreviewUrl('/api/placeholder/600/400');
        };
        img.src = previewImage;
      } else {
        // If it's a data URL or blob URL, assume it's valid
        setImageStatus('loaded');
        setLocalPreviewUrl(previewImage);
      }
    } else {
      setLocalPreviewUrl(null);
    }
  }, [previewImage]);

  const handleDelete = () => {
    if (onDeleteImage && !isSubmitting) {
      Swal.fire({
        title: "Hapus Foto?",
        text: "Anda yakin ingin menghapus foto ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // Clear local preview immediately for better UX
          setLocalPreviewUrl(null);

          // Call the parent delete handler
          onDeleteImage();

          Swal.fire({
            position: "center",
            icon: "success",
            title: "Foto berhasil dihapus",
            showConfirmButton: false,
            timer: 1500,
            showClass: {
              popup: "animate__animated animate__zoomIn",
            },
            hideClass: {
              popup: "animate__animated animate__zoomOut",
            },
          });
        }
      });
    }
  };

  const handleAddImageClick = () => {
    if (!isSubmitting) {
      // Clear the file input first to ensure the change event fires even if selecting the same file
      const fileInput = document.getElementById("foto-upload") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
        fileInput.click();
      }
    }
  };

  const handleEditClick = () => {
    if (!isSubmitting) {
      // Clear the file input first to ensure the change event fires even if selecting the same file
      const fileInput = document.getElementById("foto-upload") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
        fileInput.click();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSubmitting && e.target.files && e.target.files.length > 0) {
      const files = e.target.files;

      // Process all selected files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file size (max 2MB)
        const fileSizeInMB = file.size / (1024 * 1024);
        if (fileSizeInMB > 2) {
          Swal.fire({
            title: 'Ukuran File Terlalu Besar',
            text: 'Ukuran file maksimal adalah 2MB. Silakan pilih file yang lebih kecil.',
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });
          // Reset the input
          e.target.value = '';
          return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
          Swal.fire({
            title: 'Format File Tidak Didukung',
            text: 'Hanya file JPG, JPEG, dan PNG yang diperbolehkan.',
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });
          // Reset the input
          e.target.value = '';
          return;
        }
      }

      try {
        // For UI preview, use the first file
        const firstFile = files[0];
        const localUrl = URL.createObjectURL(firstFile);
        setLocalPreviewUrl(localUrl);
        setImageStatus('loaded');

        // Show a toast notification
        if (files.length > 1) {
          toast.success(`${files.length} gambar berhasil dipilih. Klik Simpan untuk menyimpan perubahan.`, {
            duration: 3000,
          });
        } else {
          toast.success('Gambar berhasil dipilih. Klik Simpan untuk menyimpan perubahan.', {
            duration: 3000,
          });
        }

        // If validation passes, call the parent handler with all files
        onImageChange(e);

        // Clean up the object URL when component unmounts or when a new file is selected
        return () => {
          URL.revokeObjectURL(localUrl);
        };
      } catch (error) {
        console.error('Error creating object URL:', error);
        Swal.fire({
          title: 'Gagal Memproses Gambar',
          text: 'Terjadi kesalahan saat memproses gambar. Silakan coba lagi.',
          icon: 'error',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });
        e.target.value = '';
      }
    }
  };

  return (
    <FormItem>
      <FormLabel>Foto Konten</FormLabel>
      <div className="mt-2 space-y-4">
        {localPreviewUrl ? (
          <div className="relative">
            {imageStatus === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                <div className="animate-pulse flex flex-col items-center">
                  <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Memuat gambar...</span>
                </div>
              </div>
            )}
            <img
              src={localPreviewUrl}
              alt="Preview"
              className={`w-full h-[200px] object-cover rounded-md border border-gray-200 dark:border-gray-700 ${imageStatus === 'loading' ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setImageStatus('loaded')}
              onError={(e) => {
                // If image fails to load, replace with a placeholder
                setImageStatus('error');
                // Use the placeholder API instead of inline SVG
                e.currentTarget.src = '/api/placeholder/600/400';
              }}
            />
            <div className="absolute top-2 right-2 flex space-x-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleEditClick}
                disabled={isSubmitting}
                className="bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Edit className="h-4 w-4 mr-1" />
                Ganti Foto
              </Button>
              {onDeleteImage && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="bg-white text-red-600 hover:bg-red-50 hover:text-red-700 dark:bg-gray-800 dark:text-red-500 dark:hover:bg-gray-700 shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Hapus
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="foto-upload"
              className={`flex flex-col items-center justify-center w-full h-[200px] border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${isSubmitting
                ? "opacity-50 cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                : ""
                }`}
              onDragOver={(e) => {
                e.preventDefault();
                if (!isSubmitting) {
                  e.currentTarget.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
                }
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');

                if (isSubmitting) return;

                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const file = e.dataTransfer.files[0];

                  // Validate file type
                  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                  if (!validTypes.includes(file.type)) {
                    Swal.fire({
                      title: 'Format File Tidak Didukung',
                      text: 'Hanya file JPG, JPEG, dan PNG yang diperbolehkan.',
                      icon: 'error',
                      confirmButtonColor: '#3085d6',
                      confirmButtonText: 'OK',
                    });
                    return;
                  }

                  // Validate file size
                  const fileSizeInMB = file.size / (1024 * 1024);
                  if (fileSizeInMB > 2) {
                    Swal.fire({
                      title: 'Ukuran File Terlalu Besar',
                      text: 'Ukuran file maksimal adalah 2MB. Silakan pilih file yang lebih kecil.',
                      icon: 'error',
                      confirmButtonColor: '#3085d6',
                      confirmButtonText: 'OK',
                    });
                    return;
                  }

                  try {
                    // Create a local preview immediately
                    const localUrl = URL.createObjectURL(file);
                    setLocalPreviewUrl(localUrl);
                    setImageStatus('loaded');

                    // Show a toast notification
                    toast.success('Gambar berhasil dipilih. Klik Simpan untuk menyimpan perubahan.', {
                      duration: 3000,
                    });

                    // Create a synthetic event to pass to the handler
                    const fileInput = document.getElementById('foto-upload') as HTMLInputElement;
                    if (fileInput) {
                      // Create a new FileList-like object
                      const dataTransfer = new DataTransfer();
                      dataTransfer.items.add(file);
                      fileInput.files = dataTransfer.files;

                      // Trigger change event
                      const event = new Event('change', { bubbles: true });
                      fileInput.dispatchEvent(event);

                      // Call the handler directly
                      const syntheticEvent = {
                        target: fileInput,
                        currentTarget: fileInput,
                      } as unknown as React.ChangeEvent<HTMLInputElement>;
                      onImageChange(syntheticEvent);
                    }
                  } catch (error) {
                    console.error('Error processing dropped file:', error);
                    Swal.fire({
                      title: 'Gagal Memproses Gambar',
                      text: 'Terjadi kesalahan saat memproses gambar. Silakan coba lagi.',
                      icon: 'error',
                      confirmButtonColor: '#3085d6',
                      confirmButtonText: 'OK',
                    });
                  }
                }
              }}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload
                  className={`w-10 h-10 mb-3 text-gray-400 ${isSubmitting ? "animate-pulse" : ""
                    }`}
                />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">
                    {isSubmitting ? "Mengunggah..." : "Klik untuk unggah"}
                  </span>
                  {!isSubmitting && " atau seret dan lepas"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG atau JPEG (Maks. 2MB)
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Add a "Tambah Gambar" button that's always visible */}
        {allowMultiple && (
          <div className="flex justify-center mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddImageClick}
              disabled={isSubmitting}
              className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
            >
              <Plus className="h-4 w-4" />
              Tambah Gambar Lain
            </Button>
          </div>
        )}

        <input
          id="foto-upload"
          type="file"
          className="hidden"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
          disabled={isSubmitting}
          multiple={allowMultiple} // Enable multiple file selection if allowMultiple is true
        />
      </div>
      <FormDescription>
        Opsional. Unggah foto untuk memperkaya konten masjid.
        {allowMultiple && (
          <span className="block text-blue-600 dark:text-blue-400 mt-1">
            Anda dapat menambahkan lebih dari satu gambar untuk konten ini.
          </span>
        )}
        {isSubmitting && (
          <span className="block text-amber-600 dark:text-amber-400 mt-1">
            Sedang mengunggah gambar, mohon tunggu...
          </span>
        )}
      </FormDescription>
    </FormItem>
  );
}