import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RechargeRecordsClient from './recharge-records-client'

export default async function RechargeRecordsPage() {
  const supabase = await createClient()

  if (!supabase) {
    redirect('/login')
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <RechargeRecordsClient user={user} />
}
