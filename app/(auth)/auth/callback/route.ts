import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()

    // Verify the token and create a session
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // Successfully authenticated - redirect to the intended destination
      return NextResponse.redirect(`${origin}${next}`)
    }

    // If there was an error, redirect to error page
    return NextResponse.redirect(`${origin}/login?error=Could not verify token`)
  }

  // If no token, just redirect to next or home
  return NextResponse.redirect(`${origin}${next}`)
}
