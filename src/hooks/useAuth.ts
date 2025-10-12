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
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    // Safety timer: ensure loading ends even if Supabase hangs
    let loadingSafetyTimer: any = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 5000);
    
    // Get initial user (more secure than getSession)
    const getInitialUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user && !error && isMounted) {
          setUser(user);
          // Fetch profile in parallel to reduce loading time
          fetchUserProfile(user).then(profile => {
            if (isMounted) {
              setUserProfile(profile);
            }
          });
        } else if (error) {
          console.log('Auth error in useAuth:', error.message);
          // Don't immediately clear user state on auth errors
          // Let the middleware handle redirects
        }
      } catch (error) {
        console.error('Error getting initial user:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
          clearTimeout(loadingSafetyTimer);
        }
      }
    };

    getInitialUser();

    // Listen for auth changes - using getUser() for security
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (!isMounted) return;
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Use getUser() instead of session.user for security
          const { data: { user }, error } = await supabase.auth.getUser();
          if (user && !error && isMounted) {
            setUser(user);
            // Fetch profile asynchronously to avoid blocking
            fetchUserProfile(user).then(profile => {
              if (isMounted) {
                setUserProfile(profile);
              }
            });
          } else {
            console.log('Error getting user after auth change:', error?.message);
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
            setUserProfile(null);
          }
        }
        if (isMounted) {
          setLoading(false);
          clearTimeout(loadingSafetyTimer);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(loadingSafetyTimer);
    };
  }, []);

  const fetchUserProfile = async (user: User): Promise<UserProfile> => {
    const baseProfile = mapUserToProfile(user);
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const profilePromise = supabase
        .from('profile')
        .select('role, jabatan, nama')
        .eq('userId', user.id)
        .single();
      
      // Race between profile fetch and timeout
      const { data: profileData, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;
      
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
        };
      }
    } catch (error) {
      console.warn('Error fetching user profile (using base profile):', error);
    }
    
    return baseProfile;
  };

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
      // Clear local state immediately for better UX
      setUser(null);
      setUserProfile(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signOut error:', error);
        // Don't throw error, just log it since we already cleared local state
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      // Don't re-throw, let the component handle the redirect
    }
  };

  return {
    user,
    userProfile,
    loading,
    signOut
  };
};