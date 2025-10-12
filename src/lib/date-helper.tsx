// src/lib/date-helper.tsx
import { format, isValid, parse } from "date-fns";
import { id } from "date-fns/locale";

export function safeFormatDate(dateValue: unknown, formatStr: string = "dd MMMM yyyy"): string {
  try {
    if (dateValue == null) {
      return "Tanggal tidak tersedia";
    }
    
    let date: Date;
    
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'string') {
      if (dateValue.includes('T') || dateValue.includes(' ') && dateValue.includes(':')) {
        const tempDate = new Date(dateValue);
        date = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate());
      } else if (dateValue.includes('-')) {
        const parts = dateValue.split('-');
        if (parts.length === 3) {
          date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
          date = new Date(dateValue);
        }
      } else {
        date = new Date(dateValue);
      }
    } else {
      date = new Date(dateValue as any);
    }
    
    if (!isValid(date)) {
      console.warn("Nilai tanggal tidak valid:", dateValue);
      return "Format tanggal tidak valid";
    }
    
    return format(date, formatStr, { locale: id });
  } catch (error) {
    console.error("Error memformat tanggal:", error, "Nilai:", dateValue);
    return "Error format tanggal";
  }
}

/**
 * Mengkonversi nilai tanggal ke objek Date yang valid
 * @param dateValue nilai tanggal dalam berbagai format
 * @returns objek Date atau null jika tidak valid
 */
export function toValidDate(dateValue: unknown): Date | null {
  try {
    if (dateValue == null) return null;
    
    if (typeof dateValue === 'string' && dateValue.includes('-')) {
      const parts = dateValue.split('-');
      if (parts.length === 3) {
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return isValid(date) ? date : null;
      }
    }
    
    const date = dateValue instanceof Date 
      ? dateValue 
      : new Date(dateValue as string);
    
    return isValid(date) ? date : null;
  } catch (error) {
    console.error("Error mengkonversi ke tanggal:", error);
    return null;
  }
}