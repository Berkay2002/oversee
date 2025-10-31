'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { manageJoinRequest } from '@/lib/org/actions'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { UserPlus, CheckCircle2, XCircle, Mail, Clock } from 'lucide-react'

type JoinRequest = {
  id: string
  user_id: string
  user_name: string
  user_email: string
  created_at: string
}

// Utility function to format relative time in Swedish
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / 60000)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInWeeks = Math.floor(diffInDays / 7)
  const diffInMonths = Math.floor(diffInDays / 30)

  if (diffInMinutes < 1) return 'Just nu'
  if (diffInMinutes < 60) return `${diffInMinutes} minut${diffInMinutes === 1 ? '' : 'er'} sedan`
  if (diffInHours < 24) return `${diffInHours} timm${diffInHours === 1 ? 'e' : 'ar'} sedan`
  if (diffInDays < 7) return `${diffInDays} dag${diffInDays === 1 ? '' : 'ar'} sedan`
  if (diffInWeeks < 4) return `${diffInWeeks} veck${diffInWeeks === 1 ? 'a' : 'or'} sedan`
  if (diffInMonths < 12) return `${diffInMonths} månad${diffInMonths === 1 ? '' : 'er'} sedan`
  
  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} år sedan`
}

// Get initials from name for avatar fallback
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function JoinRequestsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<{ type: 'single' | 'batch', id?: string }>()

  useEffect(() => {
    async function fetchRequests() {
      const supabase = createClient()
      
      // Get all pending join requests with created_at
      const { data: requestsData, error: requestsError } = await supabase
        .from('organization_join_requests')
        .select('id, user_id, created_at')
        .eq('org_id', orgId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (requestsError) {
        console.error('Error fetching join requests:', requestsError)
        toast.error('Kunde inte ladda förfrågningar')
        setIsLoading(false)
        return
      }

      if (!requestsData || requestsData.length === 0) {
        setRequests([])
        setIsLoading(false)
        return
      }

      // Get user IDs (filter out null values)
      const userIds = requestsData.map(r => r.user_id).filter((id): id is string => id !== null)

      if (userIds.length === 0) {
        setRequests([])
        setIsLoading(false)
        return
      }

      // Fetch user details from profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds)

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
      }

      // Fetch emails from auth.users via RPC function
      const { data: users, error: usersError } = await supabase
        .rpc('get_users_emails', { user_ids: userIds })

      if (usersError) {
        console.error('Error fetching user emails:', usersError)
      }

      // Create a map of user_id to profile
      const userProfileMap = new Map(
        profiles?.map(p => [p.user_id, p]) || []
      )

      // Create a map of user_id to email
      const userEmailMap = new Map(
        (users as { id: string; email: string }[] | null)?.map(u => [u.id, u.email]) || []
      )

      // Combine the data - filter out requests with no user_id
      const combinedData = requestsData
        .filter(r => r.user_id !== null)
        .map(r => {
          const profile = userProfileMap.get(r.user_id!)
          const email = userEmailMap.get(r.user_id!)
          return {
            id: r.id,
            user_id: r.user_id!,
            user_name: profile?.name || 'Okänd användare',
            user_email: email || 'Ingen e-post',
            created_at: r.created_at || new Date().toISOString(),
          }
        })

      setRequests(combinedData)
      setIsLoading(false)
    }

    fetchRequests()
  }, [orgId])

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId)
    
    const result = await manageJoinRequest(requestId, 'accept')
    
    if (result.success) {
      toast.success('Användare tillagd i organisationen!')
      setRequests(prev => prev.filter(r => r.id !== requestId))
      setSelectedIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    } else {
      toast.error(result.error || 'Kunde inte acceptera förfrågan')
    }
    
    setProcessingId(null)
  }

  const handleReject = async (requestId?: string) => {
    const idsToReject = requestId ? [requestId] : Array.from(selectedIds)
    
    setProcessingId('batch')
    
    let successCount = 0
    let errorCount = 0

    for (const id of idsToReject) {
      const result = await manageJoinRequest(id, 'reject')
      if (result.success) {
        successCount++
      } else {
        errorCount++
      }
    }

    if (successCount > 0) {
      toast.success(
        successCount === 1 
          ? 'Förfrågan avvisad' 
          : `${successCount} förfrågningar avvisade`
      )
      setRequests(prev => prev.filter(r => !idsToReject.includes(r.id)))
      setSelectedIds(new Set())
    }

    if (errorCount > 0) {
      toast.error(`Kunde inte avvisa ${errorCount} förfrågan${errorCount === 1 ? '' : 'ar'}`)
    }
    
    setProcessingId(null)
    setRejectDialogOpen(false)
  }

  const openRejectDialog = (type: 'single' | 'batch', id?: string) => {
    setRejectTarget({ type, id })
    setRejectDialogOpen(true)
  }

  const confirmReject = () => {
    if (rejectTarget?.type === 'single' && rejectTarget.id) {
      handleReject(rejectTarget.id)
    } else {
      handleReject()
    }
  }

  const handleBatchAccept = async () => {
    const idsToAccept = Array.from(selectedIds)
    
    setProcessingId('batch')
    
    let successCount = 0
    let errorCount = 0

    for (const id of idsToAccept) {
      const result = await manageJoinRequest(id, 'accept')
      if (result.success) {
        successCount++
      } else {
        errorCount++
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} användare tillagda i organisationen!`)
      setRequests(prev => prev.filter(r => !idsToAccept.includes(r.id)))
      setSelectedIds(new Set())
    }

    if (errorCount > 0) {
      toast.error(`Kunde inte acceptera ${errorCount} förfrågan${errorCount === 1 ? '' : 'ar'}`)
    }
    
    setProcessingId(null)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === requests.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(requests.map(r => r.id)))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const hasSelected = selectedIds.size > 0
  const allSelected = requests.length > 0 && selectedIds.size === requests.length

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 py-6 px-4 md:py-8 md:px-0">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-2">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto space-y-6 py-6 px-4 md:py-8 md:px-0">
        {/* Header Card with Stats */}
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold md:text-3xl">Förfrågningar</CardTitle>
              <CardDescription>
                Hantera förfrågningar att gå med i organisationen
              </CardDescription>
            </div>
            {requests.length > 0 && (
              <Badge 
                variant="outline" 
                className="w-fit rounded-md border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary"
              >
                {requests.length} väntande
              </Badge>
            )}
          </CardHeader>
          
          {requests.length > 0 && (
            <CardFooter className="justify-between border-t border-border/60 bg-muted/20 px-6 py-4">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Välj alla förfrågningar"
                />
                <span className="text-sm text-muted-foreground">
                  {hasSelected ? `${selectedIds.size} valda` : 'Välj alla'}
                </span>
              </div>
              
              {hasSelected && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleBatchAccept}
                    disabled={processingId === 'batch'}
                    size="sm"
                    variant="default"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Acceptera valda
                  </Button>
                  <Button
                    onClick={() => openRejectDialog('batch')}
                    disabled={processingId === 'batch'}
                    size="sm"
                    variant="destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Avvisa valda
                  </Button>
                </div>
              )}
            </CardFooter>
          )}
        </Card>

        {/* Empty State */}
        {requests.length === 0 ? (
          <Empty className="border-border/60">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserPlus className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>Inga väntande förfrågningar</EmptyTitle>
              <EmptyDescription>
                Det finns inga förfrågningar att granska just nu. När användare begär att gå med i organisationen kommer de visas här.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          /* Request Cards */
          <div className="grid grid-cols-1 gap-4">
            {requests.map((request) => {
              const isSelected = selectedIds.has(request.id)
              const isProcessing = processingId === request.id || processingId === 'batch'
              
              return (
                <Card 
                  key={request.id}
                  className={`transition-colors hover:bg-accent/50 ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <CardContent className="">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(request.id)}
                          disabled={isProcessing}
                          aria-label={`Välj ${request.user_name}`}
                        />

                        <Avatar className="h-14 w-14 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(request.user_name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base">
                            {request.user_name}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4 shrink-0" />
                              <span className="truncate">{request.user_email}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Clock className="h-4 w-4" />
                              <span>{formatRelativeTime(request.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 sm:ml-auto sm:shrink-0">
                        <Button
                          onClick={() => handleAccept(request.id)}
                          disabled={isProcessing}
                          size="default"
                          className="flex-1 sm:flex-none"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Acceptera
                        </Button>
                        <Button
                          onClick={() => openRejectDialog('single', request.id)}
                          variant="destructive"
                          disabled={isProcessing}
                          size="default"
                          className="flex-1 sm:flex-none"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Avvisa
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Är du säker?</AlertDialogTitle>
            <AlertDialogDescription>
              {rejectTarget?.type === 'batch' ? (
                <>
                  Du är på väg att avvisa <strong>{selectedIds.size}</strong> förfrågan{selectedIds.size === 1 ? '' : 'ar'}.
                  Denna åtgärd kan inte ångras.
                </>
              ) : (
                <>
                  Du är på väg att avvisa denna förfrågan.
                  Användaren kommer att behöva skicka en ny förfrågan för att gå med i organisationen.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Avvisa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
