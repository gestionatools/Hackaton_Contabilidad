'use client'

import { useState } from 'react'
import DataTable from './DataTable'

const APLICACIONES_TEXT_FIELDS = [
  { key: 'aplicacion_presup', label: 'Aplicación Presupuestaria' },
  { key: 'aplicacion_descripcion', label: 'Descripción' },
]

const APLICACIONES_NUM_FIELDS = [
  { key: 'id', label: 'ID' },
  { key: 'Importe_Disponible', label: 'Importe Disponible' },
]

const APLICACIONES_COLUMNS = [
  'id', 'created_at', 'aplicacion_presup', 'Importe_Disponible',
  'fecha_ultimocambio', 'aplicacion_descripcion',
]

const OPERACIONES_TEXT_FIELDS = [
  { key: 'operacion_tipo', label: 'Tipo' },
  { key: 'operacion_ID', label: 'ID Operación' },
  { key: 'arbol_ID', label: 'ID Árbol' },
  { key: 'RC_Numero', label: 'RC Número' },
  { key: 'operacion_descripcion', label: 'Descripción' },
  { key: 'operacion_unidadgestora', label: 'Unidad Gestora' },
  { key: 'operacion_aplicacion', label: 'Aplicación' },
]

const OPERACIONES_NUM_FIELDS = [
  { key: 'id', label: 'ID' },
  { key: 'operacion_importeretenido', label: 'Importe Retenido' },
  { key: 'operacion_importegastado', label: 'Importe Gastado' },
]

const OPERACIONES_COLUMNS = [
  'id', 'created_at', 'operacion_tipo', 'operacion_ID', 'arbol_ID',
  'RC_Numero', 'operacion_importeretenido', 'operacion_importegastado',
  'operacion_descripcion', 'operacion_unidadgestora', 'operacion_fecha',
  'operacion_aplicacion',
]

const tabStyle = (active) => ({
  padding: '0.5rem 1.25rem',
  fontWeight: active ? 700 : 400,
  fontSize: '0.95rem',
  border: 'none',
  borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
  background: 'none',
  cursor: 'pointer',
  color: active ? '#3b82f6' : '#555',
})

export default function TabView({ aplicaciones, operaciones }) {
  const [tab, setTab] = useState('aplicaciones')

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #ddd' }}>
        <button style={tabStyle(tab === 'aplicaciones')} onClick={() => setTab('aplicaciones')}>
          Aplicaciones
        </button>
        <button style={tabStyle(tab === 'operaciones')} onClick={() => setTab('operaciones')}>
          Operaciones
        </button>
      </div>

      {tab === 'aplicaciones' && (
        aplicaciones.length === 0
          ? <p>Sin datos.</p>
          : <DataTable
              rows={aplicaciones}
              textFields={APLICACIONES_TEXT_FIELDS}
              numFields={APLICACIONES_NUM_FIELDS}
              allColumns={APLICACIONES_COLUMNS}
            />
      )}

      {tab === 'operaciones' && (
        operaciones.length === 0
          ? <p>Sin datos.</p>
          : <DataTable
              rows={operaciones}
              textFields={OPERACIONES_TEXT_FIELDS}
              numFields={OPERACIONES_NUM_FIELDS}
              allColumns={OPERACIONES_COLUMNS}
            />
      )}
    </>
  )
}
