import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export default async function middleware(request) {
  console.log('🚀 MIDDLEWARE EXECUTED FOR:', request.nextUrl.pathname)
  
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  // Define public routes that don't require authentication
  const publicRoutes = ['/signin', '/auth/callback']
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    console.log('🔒 User not authenticated, redirecting to /signin')
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // If user is authenticated, get their profile to check role
  if (user) {
    console.log('✅ User authenticated:', user.email)
    
    // Allow access to auth callback
    if (request.nextUrl.pathname === '/auth/callback') {
      return supabaseResponse
    }

    // Get user role for all authenticated routes
    const { data: whitelistUser } = await supabase
      .from('email_whitelist')
      .select('role, isActive')
      .eq('email', user.email)
      .single()

    if (!whitelistUser || !whitelistUser.isActive) {
      console.log('❌ User not in whitelist or inactive, signing out')
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/signin?error=unauthorized', request.url))
    }

    // If user is on signin page and authenticated, redirect based on role
    // Skip redirect if just signed out (signedOut=true) to avoid loop
    if (request.nextUrl.pathname === '/signin' && request.nextUrl.searchParams?.get('signedOut') !== 'true') {
      // Redirect based on role
      if (whitelistUser.role === 'ADMIN') {
        console.log('🔄 ADMIN user on signin, redirecting to /admin')
        return NextResponse.redirect(new URL('/admin', request.url))
      } else {
        console.log('🔄 Non-ADMIN user on signin, redirecting to root (admin group)')
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Redirect ADMIN users from root to /admin automatically
    if (request.nextUrl.pathname === '/' && whitelistUser.role === 'ADMIN') {
      console.log('🔄 ADMIN user accessing root, redirecting to /admin')
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Check access permissions for different routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      // Only ADMIN can access /admin routes
      if (whitelistUser.role !== 'ADMIN') {
        console.log('🚫 Non-ADMIN user trying to access /admin, redirecting to root')
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
    
    // For routes in (admin) group (accessed via root or other paths), check allowed roles
    const allowedRoles = ['ADMIN', 'KETUA', 'WAKIL_KETUA', 'SEKRETARIS', 'BENDAHARA']
    if (!allowedRoles.includes(whitelistUser.role)) {
      console.log('🚫 User does not have required role, redirecting to /signin')
      return NextResponse.redirect(new URL('/signin?error=insufficient_role', request.url))
    }

    console.log('✅ User authorized with role:', whitelistUser.role)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Kecualikan semua rute API agar tidak diintersep oleh middleware
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}