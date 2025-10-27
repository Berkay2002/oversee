// Server-side Supabase client for use in Server Components and Server Actions
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import type { Database } from '@/types/database'

export async function createClient() {
  // MUST await cookies() in Next.js 16
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Helper function to get the current user
export async function getUser() {
  const supabase = await createClient()
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function getUserProfile(userId?: string) {
  const supabase = await createClient()

  // If userId not provided, get it from current user
  let targetUserId = userId
  if (!targetUserId) {
    const user = await getUser()
    if (!user?.id) {
      return null
    }
    targetUserId = user.id
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single()
    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }
    return data
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}
