"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { updateEmail } from "@/app/(auth)/actions"
import type { User } from "@supabase/supabase-js"

export function UpdateEmailForm({
  user,
  className,
  ...props
}: React.ComponentProps<"div"> & { user: User }) {
  const [state, formAction, isPending] = useActionState(updateEmail, {
    error: undefined,
    success: undefined,
  })

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Update Email</CardTitle>
        <CardDescription>
          Enter a new email address for your account. A confirmation link will
          be sent to the new address.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent>
          <FieldGroup>
            {state?.error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {state.error}
              </div>
            )}
            {state?.success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
                {state.error}
              </div>
            )}
            <Field>
              <FieldLabel htmlFor="email">New Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                required
                disabled={isPending}
              />
              <FieldDescription>
                Your current email is {user.email}
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Update Email"}
          </Button>
        </CardFooter>
      </form>
    </Card>
    </div>
  )
}
