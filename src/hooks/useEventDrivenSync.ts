// src/hooks/useEventDrivenSync.ts
"use client";

import { useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

interface EventDrivenSyncOptions {
  onDataChange?: () => Promise<void>;
  syncInterval?: number; // in milliseconds
  enableAutoSync?: boolean;
}

export function useEventDrivenSync({
  onDataChange,
  syncInterval = 30000, // 30 seconds default
  enableAutoSync = false,
}: EventDrivenSyncOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  // Manual sync function
  const triggerSync = useCallback(async () => {
    if (!onDataChange || !isActiveRef.current) return;

    try {
      await onDataChange();
      console.log("Event-driven sync completed successfully");
    } catch (error) {
      console.error("Event-driven sync failed:", error);
      toast.error("Gagal melakukan sinkronisasi data");
    }
  }, [onDataChange]);

  // Auto sync setup
  useEffect(() => {
    if (!enableAutoSync || !onDataChange) return;

    intervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        triggerSync();
      }
    }, syncInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enableAutoSync, onDataChange, syncInterval, triggerSync]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Listen for visibility changes to pause/resume sync
  useEffect(() => {
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
      
      if (!document.hidden && enableAutoSync) {
        // Trigger sync when page becomes visible again
        triggerSync();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enableAutoSync, triggerSync]);

  // Listen for focus events to trigger sync
  useEffect(() => {
    const handleFocus = () => {
      if (enableAutoSync) {
        triggerSync();
      }
    };

    window.addEventListener("focus", handleFocus);
    
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [enableAutoSync, triggerSync]);

  return {
    triggerSync,
    isActive: isActiveRef.current,
  };
}