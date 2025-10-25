/* eslint-disable @typescript-eslint/no-unused-vars */
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/schemas/auth'

// Default redirect paths
const DEFAULT_LOGIN_REDIRECT = '/' // Will be handled by root page redirect logic
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

  // Revalidate and redirect to onboarding
  revalidatePath('/onboarding', 'layout')
  redirect('/onboarding')
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

  // If email confirmation is required, Supabase returns a user but no session
  // In this case, we can't automatically log them in.
  // Instead of redirecting, we'll show a success message.
  if (data.user && !data.session) {
    // This is the intended behavior when email confirmation is on.
    // To automatically log in, you would need to disable email confirmation in Supabase project settings.
    // For now, we will provide a clear message to the user.
    return {
      success: true,
      error:
        'Account created successfully! Please check your email to verify your account before logging in.',
    }
  }

  // Revalidate and redirect to onboarding
  revalidatePath('/onboarding', 'layout')
  redirect('/onboarding')
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
