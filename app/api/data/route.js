import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use service role key for server-side routes (bypasses RLS).
// Falls back to anon key if service role key is not configured.
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY
  )
}

export async function GET() {
  const supabase = getSupabase()

  const [{ data: aplicaciones, error: err1 }, { data: operaciones, error: err2 }] = await Promise.all([
    supabase.from('HACK_CONTA_Aplicaciones').select('*'),
    supabase.from('HACK_CONTA_Operaciones').select('*'),
  ])

  if (err1) return NextResponse.json({ error: `Aplicaciones: ${err1.message}` }, { status: 500 })
  if (err2) return NextResponse.json({ error: `Operaciones: ${err2.message}` }, { status: 500 })

  return NextResponse.json({ aplicaciones, operaciones })
}
