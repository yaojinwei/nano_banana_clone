import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WalletClient from './wallet-client'

export default async function WalletPage() {
  const supabase = await createClient()

  if (!supabase) {
    redirect('/login')
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <WalletClient user={user} />
}
