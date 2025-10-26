'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { manageJoinRequest } from '@/lib/org/actions'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

type JoinRequest = {
  id: string
  user_name: string
  user_id: string
}

export default function JoinRequestsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRequests() {
      const supabase = createClient()
      
      // First, get all pending join requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('organization_join_requests')
        .select('id, user_id')
        .eq('org_id', orgId)
        .eq('status', 'pending')

      if (requestsError) {
        console.error('Error fetching join requests:', requestsError)
        toast.error('Failed to load join requests')
        setIsLoading(false)
        return
      }

      if (!requestsData || requestsData.length === 0) {
        setRequests([])
        setIsLoading(false)
        return
      }

      // Get user IDs
      const userIds = requestsData.map(r => r.user_id)

      // Fetch user names from profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds)

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
      }

      // Create a map of user_id to name
      const userNameMap = new Map(
        profiles?.map(p => [p.user_id, p.name]) || []
      )

      // Combine the data
      const combinedData = requestsData.map(r => ({
        id: r.id,
        user_id: r.user_id,
        user_name: userNameMap.get(r.user_id) || 'Unknown User',
      }))

      setRequests(combinedData)
      setIsLoading(false)
    }

    fetchRequests()
  }, [orgId])

  const handleAction = async (requestId: string, action: 'accept' | 'reject') => {
    setProcessingId(requestId)
    
    const result = await manageJoinRequest(requestId, action)
    
    if (result.success) {
      toast.success(
        action === 'accept' 
          ? 'User added to organization successfully!' 
          : 'Join request rejected'
      )
      // Remove the request from the list
      setRequests(prev => prev.filter(r => r.id !== requestId))
    } else {
      toast.error(result.error || `Failed to ${action} request`)
    }
    
    setProcessingId(null)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 py-6 px-4 md:py-8 md:px-0">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Join Requests</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Hantera förfrågningar att gå med i organisationen
        </p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Inga väntande förfrågningar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl">{request.user_name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4">
                <Button
                  onClick={() => handleAction(request.id, 'accept')}
                  disabled={processingId === request.id}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {processingId === request.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Accepterar...
                    </>
                  ) : (
                    'Acceptera'
                  )}
                </Button>
                <Button
                  onClick={() => handleAction(request.id, 'reject')}
                  variant="destructive"
                  disabled={processingId === request.id}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {processingId === request.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Avvisar...
                    </>
                  ) : (
                    'Avvisa'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
