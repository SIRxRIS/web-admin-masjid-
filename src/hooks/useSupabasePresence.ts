import { useEffect, useState, useRef } from 'react';
import { useAuth } from './useAuth';
import { createClient } from '@supabase/supabase-js';

export function useSupabasePresence() {
  const { user } = useAuth();
  const [onlineCount, setOnlineCount] = useState(0);
  const presenceChannelRef = useRef<any>(null);
  const supabaseRef = useRef<any>(null);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    if (!supabaseRef.current) {
      supabaseRef.current = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
    }

    const supabase = supabaseRef.current;
    const userId = user.id;

    const presenceChannel = supabase.channel(`online_users`, {
      config: {
        presence: { key: userId },
      },
    });

    presenceChannelRef.current = presenceChannel;

    const handleSync = () => {
      const state = presenceChannel.presenceState();
      const count = Object.keys(state).length;
      setOnlineCount(count);
      console.log(`Pengguna Online Saat Ini: ${count}`);
    };

    presenceChannel
      .on('presence', { event: 'sync' }, handleSync)
      .on('presence', { event: 'join' }, handleSync)
      .on('presence', { event: 'leave' }, handleSync)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            status: 'Online',
            user_id: userId,
            last_seen: new Date().toISOString(),
          });
        }
      });

    return () => {
      if (supabase && presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, [user?.id]);

  return onlineCount;
}
