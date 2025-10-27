'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ResetPasswordForm } from '@/components/reset-password-form'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const [verificationState, setVerificationState] = useState<
    'verifying' | 'verified' | 'error'
  >('verifying')
  const [errorMessage, setErrorMessage] = useState<string>()

  useEffect(() => {
    const verifyRecoveryToken = async () => {
      const code = searchParams.get('code')

      if (!code) {
        setVerificationState('error')
        setErrorMessage('No recovery code provided. Please check your email and use the link provided.')
        return
      }

      const supabase = createClient()

      // Verify the recovery token and establish a session
      const { error } = await supabase.auth.verifyOtp({
        token_hash: code,
        type: 'recovery',
      })

      if (error) {
        setVerificationState('error')
        if (error.message.includes('expired')) {
          setErrorMessage('This password reset link has expired. Please request a new one.')
        } else if (error.message.includes('invalid')) {
          setErrorMessage('This password reset link is invalid. Please request a new one.')
        } else {
          setErrorMessage('Could not verify password reset link. Please try again or request a new one.')
        }
        return
      }

      // Successfully verified - user now has a session
      setVerificationState('verified')
    }

    verifyRecoveryToken()
  }, [searchParams])

  return (
    <div className="mx-auto max-w-sm">
      {verificationState === 'verifying' && (
        <div className="rounded-md bg-muted p-6 text-center">
          <div className="mb-2 text-sm font-medium">Verifying reset link...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      )}

      {verificationState === 'error' && (
        <div className="rounded-md bg-destructive/15 p-6">
          <div className="mb-2 text-sm font-medium text-destructive">
            Password Reset Error
          </div>
          <div className="text-sm text-destructive">{errorMessage}</div>
          <a
            href="/forgot-password"
            className="mt-4 inline-block text-sm underline"
          >
            Request a new password reset link
          </a>
        </div>
      )}

      {verificationState === 'verified' && <ResetPasswordForm />}
    </div>
  )
}
