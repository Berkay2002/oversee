'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sendJoinRequest } from '@/lib/org/actions'

export default function OnboardingPage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950">
      <div className="w-full max-w-2xl space-y-8 p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome!</h1>
          <p className="text-gray-500 dark:text-gray-400">
            You&#39;re almost ready to get started. Please choose an option below.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Organization</CardTitle>
              <CardDescription>
                Set up a new workspace for you and your team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/create-organization">Create Organization</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join an Existing Organization</CardTitle>
              <CardDescription>
                Request to join an organization that you&#39;ve been invited to.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <p className="text-sm text-gray-500">
                  Your request has been sent. An administrator will review it shortly.
                </p>
              ) : (
                <form
                  action={async (formData) => {
                    const orgId = formData.get('orgId') as string
                    if (orgId) {
                      await sendJoinRequest(orgId)
                      setSubmitted(true)
                    }
                  }}
                  className="space-y-4"
                >
                  <Input name="orgId" placeholder="Enter Organization ID" required />
                  <Button type="submit" className="w-full">
                    Send Join Request
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
