import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function KategorierPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kategorier</h1>
        <p className="text-muted-foreground">
          Manage report categories
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Create and manage problem categories</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Category management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
