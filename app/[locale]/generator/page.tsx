import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GeneratorClient from './generator-client'

export default async function GeneratorPage() {
  const supabase = await createClient()

  // Check if Supabase is configured
  if (!supabase) {
    redirect('/login')
  }

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // User is authenticated, render the client component
  return <GeneratorClient user={user} />
}
