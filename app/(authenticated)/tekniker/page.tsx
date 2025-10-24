import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TeknikerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tekniker</h1>
        <p className="text-muted-foreground">
          Manage technician profiles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Technicians</CardTitle>
          <CardDescription>Create and manage technician profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Technician management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
