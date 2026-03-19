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
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        padding: '0 2rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '10px',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem',
        }}>
          📊
        </div>
        <div>
          <h1 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Hackaton Contabilidad
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem', marginTop: 1 }}>
            Sistema de gestión contable
          </p>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 1.5rem' }}>
        {errorMsg && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
            padding: '0.85rem 1.25rem', color: '#dc2626', fontSize: '0.875rem',
          }}>
            ⚠️ Error: {errorMsg}
          </div>
        )}
        {!errorMsg && data && (
          <TabView aplicaciones={data.aplicaciones} operaciones={data.operaciones} />
        )}
      </main>
    </div>
  )
}
