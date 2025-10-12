// src/components/content/form/content-form/form-tabs/advanced-tab.tsx
"use client";

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { X, Plus, AlertTriangle } from "lucide-react";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ContentFormValues } from "@/lib/schema/konten/schema";
import { type DonaturData, type KotakAmalData } from "@/lib/schema/pemasukan/schema";

// Local type definition for TagKontenData to avoid server-side imports
type TagKontenData = {
  id: number;
  nama: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};
import { getDonaturData } from "@/actions/donatur";
import { getKotakAmalData } from "@/actions/kotak-amal";
import { getTagKonten, createTagKonten } from "@/actions/content";

interface AdvancedTabProps {
  form: UseFormReturn<ContentFormValues>;
  isSubmitting: boolean;
}

export function AdvancedTab({ form, isSubmitting }: AdvancedTabProps) {
  const [inputTag, setInputTag] = useState<string>("");
  const [donaturList, setDonaturList] = useState<Array<{id: number, nama: string}>>([]);
  const [kotakAmalList, setKotakAmalList] = useState<Array<{id: number, nama: string}>>([]);
  const [availableTags, setAvailableTags] = useState<Array<{id: number, nama: string}>>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch donatur, kotak amal, and tag data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        // Fetch donatur data
        const donaturResult = await getDonaturData();
        if (donaturResult.success && donaturResult.data) {
          setDonaturList(donaturResult.data.map((d: DonaturData) => ({ id: d.id, nama: d.nama })));
        } else {
          console.error('Error fetching donatur data:', donaturResult.error);
        }

        // Fetch kotak amal data
        const kotakAmalResult = await getKotakAmalData();
        if (kotakAmalResult.success && kotakAmalResult.data) {
          setKotakAmalList(kotakAmalResult.data.map((k: KotakAmalData) => ({ id: k.id, nama: k.nama })));
        } else {
          console.error('Error fetching kotak amal data:', kotakAmalResult.error);
        }

        // Fetch tags
        const tagData = await getTagKonten();
        setAvailableTags(tagData.map((t: TagKontenData) => ({ id: t.id, nama: t.nama })));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const addTag = async () => {
    const cleanTag = inputTag.trim();
    const currentTags = form.getValues().tags || [];

    if (!cleanTag) return;

    // Check if tag already exists
    const existingTag = availableTags.find(tag => 
      tag.nama.toLowerCase() === cleanTag.toLowerCase()
    );

    if (existingTag) {
      // Use existing tag
      if (!currentTags.includes(existingTag.id)) {
        form.setValue("tags", [...currentTags, existingTag.id]);
        setInputTag("");
      }
    } else {
      // Create new tag
      try {
        const newTag = await createTagKonten({
          nama: cleanTag,
          slug: cleanTag.toLowerCase().replace(/\s+/g, '-')
        });
        
        if (newTag) {
          // Add to available tags
          setAvailableTags(prev => [...prev, { id: newTag.id, nama: newTag.nama }]);
          // Add to form
          form.setValue("tags", [...currentTags, newTag.id]);
          setInputTag("");
        }
      } catch (error) {
        console.error("Error creating tag:", error);
      }
    }
  };

  const removeTag = (tagId: number) => {
    const currentTags = form.getValues().tags || [];
    form.setValue("tags", currentTags.filter(tag => tag !== tagId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const selectExistingTag = (tagId: number) => {
    const currentTags = form.getValues().tags || [];
    if (!currentTags.includes(tagId)) {
      form.setValue("tags", [...currentTags, tagId]);
    }
  };

  // Watch tags with fallback to empty array
  const watchedTags = form.watch("tags") || [];

  return (
    <TabsContent value="lanjutan" className="space-y-6">
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Status Publikasi</CardTitle>
          <CardDescription>
            Atur visibilitas dan status publikasi konten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status Konten</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full sm:w-1/3 border-gray-300 dark:border-gray-700">
                      <SelectValue placeholder="Pilih status konten" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DRAFT">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Draft</Badge>
                        <span>Konten disimpan sebagai draft</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="PUBLISHED">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Dipublikasikan</Badge>
                        <span>Konten dipublikasikan</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="REVIEWED">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Dilihat</Badge>
                        <span>Konten telah dilihat</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ARCHIVED">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Diarsipkan</Badge>
                        <span>Konten diarsipkan</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Draft: hanya admin yang dapat melihat. Dipublikasikan: terlihat oleh semua pengunjung. Dilihat: telah dilihat oleh pengunjung website. Diarsipkan: tidak ditampilkan di website.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tag Konten</CardTitle>
          <CardDescription>
            Tambahkan tag untuk memudahkan pengunjung menemukan konten terkait
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {watchedTags.length > 0 ? (
              watchedTags.map((tagId, index) => {
                const tag = availableTags.find(t => t.id === tagId);
                return (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1.5"
                  >
                    {tag?.nama || `Tag #${tagId}`}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full"
                      onClick={() => removeTag(tagId)}
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })
            ) : (
              <div className="text-sm text-muted-foreground">Belum ada tag yang ditambahkan</div>
            )}
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Masukkan nama tag (akan dibuat otomatis jika belum ada)"
                value={inputTag}
                onChange={(e) => setInputTag(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting}
                className="border-gray-300 dark:border-gray-700"
              />
            </div>
            <Button
              type="button"
              onClick={addTag}
              disabled={!inputTag.trim() || isSubmitting}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Tag tersedia:</h4>
            <div className="flex flex-wrap gap-2">
              {isLoadingData ? (
                <div className="text-sm text-muted-foreground">Memuat tag...</div>
              ) : availableTags.length > 0 ? (
                availableTags.slice(0, 10).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => selectExistingTag(tag.id)}
                  >
                    {tag.nama}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">Belum ada tag tersedia</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrasi dengan Donatur dan KotakAmal */}
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Integrasi Data</CardTitle>
          <CardDescription>
            Hubungkan konten dengan data donatur atau kotak amal (opsional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="donaturId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Donatur Terkait</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(val ? parseInt(val) : undefined)}
                    value={field.value?.toString() || ""}
                    disabled={isSubmitting || isLoadingData}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300 dark:border-gray-700">
                        <SelectValue placeholder={isLoadingData ? "Memuat..." : "Pilih donatur"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada donatur terkait</SelectItem>
                      {donaturList.map((donatur) => (
                        <SelectItem key={donatur.id} value={donatur.id.toString()}>
                          {donatur.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Hubungkan konten dengan data donatur (opsional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kotakAmalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kotak Amal Terkait</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(val ? parseInt(val) : undefined)}
                    value={field.value?.toString() || ""}
                    disabled={isSubmitting || isLoadingData}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300 dark:border-gray-700">
                        <SelectValue placeholder={isLoadingData ? "Memuat..." : "Pilih kotak amal"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada kotak amal terkait</SelectItem>
                      {kotakAmalList.map((kotakAmal) => (
                        <SelectItem key={kotakAmal.id} value={kotakAmal.id.toString()}>
                          {kotakAmal.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Hubungkan konten dengan data kotak amal (opsional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}