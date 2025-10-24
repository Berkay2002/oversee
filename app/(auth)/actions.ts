'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/schemas/auth'

// Default redirect paths
const DEFAULT_LOGIN_REDIRECT = '/oversikt'
const DEFAULT_LOGOUT_REDIRECT = '/login'

export type SignInState = {
  error?: string
  fields?: {
    email?: string[]
    password?: string[]
  }
}

export type SignUpState = {
  error?: string
  success?: boolean
  fields?: {
    name?: string[]
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
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
  redirect(DEFAULT_LOGIN_REDIRECT)
}

/**
 * Sign up with email and password
 */
export async function signUp(
  _prevState: SignUpState | undefined,
  formData: FormData
): Promise<SignUpState | undefined> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const name = formData.get('name') as string

  // Basic validation
  const fields: SignUpState['fields'] = {}

  if (!name || name.trim().length < 2) {
    fields.name = ['Name must be at least 2 characters']
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fields.email = ['Please enter a valid email address']
  }

  if (!password || password.length < 8) {
    fields.password = ['Password must be at least 8 characters']
  }

  if (password !== confirmPassword) {
    fields.confirmPassword = ['Passwords do not match']
  }

  if (Object.keys(fields).length > 0) {
    return {
      error: 'Please fix the errors below',
      fields,
    }
  }

  // Attempt to sign up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  if (error) {
    return {
      error: error.message || 'Could not create account',
    }
  }

  // Check if email confirmation is required
  if (data.user && !data.session) {
    return {
      success: true,
      error: 'Please check your email to confirm your account',
    }
  }

  // Revalidate and redirect
  revalidatePath('/', 'layout')
  redirect(DEFAULT_LOGIN_REDIRECT)
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Sign out error:', error)
    // Even if there's an error, try to clear local state and redirect
  }

  revalidatePath('/', 'layout')
  redirect(DEFAULT_LOGOUT_REDIRECT)
}

/**
 * Get the current session
 * Returns the session object directly (null if not authenticated)
 */
export async function getSession() {
  const supabase = await createClient()

  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    return null
  }

  return session
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
