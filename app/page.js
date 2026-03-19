import { createClient } from '@supabase/supabase-js'
import DataTable from './components/DataTable'

async function getData() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )
  const { data, error } = await supabase.from('HACK_URBA_1').select('*')
  if (error) throw new Error(error.message)
  return data
}

export default async function Home() {
  let rows = []
  let errorMsg = null

  try {
    rows = await getData()
  } catch (e) {
    errorMsg = e.message
  }

  return (
    <main style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>HACK_URBA_1</h1>
      {errorMsg && (
        <p style={{ color: 'red' }}>Error: {errorMsg}</p>
      )}
      {!errorMsg && rows.length === 0 && <p>Sin datos.</p>}
      {!errorMsg && rows.length > 0 && (
        <DataTable rows={rows} />
      )}
    </main>
  )
}
