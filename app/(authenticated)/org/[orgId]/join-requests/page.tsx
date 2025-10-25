import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getJoinRequests } from '@/lib/org/server'
import { manageJoinRequest } from '@/lib/org/actions'

export default async function JoinRequestsPage({ params }: { params: { orgId: string } }) {
  const requests = await getJoinRequests(params.orgId)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Join Requests</h1>
      <div className="grid grid-cols-1 gap-4">
        {requests.map((request: { id: string; user_name: string }) => (
          <Card key={request.id}>
            <CardHeader>
              <CardTitle>{request.user_name}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-end space-x-4">
              <form
                action={async () => {
                  'use server'
                  await manageJoinRequest(request.id, 'accept')
                }}
              >
                <Button type="submit">Accept</Button>
              </form>
              <form
                action={async () => {
                  'use server'
                  await manageJoinRequest(request.id, 'reject')
                }}
              >
                <Button type="submit" variant="destructive">
                  Reject
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
