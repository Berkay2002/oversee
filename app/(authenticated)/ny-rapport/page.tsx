import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NyRapportPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ny Rapport</h1>
        <p className="text-muted-foreground">
          Create a new workshop report
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Form</CardTitle>
          <CardDescription>Fill in the details below</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Form coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
