"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type InventarisData } from "@/lib/schema/inventaris/schema";
import { motion } from "motion/react";

interface GalleryInventarisProps {
  inventarisData: InventarisData[];
  isLoading?: boolean;
}

const SkeletonCard = () => (
  <Card className="overflow-hidden">
    <motion.div
      className="relative aspect-square bg-gray-200"
      animate={{
        backgroundColor: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    <CardFooter className="flex flex-col items-start gap-2 p-4">
      <div className="flex w-full items-center justify-between gap-2">
        <motion.div
          className="h-6 w-32 bg-gray-200 rounded"
          animate={{
            backgroundColor: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="h-6 w-24 bg-gray-200 rounded"
          animate={{
            backgroundColor: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      <div className="flex w-full flex-col gap-1">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-4 w-full bg-gray-200 rounded"
            animate={{
              backgroundColor: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    </CardFooter>
  </Card>
);

export default function GalleryInventaris({ inventarisData, isLoading = false }: GalleryInventarisProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {inventarisData.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden">
            <div className="relative aspect-square w-full">
              <div className="relative w-full h-full">
                {item.fotoUrl ? (
                  <Image
                    src={item.fotoUrl}
                    alt={item.namaBarang}
                    fill
                    className="object-cover"
                    priority
                    onError={(e) => {
                      // Handle broken image
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50 border-2 border-dashed border-gray-200">
                    <div className="text-center p-4">
                      <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-xs text-gray-500">Tidak ada foto</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <CardFooter className="flex flex-col items-start gap-2 p-4">
              <div className="flex w-full items-center justify-between gap-2">
                <h3 className="font-semibold">{item.namaBarang}</h3>
                <Badge variant="outline">{item.kategori}</Badge>
              </div>
              <div className="flex w-full flex-col gap-1 text-sm text-muted-foreground">
                <p>Jumlah: {item.jumlah} {item.satuan}</p>
                <p>Lokasi: {item.lokasi}</p>
                <p>Kondisi: {item.kondisi}</p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}