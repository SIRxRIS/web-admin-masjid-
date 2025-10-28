import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (user && !userError) {
        console.log('User authenticated successfully:', user.email)
        
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          const edgeFunctionUrl = `${supabaseUrl}/functions/v1/handle-signin-validation`
          
          if (!supabaseUrl || !anonKey) {
            console.error('Supabase configuration missing')
            await supabase.auth.signOut()
            return NextResponse.redirect(`${origin}/signin?error=auth_failed`)
          }

          const response = await fetch(edgeFunctionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${anonKey}`,
            },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
              fullName: user.user_metadata?.full_name || user.user_metadata?.name,
              provider: user.app_metadata?.provider,
            }),
          })

          if (!response.ok) {
            const result = await response.json().catch(() => ({}))
            console.error('Edge function validation failed:', response.status, result)
            await supabase.auth.signOut()
            
            if (result.error === 'not_whitelisted') {
              return NextResponse.redirect(`${origin}/signin?error=not_whitelisted`)
            }
            return NextResponse.redirect(`${origin}/signin?error=auth_failed`)
          }

          const result = await response.json()

          const redirectPath = result.redirectPath || '/'
          const forwardedHost = request.headers.get('x-forwarded-host')
          const isLocalEnv = process.env.NODE_ENV === 'development'
          
          if (isLocalEnv) {
            return NextResponse.redirect(`${origin}${redirectPath}`)
          } else if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
          } else {
            return NextResponse.redirect(`${origin}${redirectPath}`)
          }
        } catch (error) {
          console.error('Error calling signin validation edge function:', error)
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/signin?error=auth_failed`)
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

  console.error('No authorization code provided')
  return NextResponse.redirect(`${origin}/signin?error=no_code`)
}