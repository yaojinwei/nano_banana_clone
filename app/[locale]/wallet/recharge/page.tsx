import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RechargeClient from './recharge-client'

interface RechargePageProps {
  params: {
    locale: string
  }
}

export default async function RechargePage({ params }: RechargePageProps) {
  const supabase = await createClient()

  if (!supabase) {
    redirect('/login')
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <RechargeClient user={user} locale={params.locale} />
}
