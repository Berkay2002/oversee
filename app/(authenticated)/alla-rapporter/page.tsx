import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AllaRapporterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alla Rapporter</h1>
        <p className="text-muted-foreground">
          View and manage all workshop reports
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports Table</CardTitle>
          <CardDescription>Search, filter, and manage reports</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Reports list coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
