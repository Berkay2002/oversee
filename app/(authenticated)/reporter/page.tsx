import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReporterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reporter</h1>
        <p className="text-muted-foreground">
          Manage reporter profiles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reporters</CardTitle>
          <CardDescription>Create and manage reporter profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Reporter management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
