"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseSupabaseRealtimeOptions {
  table: string;
  filter?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void;
  enabled?: boolean;
}

interface UseSupabaseRealtimeReturn {
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

export function useSupabaseRealtime({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseSupabaseRealtimeOptions): UseSupabaseRealtimeReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  const reconnect = useCallback(() => {
    if (channelRef.current) {
      // Pastikan channel dibersihkan sebelum re-subscribe
      try {
        channelRef.current.unsubscribe();
      } catch {}
      channelRef.current = null;
    }
    setError(null);
    setIsConnected(false);
    
    // Trigger re-subscription
    setTimeout(() => {
      if (enabled) {
        setupSubscription();
      }
    }, 1000);
  }, [enabled]);

  const setupSubscription = useCallback(() => {
    if (!enabled) return;
    // Hindari subscribe ganda pada instance channel yang sama
    if (channelRef.current) {
      return;
    }

    try {
      const supabase = supabaseRef.current;
      
      // Create channel with unique name
      const channelName = `realtime-${table}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const channel = supabase.channel(channelName);

      // Configure postgres changes subscription
      let subscription = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          ...(filter && { filter }),
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log(`Realtime event on ${table}:`, payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload);
              break;
            case 'UPDATE':
              onUpdate?.(payload);
              break;
            case 'DELETE':
              onDelete?.(payload);
              break;
          }
        }
      );

      // Subscribe and handle connection status
      channel
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${table}:`, status);
          
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            setError(null);
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false);
            setError('Failed to connect to realtime channel');
          } else if (status === 'TIMED_OUT') {
            setIsConnected(false);
            setError('Realtime connection timed out');
          }
        });

      channelRef.current = channel;
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsConnected(false);
    }
  }, [table, filter, onInsert, onUpdate, onDelete, enabled]);

  // Setup subscription on mount and when dependencies change
  useEffect(() => {
    if (enabled) {
      setupSubscription();
    }

    return () => {
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
        } catch {}
        channelRef.current = null;
      }
    };
  }, [setupSubscription]);

  // Handle visibility change to reconnect when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && enabled && !isConnected) {
        reconnect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, isConnected, reconnect]);

  return {
    isConnected,
    error,
    reconnect,
  };
}

// Hook khusus untuk monitoring pemasukan
export function usePemasukanRealtime(
  onDataChange: () => void,
  enabled: boolean = true
) {
  const handleChange = useCallback(() => {
    console.log('Pemasukan data changed, triggering update...');
    onDataChange();
  }, [onDataChange]);

  // Monitor multiple tables yang mempengaruhi pemasukan
  const donaturRealtime = useSupabaseRealtime({
    table: 'Donatur',
    onInsert: handleChange,
    onUpdate: handleChange,
    onDelete: handleChange,
    enabled,
  });

  const kotakAmalRealtime = useSupabaseRealtime({
    table: 'KotakAmal',
    onInsert: handleChange,
    onUpdate: handleChange,
    onDelete: handleChange,
    enabled,
  });

  const kotakAmalMasjidRealtime = useSupabaseRealtime({
    table: 'KotakAmalMasjid',
    onInsert: handleChange,
    onUpdate: handleChange,
    onDelete: handleChange,
    enabled,
  });

  const donasiKhususRealtime = useSupabaseRealtime({
    table: 'DonasiKhusus',
    onInsert: handleChange,
    onUpdate: handleChange,
    onDelete: handleChange,
    enabled,
  });

  return {
    isConnected: donaturRealtime.isConnected || 
                 kotakAmalRealtime.isConnected || 
                 kotakAmalMasjidRealtime.isConnected || 
                 donasiKhususRealtime.isConnected,
    error: donaturRealtime.error || 
           kotakAmalRealtime.error || 
           kotakAmalMasjidRealtime.error || 
           donasiKhususRealtime.error,
    reconnect: () => {
      donaturRealtime.reconnect();
      kotakAmalRealtime.reconnect();
      kotakAmalMasjidRealtime.reconnect();
      donasiKhususRealtime.reconnect();
    },
  };
}

// Hook khusus untuk monitoring target pemasukan
export function useTargetPemasukanRealtime(
  onDataChange: () => void,
  enabled: boolean = true
) {
  const handleChange = useCallback(() => {
    console.log('Target pemasukan changed, triggering update...');
    onDataChange();
  }, [onDataChange]);

  return useSupabaseRealtime({
    table: 'target_pemasukan',
    onInsert: handleChange,
    onUpdate: handleChange,
    onDelete: handleChange,
    enabled,
  });
}

// Hook khusus untuk monitoring pengeluaran
export function usePengeluaranRealtime(
  onDataChange: () => void,
  enabled: boolean = true
) {
  const handleChange = useCallback(() => {
    console.log('Pengeluaran data changed, triggering update...');
    onDataChange();
  }, [onDataChange]);

  return useSupabaseRealtime({
    table: 'Pengeluaran',
    onInsert: handleChange,
    onUpdate: handleChange,
    onDelete: handleChange,
    enabled,
  });
}