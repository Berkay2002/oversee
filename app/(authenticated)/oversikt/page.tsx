import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OversiktPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Översikt</h1>
        <p className="text-muted-foreground">
          Dashboard with reports overview and statistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Reports</CardTitle>
            <CardDescription>All time reports count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Coming soon</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Repair Time</CardTitle>
            <CardDescription>Days taken on average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Coming soon</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maximum Time</CardTitle>
            <CardDescription>Longest repair duration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Coming soon</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
