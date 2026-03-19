import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

  const [{ data: aplicaciones, error: err1 }, { data: operaciones, error: err2 }] = await Promise.all([
    supabase.from('HACK_CONTA_Aplicaciones').select('*'),
    supabase.from('HACK_CONTA_Operaciones').select('*'),
  ])

  if (err1) return NextResponse.json({ error: `Aplicaciones: ${err1.message}` }, { status: 500 })
  if (err2) return NextResponse.json({ error: `Operaciones: ${err2.message}` }, { status: 500 })

  return NextResponse.json({ aplicaciones, operaciones })
}
