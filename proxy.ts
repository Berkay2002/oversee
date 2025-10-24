import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/proxy'

/**
 * Proxy function for authentication (replaces middleware in Next.js 16)
 * IMPORTANT: Uses nodejs runtime (edge runtime NOT supported in proxy)
 */
export async function proxy(request: NextRequest) {
  const { supabase, response } = await createClient(request)

  // Get current session
  const { data: { session } } = await supabase.auth.getSession()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/sign-in')
  const isPublicPath = request.nextUrl.pathname === '/' ||
                       request.nextUrl.pathname.startsWith('/_next') ||
                       request.nextUrl.pathname.startsWith('/api/auth')

  // Redirect unauthenticated users to login (except for public paths)
  if (!session && !isAuthPage && !isPublicPath) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from login page to dashboard
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/oversikt', request.url))
  }

  // Return the response with updated cookies
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
