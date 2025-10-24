'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { signIn } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Loggar in...' : 'Logga in'}
    </Button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useFormState(signIn, undefined)

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Verkstads Insikt</CardTitle>
        <CardDescription>
          Logga in med din e-postadress och lösenord
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-postadress</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="namn@exempel.se"
              required
              autoComplete="email"
              autoFocus
            />
            {state?.fields?.email && (
              <p className="text-sm text-destructive">{state.fields.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Lösenord</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            {state?.fields?.password && (
              <p className="text-sm text-destructive">
                {state.fields.password[0]}
              </p>
            )}
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
