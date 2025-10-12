import { format, isValid } from "date-fns";
import { id } from "date-fns/locale";

export function safeFormatDate(dateValue: unknown, formatStr: string = "dd MMMM yyyy"): string {
  try {
    if (dateValue == null) {
      return "Tanggal tidak tersedia";
    }
    
    const date = dateValue instanceof Date 
      ? dateValue 
      : new Date(dateValue as string);
    
    if (!isValid(date)) {
      console.warn("Invalid date value:", dateValue);
      return "Format tanggal tidak valid";
    }
    
    return format(date, formatStr, { locale: id });
  } catch (error) {
    console.error("Error formatting date:", error, "Value:", dateValue);
    return "Error format tanggal";
  }
}

export function toValidDate(dateValue: unknown): Date | null {
  try {
    if (dateValue == null) return null;
    
    const date = dateValue instanceof Date 
      ? dateValue 
      : new Date(dateValue as string);
    
    return isValid(date) ? date : null;
  } catch (error) {
    console.error("Error converting to date:", error);
    return null;
  }
}