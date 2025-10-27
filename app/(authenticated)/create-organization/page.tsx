"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { signOut } from "@/app/(auth)/actions";
import { createOrganization } from "@/lib/org/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Loader2, LogOut } from "lucide-react";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!orgName.trim()) {
      setError("Organization name is required");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createOrganization(orgName.trim());

      if (result.success && result.orgId) {
        // Redirect to the new organization's overview page
        router.push(`/org/${result.orgId}/oversikt`);
      } else {
        setError(result.error || "Failed to create organization");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="flex min-h-screen flex-col p-4">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={handleLogout}
          className="gap-2"
          disabled={isLoading}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create Organization</CardTitle>
            <CardDescription>
              Set up your workspace to start managing reports
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  type="text"
                  placeholder="My Company"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Choose a name for your workspace. You can change this later.
                </p>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !orgName.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Organization"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
