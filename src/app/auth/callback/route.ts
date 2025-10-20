// src/app/auth/callback/route.ts
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkEmailWhitelist } from '@/actions/email-white-list'
import { createProfileAdmin, getProfileByUserIdAdmin } from '@/lib/services/supabase/profile/profile'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Verify the user is authenticated using getUser() for security
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (user && !userError) {
        console.log('User authenticated successfully:', user.email)
        
        // Check if user is in whitelist
        try {
          const whitelistEntry = await checkEmailWhitelist(user.email!);
          
          if (!whitelistEntry) {
            console.error('User not in whitelist or inactive:', user.email);
            // Sign out the user since they're not whitelisted or inactive
            await supabase.auth.signOut();
            return NextResponse.redirect(`${origin}/signin?error=not_whitelisted`);
          }
          
          console.log('User is whitelisted and active:', user.email);
          
          // Check if user has a profile, if not create one automatically
          try {
            let existingProfile = await getProfileByUserIdAdmin(user.id);
            
            if (!existingProfile) {
              console.log('Creating profile for new user:', user.email);
              
              // Create profile with data from whitelist entry and user
              // Map role to jabatan
              const getJabatanFromRole = (role: string) => {
                switch (role) {
                  case 'ADMIN': return 'DEVELOPER';
                  case 'KETUA': return 'KETUA';
                  case 'SEKRETARIS': return 'SEKRETARIS';
                  case 'BENDAHARA': return 'BENDAHARA';
                  case 'HUMAS_MEDIA': return 'HUMAS';
                  case 'REMAS_ADMIN': return 'REMAS';
                  case 'MAJLIS_TALIM_ADMIN': return 'MAJLIS_TALIM';
                  default: return 'PENGURUS';
                }
              };
              
              const profileData = {
                userId: user.id,
                nama: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split('@')[0],
                jabatan: getJabatanFromRole(whitelistEntry.role) as any,
                role: whitelistEntry.role as any,
                is_profile_complete: false
              };
              
              await createProfileAdmin(profileData);
              console.log('Profile created successfully for:', user.email);
            } else {
              console.log('Profile already exists for:', user.email);
            }
          } catch (profileError) {
            console.error('Error handling profile creation:', profileError);
            // Don't block login if profile creation fails, just log the error
          }
          
          // Determine redirect URL based on user role
          let redirectPath = '/'; // Default to main dashboard
          
          // Redirect ADMIN and management roles to admin dashboard
          const adminRoles = ['ADMIN'];
          const managementRoles = ['KETUA', 'SEKRETARIS', 'BENDAHARA', 'HUMAS_MEDIA', 'REMAS_ADMIN', 'MAJLIS_TALIM_ADMIN'];
          
          if (adminRoles.includes(whitelistEntry.role) || managementRoles.includes(whitelistEntry.role)) {
            redirectPath = '/admin';
          }
          
          const forwardedHost = request.headers.get('x-forwarded-host')
          const isLocalEnv = process.env.NODE_ENV === 'development'
          
          if (isLocalEnv) {
            return NextResponse.redirect(`${origin}${redirectPath}`)
          } else if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
          } else {
            return NextResponse.redirect(`${origin}${redirectPath}`)
          }
        } catch (whitelistError) {
          console.error('Error checking whitelist:', whitelistError);
          // Sign out the user on whitelist check error
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/signin?error=not_whitelisted`);
        }
      } else {
        console.error('User verification failed after code exchange:', userError?.message)
        return NextResponse.redirect(`${origin}/signin?error=auth_failed`)
      }
    } else {
      console.error('Code exchange failed:', error.message)
      return NextResponse.redirect(`${origin}/signin?error=code_exchange_failed`)
    }
  }

  // Jika tidak ada code, redirect ke halaman login
  console.error('No authorization code provided')
  return NextResponse.redirect(`${origin}/signin?error=no_code`)
}