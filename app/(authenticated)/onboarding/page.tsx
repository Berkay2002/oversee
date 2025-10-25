'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAllOrganizations, sendJoinRequest } from '@/lib/org/actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, UserPlus, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function OnboardingPage() {
  const [submitted, setSubmitted] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<string>('')
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrganizations() {
      const result = await getAllOrganizations()
      if (result.success && result.organizations) {
        setOrganizations(result.organizations)
      } else {
        setError(result.error || 'Failed to load organizations')
      }
      setIsLoading(false)
    }
    fetchOrganizations()
  }, [])

  const handleJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrg) return

    setIsSubmitting(true)
    setError(null)

    const result = await sendJoinRequest(selectedOrg)
    
    if (result.success) {
      setSubmitted(true)
    } else {
      setError(result.error || 'Failed to send join request')
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-2xl space-y-8 p-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome!</h1>
          <p className="text-muted-foreground">
            You&#39;re almost ready to get started. Please choose an option below.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Create a New Organization</CardTitle>
                </div>
              </div>
              <CardDescription className="text-muted-foreground">
                Set up a new workspace for you and your team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/create-organization">Create Organization</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50">
                  <UserPlus className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Join an Existing Organization</CardTitle>
                </div>
              </div>
              <CardDescription className="text-muted-foreground">
                Request to join an organization that you&#39;ve been invited to.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <Alert className="bg-primary/10 border-primary/20">
                  <AlertDescription className="text-sm text-foreground">
                    Your request has been sent. An administrator will review it shortly.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleJoinRequest} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : organizations.length > 0 ? (
                    <>
                      <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an organization" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={!selectedOrg || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending Request...
                          </>
                        ) : (
                          'Send Join Request'
                        )}
                      </Button>
                    </>
                  ) : (
                    <Alert>
                      <AlertDescription className="text-sm text-muted-foreground">
                        No organizations available. Create one to get started!
                      </AlertDescription>
                    </Alert>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
