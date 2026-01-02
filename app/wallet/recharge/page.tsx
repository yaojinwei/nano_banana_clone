import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RechargeClient from './recharge-client'

export default async function RechargePage() {
  const supabase = await createClient()

  if (!supabase) {
    redirect('/login')
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <RechargeClient user={user} />
}
