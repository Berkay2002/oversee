import { UpdateEmailForm } from '@/components/update-email-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      <p className="text-muted-foreground">
        Manage your account settings here.
      </p>
      <div className="mt-6 max-w-xl">
        <UpdateEmailForm user={user} />
      </div>
    </div>
  )
}
