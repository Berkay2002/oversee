import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AnvandarePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Användare</h1>
          <p className="text-muted-foreground">
            Manage users and permissions
          </p>
        </div>
        <Badge variant="secondary">Admin Only</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Invite users and manage roles</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">User management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
