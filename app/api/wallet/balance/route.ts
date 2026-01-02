import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile with credits balance
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('credits_balance')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Fetch profile error:', error)
      // If profile doesn't exist, create one
      if (error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name,
            avatar_url: user.user_metadata?.avatar_url,
            credits_balance: 100
          })
          .select('credits_balance')
          .single()

        if (createError) {
          console.error('Create profile error:', createError)
          return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
        }

        return NextResponse.json({ balance: newProfile.credits_balance })
      }

      return NextResponse.json({ error: 'Failed to fetch wallet balance' }, { status: 500 })
    }

    return NextResponse.json({ balance: profile?.credits_balance || 0 })
  } catch (error) {
    console.error('Wallet balance API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { credits } = body

    if (typeof credits !== 'number' || credits <= 0) {
      return NextResponse.json(
        { error: 'Invalid credits amount' },
        { status: 400 }
      )
    }

    // Update user's credits balance
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('credits_balance')
      .eq('id', user.id)
      .single()

    if (fetchError) {
      console.error('Fetch profile error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    const newBalance = (profile?.credits_balance || 0) + credits

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits_balance: newBalance })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update balance error:', updateError)
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 })
    }

    return NextResponse.json({ balance: newBalance })
  } catch (error) {
    console.error('Update wallet balance API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
