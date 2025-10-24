'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/schemas/auth'

export type SignInState = {
  error?: string
  fields?: {
    email?: string[]
    password?: string[]
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  _prevState: SignInState | undefined,
  formData: FormData
): Promise<SignInState | undefined> {
  const supabase = await createClient()

  // Validate form data
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    // Extract field errors manually to avoid deprecated flatten/format
    const fieldErrors: SignInState['fields'] = {}
    const issues = validatedFields.error.issues

    for (const issue of issues) {
      const field = issue.path[0] as 'email' | 'password'
      if (field) {
        if (!fieldErrors[field]) {
          fieldErrors[field] = []
        }
        fieldErrors[field]!.push(issue.message)
      }
    }

    return {
      error: 'Ogiltiga inloggningsuppgifter',
      fields: fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  // Attempt to sign in
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: 'Fel e-postadress eller lösenord',
    }
  }

  // Revalidate and redirect
  revalidatePath('/', 'layout')
  redirect('/oversikt')
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return {
      error: 'Kunde inte logga ut',
    }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

/**
 * Get the current session
 */
export async function getSession() {
  const supabase = await createClient()

  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    return { session: null, error: error.message }
  }

  return { session, error: null }
}

/**
 * Get the current user
 */
export async function getUser() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    return { user: null, error: error.message }
  }

  return { user, error: null }
}
