// src/components/content/form/content-detail.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Calendar, Clock, User, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { safeFormatDate } from "../date-helper";

// Import types dari schema
import { KontenData } from "@/lib/schema/konten/schema";

interface ContentDetailProps {
  content: KontenData;
  onBack: () => void;
}

const getBadgeVariant = (kategori: string) => {
  const variants: Record<string, string> = {
    KEGIATAN_MASJID: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    PENGUMUMAN: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    KAJIAN_RUTIN: "bg-green-100 text-green-800 hover:bg-green-200",
    KEGIATAN_TPQ_TPA: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    LOMBA_DAN_ACARA: "bg-pink-100 text-pink-800 hover:bg-pink-200",
    PROGRAM_RAMADHAN: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    IDUL_FITRI: "bg-teal-100 text-teal-800 hover:bg-teal-200",
    IDUL_ADHA: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    BAKTI_SOSIAL: "bg-red-100 text-red-800 hover:bg-red-200",
  };

  return variants[kategori] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
};

const getKategoriLabel = (kategori: string) => {
  const labels: Record<string, string> = {
    KEGIATAN_MASJID: "Kegiatan Masjid",
    PENGUMUMAN: "Pengumuman",
    KAJIAN_RUTIN: "Kajian Rutin",
    KEGIATAN_TPQ_TPA: "Kegiatan TPQ/TPA",
    LOMBA_DAN_ACARA: "Lomba dan Acara",
    PROGRAM_RAMADHAN: "Program Ramadhan",
    IDUL_FITRI: "Idul Fitri",
    IDUL_ADHA: "Idul Adha",
    BAKTI_SOSIAL: "Bakti Sosial",
  };

  return labels[kategori] || "Lainnya";
};

export function ContentDetail({ content, onBack }: ContentDetailProps) {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (content.fotoUrl) {
      setImages([content.fotoUrl]);
    } else {
      setImages(["/api/placeholder/800/500"]);
    }
  }, [content]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
    >
      <div className="p-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <div className="flex flex-wrap justify-between items-start mb-4">
          <div>
            <Badge className={getBadgeVariant(content.kategori)}>
              {getKategoriLabel(content.kategori)}
            </Badge>
            {content.penting && (
              <Badge className="ml-2 bg-red-600">Penting</Badge>
            )}
          </div>
        </div>

        <motion.h1
          className="text-3xl font-bold mt-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {content.judul}
        </motion.h1>

        <div className="flex flex-wrap gap-4 mt-4 text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{safeFormatDate(content.tanggal, "dd MMMM yyyy")}</span>
          </div>
          {content.waktu && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{content.waktu}</span>
            </div>
          )}
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            <span>{content.penulis}</span>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {content.deskripsi}
          </p>

          {content.lokasi && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Lokasi:</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {content.lokasi}
              </p>
            </div>
          )}
        </div>

        {images.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Galeri Foto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="overflow-hidden rounded-lg"
                >
                  <img
                    src={image}
                    alt={`Foto ${index + 1} kegiatan ${content.judul}`}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </motion.div>
              ))}
            </div>
            {images.length > 1 && (
              <div className="mt-4 text-center">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Unduh Semua Foto
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
