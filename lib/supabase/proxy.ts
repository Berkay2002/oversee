import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const pathname = request.nextUrl.pathname;

    // Check for organization-scoped routes
    const orgMatch = pathname.match(/^\/org\/([^/]+)/);

    if (orgMatch) {
      const orgId = orgMatch[1];

      // Validate user is a member of this organization
      const { data: membership, error: memberError } = await supabase
        .from('organization_members')
        .select('org_id')
        .eq('org_id', orgId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !membership) {
        // User is not a member, redirect to root (will pick a valid org)
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }

      // Set the active org cookie
      supabaseResponse.cookies.set('activeOrgId', orgId, {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    // Check for legacy routes (redirect to org-scoped)
    if (
      pathname.startsWith('/oversikt') ||
      pathname.startsWith('/alla-rapporter') ||
      pathname.startsWith('/kategorier') ||
      pathname.startsWith('/tekniker') ||
      pathname.startsWith('/reporter') ||
      pathname.startsWith('/ny-rapport')
    ) {
      // Get active org from cookie or profile
      let activeOrgId = request.cookies.get('activeOrgId')?.value;

      if (!activeOrgId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('default_org_id')
          .eq('user_id', user.id)
          .single();

        activeOrgId = profile?.default_org_id || null;
      }

      if (activeOrgId) {
        const url = request.nextUrl.clone();
        url.pathname = `/org/${activeOrgId}${pathname}`;
        return NextResponse.redirect(url);
      }
    }

    // Handle root path redirect
    if (pathname === '/' || pathname === '') {
      let activeOrgId = request.cookies.get('activeOrgId')?.value;

      if (!activeOrgId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('default_org_id')
          .eq('user_id', user.id)
          .single();

        activeOrgId = profile?.default_org_id || null;
      }

      if (activeOrgId) {
        const url = request.nextUrl.clone();
        url.pathname = `/org/${activeOrgId}/oversikt`;
        return NextResponse.redirect(url);
      } else {
        // No org found, redirect to create organization
        const url = request.nextUrl.clone();
        url.pathname = '/create-organization';
        return NextResponse.redirect(url);
      }
    }

    // Check admin-only routes
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (
      pathname.startsWith('/anvandare') &&
      profile?.role !== 'admin'
    ) {
      // Redirect to user's active org instead
      let activeOrgId = request.cookies.get('activeOrgId')?.value;

      if (!activeOrgId) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('default_org_id')
          .eq('user_id', user.id)
          .single();

        activeOrgId = userProfile?.default_org_id || null;
      }

      const url = request.nextUrl.clone();
      url.pathname = activeOrgId ? `/org/${activeOrgId}/oversikt` : '/';
      return NextResponse.redirect(url);
    }
  }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/error')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
