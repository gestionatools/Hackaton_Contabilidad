import { createClient } from '@supabase/supabase-js'
import TabView from './components/TabView'

async function getData() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

  const [{ data: aplicaciones, error: err1 }, { data: operaciones, error: err2 }] = await Promise.all([
    supabase.from('HACK_CONTA_Aplicaciones').select('*'),
    supabase.from('HACK_CONTA_Operaciones').select('*'),
  ])

  if (err1) throw new Error(`Aplicaciones: ${err1.message}`)
  if (err2) throw new Error(`Operaciones: ${err2.message}`)

  return { aplicaciones, operaciones }
}

export default async function Home() {
  let data = null
  let errorMsg = null

  try {
    data = await getData()
  } catch (e) {
    errorMsg = e.message
  }

  return (
    <main style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Hackaton Contabilidad</h1>
      {errorMsg && (
        <p style={{ color: 'red' }}>Error: {errorMsg}</p>
      )}
      {!errorMsg && data && (
        <TabView aplicaciones={data.aplicaciones} operaciones={data.operaciones} />
      )}
    </main>
  )
}
