import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

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
    const { amount, credits, payment_method, payment_id, status } = body

    if (!amount || !credits || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, credits, status' },
        { status: 400 }
      )
    }

    // Create recharge record
    const { data: record, error } = await supabase
      .from('recharge_records')
      .insert({
        id: randomUUID(),
        user_id: user.id,
        amount,
        credits,
        payment_method,
        payment_id,
        status,
      })
      .select()
      .single()

    if (error) {
      console.error('Insert recharge record error:', error)
      return NextResponse.json({ error: 'Failed to create recharge record' }, { status: 500 })
    }

    return NextResponse.json({ data: record })
  } catch (error) {
    console.error('Create recharge record API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    const validPageSizes = [10, 20, 50, 100]
    if (!validPageSizes.includes(pageSize)) {
      return NextResponse.json({ error: 'Invalid page size' }, { status: 400 })
    }

    const offset = (page - 1) * pageSize

    const { count, error: countError } = await supabase
      .from('recharge_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      console.error('Count error:', countError)
      return NextResponse.json({ error: 'Failed to fetch recharge records' }, { status: 500 })
    }

    const { data: records, error } = await supabase
      .from('recharge_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) {
      console.error('Fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch recharge records' }, { status: 500 })
    }

    return NextResponse.json({
      data: records || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    })
  } catch (error) {
    console.error('Recharge records API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
