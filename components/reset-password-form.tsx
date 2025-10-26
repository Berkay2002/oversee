"use client"

import { useActionState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
import { updatePassword } from "@/app/(auth)/actions"

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = useActionState(updatePassword, {
    error: undefined,
    success: undefined,
  })

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <FieldGroup>
              {state?.error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {state.error}
                </div>
              )}
              {state?.success && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
                  Password has been reset successfully! You can now{" "}
                  <Link href="/login" className="underline">
                    login
                  </Link>
                  .
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={isPending || state?.success}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  disabled={isPending || state?.success}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isPending || state?.success}>
                  {isPending ? "Resetting..." : "Reset password"}
                </Button>
                <FieldDescription className="text-center">
                  Remember your password?{" "}
                  <Link href="/login" className="underline">
                    Login
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
