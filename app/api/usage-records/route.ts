import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    // Validate pageSize
    const validPageSizes = [10, 20, 50, 100]
    if (!validPageSizes.includes(pageSize)) {
      return NextResponse.json({ error: 'Invalid page size. Must be 10, 20, 50, or 100' }, { status: 400 })
    }

    const offset = (page - 1) * pageSize

    // Get total count
    const { count, error: countError } = await supabase
      .from('usage_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      console.error('Count error:', countError)
      return NextResponse.json({ error: 'Failed to fetch usage records' }, { status: 500 })
    }

    // Get records with pagination
    const { data: records, error } = await supabase
      .from('usage_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) {
      console.error('Fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch usage records' }, { status: 500 })
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
    console.error('Usage records API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
