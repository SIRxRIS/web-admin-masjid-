// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/lib/utils/roles';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url: string;
  phone?: string;
  bio?: string;
  role?: UserRole;
  jabatan?: string;
  nama?: string;
  alamat?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchUserProfile = async (user: User): Promise<UserProfile | null> => {
    try {
      const baseProfile = mapUserToProfile(user);
      
      const { data: profileData, error } = await supabase
        .from('profile')
        .select('role, jabatan, nama, alamat, phone')
        .eq('userId', user.id)
        .single();
      
      if (error) {
        console.warn('Profile fetch error:', error.message);
        return baseProfile;
      }
      
      if (profileData) {
        return {
          ...baseProfile,
          role: profileData.role as UserRole,
          jabatan: profileData.jabatan,
          nama: profileData.nama,
          alamat: profileData.alamat,
          phone: profileData.phone,
        };
      }
      
      return baseProfile;
    } catch (error) {
      console.warn('Error fetching user profile (using base profile):', error);
      return mapUserToProfile(user);
    }
  };

  const refreshUserProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const profile = await fetchUserProfile(user);
      setUserProfile(profile);
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    // Timeout untuk mencegah loading terlalu lama
    const setLoadingTimeout = () => {
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('Auth loading timeout - forcing loading to false');
          setLoading(false);
        }
      }, 10000); // 10 detik timeout
    };
    
    const clearLoadingTimeout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    
    const getInitialUser = async () => {
      setLoadingTimeout();
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!isMounted) return;
        
        if (user && !error) {
          setUser(user);
          try {
            const profile = await fetchUserProfile(user);
            if (isMounted) {
              setUserProfile(profile);
            }
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
            if (isMounted) {
              setUserProfile(mapUserToProfile(user));
            }
          }
        } else if (error) {
          console.log('Auth error in useAuth:', error.message);
          if (isMounted) {
            setUser(null);
            setUserProfile(null);
          }
        } else {
          // No user, no error - user is not authenticated
          if (isMounted) {
            setUser(null);
            setUserProfile(null);
          }
        }
      } catch (error) {
        console.error('Error getting initial user:', error);
        if (isMounted) {
          setUser(null);
          setUserProfile(null);
        }
      } finally {
        clearLoadingTimeout();
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        try {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (user && !error && isMounted) {
              setUser(user);
              try {
                const profile = await fetchUserProfile(user);
                if (isMounted) {
                  setUserProfile(profile);
                }
              } catch (profileError) {
                console.error('Error fetching profile in auth change:', profileError);
                if (isMounted) {
                  setUserProfile(mapUserToProfile(user));
                }
              }
            } else {
              console.log('Error getting user after auth change:', error?.message);
              if (isMounted) {
                setUser(null);
                setUserProfile(null);
              }
            }
          } else if (event === 'SIGNED_OUT') {
            if (isMounted) {
              setUser(null);
              setUserProfile(null);
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          if (isMounted) {
            setUser(null);
            setUserProfile(null);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      clearLoadingTimeout();
      subscription.unsubscribe();
    };
  }, []);

  const mapUserToProfile = (user: User): UserProfile => {
    // For Google OAuth users
    if (user.app_metadata?.provider === 'google') {
      return {
        id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.given_name || '',
        last_name: user.user_metadata?.family_name || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '/images/profile.png',
        phone: user.user_metadata?.phone || '',
        bio: ''
      };
    }
    
    // For manual signup users
    return {
      id: user.id,
      email: user.email || '',
      first_name: user.user_metadata?.first_name || '',
      last_name: user.user_metadata?.last_name || '',
      full_name: user.user_metadata?.full_name || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim(),
      avatar_url: '/images/profile.png',
      phone: user.user_metadata?.phone || '',
      bio: user.user_metadata?.bio || ''
    };
  };

  const signOut = async () => {
    try {
      // Sign out from Supabase (local scope is enough for browser session)
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        console.error('Supabase signOut error:', error);
      }

      // Wait until Supabase confirms the session is gone to avoid race conditions
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      // Clear any additional local storage items that might persist
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (supabaseUrl) {
          try {
            const projectRef = new URL(supabaseUrl).host.split('.')[0];
            const cookieNames = [
              `sb-${projectRef}-auth-token`,
              `sb-${projectRef}-refresh-token`,
            ];
            const baseAttributes = `Max-Age=0; path=/; SameSite=Lax`;
            const secureAttribute = window.location.protocol === 'https:' ? '; Secure' : '';

            cookieNames.forEach((name) => {
              document.cookie = `${name}=; ${baseAttributes}${secureAttribute}`;
              document.cookie = `${name}=; ${baseAttributes}${secureAttribute}; domain=${window.location.hostname}`;
            });
          } catch (cookieError) {
            console.warn('Failed to derive Supabase cookie names for cleanup:', cookieError);
          }
        }

        // Fallback: clear any other cookies by expiring them
        document.cookie.split(';').forEach((cookie) => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
          if (name) {
            document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
          }
        });
      }
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setUser(null);
      setUserProfile(null);
    }
  };

  return { user, userProfile, loading, signOut, refreshUserProfile };
};