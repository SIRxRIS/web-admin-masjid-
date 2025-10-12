"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Upload, Trash2, ImagePlus, Camera, Star, StarOff, PenLine } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { GambarKontenType } from "@/lib/schema/konten/schema";

interface GalleryTabProps {
  gambarKonten: GambarKontenType[];
  isSubmitting: boolean;
  isDragging: boolean;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  removeAllImages: () => void;
  setGambarUtama: (index: number) => void;
  updateCaption: (index: number, caption: string) => void;
}

export function GalleryTab({
  gambarKonten,
  isSubmitting,
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleImageUpload,
  removeImage,
  removeAllImages,
  setGambarUtama,
  updateCaption,
}: GalleryTabProps) {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editCaption, setEditCaption] = useState<string>("");

  const openCaptionDialog = (index: number, currentCaption: string = "") => {
    setEditIndex(index);
    setEditCaption(currentCaption);
  };

  const saveCaption = () => {
    if (editIndex !== null) {
      updateCaption(editIndex, editCaption);
      setEditIndex(null);
    }
  };

  return (
    <TabsContent value="galeri">
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Label htmlFor="image-upload" className="text-base font-medium">Galeri Foto</Label>
              <Badge variant="secondary" className="h-5">Opsional</Badge>
            </div>
            {gambarKonten.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeAllImages}
                className="text-xs"
              >
                Hapus Semua Foto
              </Button>
            )}
          </div>
        </div>

        {/* Area input gambar */}
        <div className="max-w-md mx-auto">
          <div
            className={`relative w-full h-40 rounded-xl flex items-center justify-center transition-all cursor-pointer overflow-hidden
            ${isDragging
                ? "border-primary border-2 bg-muted"
                : "bg-muted/50 hover:bg-muted border border-dashed border-border"
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            {isSubmitting ? (
              <div className="w-full h-full rounded-xl bg-muted animate-pulse" />
            ) : (
              <div className="text-center p-4">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-1" />
                <p className="font-medium text-sm">
                  Tarik & Lepas Foto
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  atau klik untuk pilih file
                </p>
                <div className="mt-2 flex justify-center gap-2">
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    <ImagePlus className="h-3 w-3" /> File
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    <Camera className="h-3 w-3" /> Kamera
                  </Button>
                </div>
              </div>
            )}
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={isSubmitting}
            />
          </div>

          <div className="mt-2 text-center w-full">
            <div className="text-muted-foreground text-xs">
              <p>Format: JPG, PNG, GIF (Maks: 5MB/file)</p>
            </div>
          </div>
        </div>

        {/* Dialog untuk edit caption */}
        <Dialog>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Keterangan Foto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <Textarea
                placeholder="Masukkan keterangan foto"
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="min-h-24"
              />
            </div>
            <DialogFooter className="sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Batal
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="button" onClick={saveCaption}>
                  Simpan
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Grid foto yang sudah diupload */}
        {gambarKonten.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3 mt-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">
                Foto Terpilih ({gambarKonten.length})
              </h3>
            </div>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            >
              {gambarKonten.map((gambar, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <div className="aspect-square w-full rounded-xl overflow-hidden relative">
                    <div className="w-full h-full">
                      <Image
                        src={gambar.preview || "/placeholder-image.jpg"}
                        alt={gambar.caption || `Foto ${index + 1}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    {gambar.isUtama && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-yellow-500 hover:bg-yellow-600">
                          Foto Utama
                        </Badge>
                      </div>
                    )}
                    {gambar.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs">
                        {gambar.caption}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(index);
                            }}
                            className="rounded-full h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Hapus foto</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {!gambar.isUtama && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setGambarUtama(index);
                              }}
                              className="rounded-full h-8 w-8"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Jadikan foto utama</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCaptionDialog(index, gambar.caption);
                          }}
                          className="rounded-full h-8 w-8 bg-white"
                        >
                          <PenLine className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Keterangan Foto</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-3">
                          <div className="aspect-video w-full max-h-48 mb-4 relative rounded-lg overflow-hidden">
                            <Image
                              src={gambar.preview || "/placeholder-image.jpg"}
                              alt="Preview foto"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <Textarea
                            placeholder="Masukkan keterangan foto"
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            className="min-h-24"
                          />
                        </div>
                        <DialogFooter className="sm:justify-end">
                          <DialogClose asChild>
                            <Button type="button" variant="secondary">
                              Batal
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button type="button" onClick={saveCaption}>
                              Simpan
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </motion.div>
              ))}

              {/* Tombol untuk upload tambahan */}
              <div
                className="aspect-square w-full rounded-xl flex items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted border border-dashed border-border"
                onClick={() => document.getElementById('image-upload-more')?.click()}
              >
                <div className="text-center">
                  <ImagePlus className="h-8 w-8 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Tambah Foto
                  </p>
                </div>
                <Input
                  id="image-upload-more"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isSubmitting}
                />
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground p-6">
              <ImagePlus className="h-12 w-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Belum ada foto yang diunggah</p>
              <p className="text-xs mt-1">Unggah foto untuk menambahkan ke galeri konten</p>
            </div>
          </div>
        )}
      </div>
    </TabsContent>
  );
}