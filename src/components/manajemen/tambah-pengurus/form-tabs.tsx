"use client"

import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import  Image  from "next/image"
import { Upload, Trash2 } from "lucide-react"
import { ErrorMessage, FieldDescription } from "./form-components"
import { jabatanToNoMap } from "./pengurus-schema"
import type { UseFormReturn } from "react-hook-form"
import type { FormPengurusType } from "./pengurus-schema"

interface FormTabsProps {
  form: UseFormReturn<FormPengurusType>
  isSubmitting: boolean
}

export function FormDataTab({ form, isSubmitting }: FormTabsProps) {
  if (isSubmitting) {
    return (
      <TabsContent value="form" className="mt-4 sm:mt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </TabsContent>
    )
  }

  return (
    <TabsContent value="form" className="mt-4 sm:mt-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-base font-medium flex items-center gap-2">
                Nama Lengkap <Badge variant="destructive" className="h-5">Wajib</Badge>
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Masukkan nama lengkap pengurus" 
                  {...field} 
                  className="h-10 text-base bg-muted/50 focus:bg-background transition-colors" 
                />
              </FormControl>
              <ErrorMessage>
                {form.formState.errors.nama?.message}
              </ErrorMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jabatan"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-base font-medium flex items-center gap-2">
                Jabatan <Badge variant="destructive" className="h-5">Wajib</Badge>
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    form.setValue("no", jabatanToNoMap[value] || 0)
                  }}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="h-10 text-base bg-muted/50 focus:bg-background transition-colors">
                    <SelectValue placeholder="Pilih jabatan" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="max-h-72 overflow-y-auto">
                      {Object.entries(jabatanToNoMap).map(([jabatan, no]) => (
                        <SelectItem key={no} value={jabatan} className="text-base">
                          {jabatan}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </FormControl>
              <ErrorMessage>
                {form.formState.errors.jabatan?.message}
              </ErrorMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="periode"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-base font-medium flex items-center gap-2">
                Periode <Badge variant="destructive" className="h-5">Wajib</Badge>
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Contoh: 2023-2027" 
                  {...field} 
                  className="h-10 text-base bg-muted/50 focus:bg-background transition-colors" 
                />
              </FormControl>
              <ErrorMessage>
                {form.formState.errors.periode?.message}
              </ErrorMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="kategori"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-base font-medium flex items-center gap-2">
                Kategori <Badge variant="destructive" className="h-5">Wajib</Badge>
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="h-10 text-base bg-muted/50 focus:bg-background transition-colors">
                    <SelectValue placeholder="Pilih kategori pengurus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MASJID" className="text-base">
                      Pengurus Masjid
                    </SelectItem>
                    <SelectItem value="REMAS" className="text-base">
                      Pengurus Remas
                    </SelectItem>
                    <SelectItem value="MAJLIS_TALIM" className="text-base">
                      Pengurus Majlis Ta'lim
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <ErrorMessage>
                {form.formState.errors.kategori?.message}
              </ErrorMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="no"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-base font-medium flex items-center gap-2">
                Nomor Urut <Badge variant="secondary" className="h-5">Auto</Badge>
              </FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  readOnly 
                  {...field} 
                  value={field.value || 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="h-10 text-base bg-muted cursor-not-allowed" 
                />
              </FormControl>
              <FieldDescription className="text-xs text-muted-foreground mt-1">
                Terisi otomatis sesuai jabatan yang dipilih
              </FieldDescription>
            </FormItem>
          )}
        />
      </div>
    </TabsContent>
  )
}

export function FormFotoTab({ selectedFile, previewImage, isSubmitting, isDragging, handleDragOver, handleDragLeave, handleDrop, handleFileChange, removeImage }: {
  selectedFile: File | null;
  previewImage: string | null;
  isSubmitting: boolean;
  isDragging: boolean;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
}) {
  return (
    <TabsContent value="foto" className="mt-4 sm:mt-6">
      <div className="flex flex-col items-center space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-medium">Foto</h3>
          <Badge variant="secondary" className="h-5">Opsional</Badge>
        </div>
        
        <div 
          className={`relative w-full sm:w-64 h-64 rounded-xl flex items-center justify-center transition-all overflow-hidden cursor-pointer
            ${isDragging 
              ? 'bg-muted border-primary border-2' 
              : 'bg-muted/50 hover:bg-muted border border-dashed border-border'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('foto')?.click()}
        >
          {previewImage ? (
            <>
              <Image 
                src={previewImage} 
                alt="Preview" 
                fill 
                className="object-cover rounded-xl" 
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="rounded-full">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Hapus foto</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </>
          ) : isSubmitting ? (
            <div className="w-full h-full rounded-xl bg-muted animate-pulse" />
          ) : (
            <div className="text-center p-6">
              <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
              <p className="font-medium text-lg">
                Tarik & Lepas Foto
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                atau klik untuk memilih file
              </p>
            </div>
          )}
        </div>

        <Input 
          id="foto"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isSubmitting}
          className="hidden"
        />

        <div className="text-center w-full sm:w-auto">
          {selectedFile ? (
            <div className="flex flex-col sm:flex-row items-center gap-2 text-sm">
              <Badge variant="outline" className="w-full sm:w-auto px-3 py-1 break-all">
                {selectedFile.name}
              </Badge>
              <span className="text-muted-foreground">
                ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              <p className="mb-1">Format yang didukung: JPG, PNG, WEBP</p>
              <p>Ukuran maksimal: 5MB</p>
              <p className="mt-1 text-xs italic">*Anda dapat melewati bagian ini jika tidak ingin mengunggah foto</p>
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  );
}