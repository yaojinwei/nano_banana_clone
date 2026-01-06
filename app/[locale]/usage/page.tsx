import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UsageRecordsClient from './usage-client'

export default async function UsageRecordsPage() {
  const supabase = await createClient()

  if (!supabase) {
    redirect('/login')
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <UsageRecordsClient user={user} />
}
