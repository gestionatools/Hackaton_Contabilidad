'use client'

import { useState } from 'react'
import DataTable from './DataTable'
import CreateOperacionModal from './CreateOperacionModal'

const APLICACIONES_TEXT_FIELDS = [
  { key: 'aplicacion_presup', label: 'Aplicación Presupuestaria' },
  { key: 'aplicacion_descripcion', label: 'Descripción' },
]

const APLICACIONES_NUM_FIELDS = [
  { key: 'Importe_Disponible', label: 'Importe Disponible' },
]

const APLICACIONES_COLUMNS = [
  'aplicacion_presup', 'Importe_Disponible', 'fecha_ultimocambio', 'aplicacion_descripcion',
]

const APLICACIONES_LABELS = {
  aplicacion_presup: 'Aplicación Presup.',
  Importe_Disponible: 'Importe Disponible',
  fecha_ultimocambio: 'Última Modificación',
  aplicacion_descripcion: 'Descripción',
}

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
  { key: 'operacion_importeretenido', label: 'Importe Retenido' },
  { key: 'operacion_importegastado', label: 'Importe Gastado' },
]

const OPERACIONES_COLUMNS = [
  'operacion_tipo', 'operacion_ID', 'arbol_ID', 'RC_Numero',
  'operacion_importeretenido', 'operacion_importegastado',
  'operacion_descripcion', 'operacion_unidadgestora', 'operacion_fecha', 'operacion_aplicacion',
]

const OPERACIONES_LABELS = {
  operacion_tipo: 'Tipo',
  operacion_ID: 'ID Operación',
  arbol_ID: 'ID Árbol',
  RC_Numero: 'RC Número',
  operacion_importeretenido: 'Importe Retenido',
  operacion_importegastado: 'Importe Gastado',
  operacion_descripcion: 'Descripción',
  operacion_unidadgestora: 'Unidad Gestora',
  operacion_fecha: 'Fecha',
  operacion_aplicacion: 'Aplicación',
}

const TIPO_BADGE_COLORS = {
  RC: { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  A: { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
  D: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
  O: { bg: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff' },
  ADO: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  AD: { bg: '#ffedd5', color: '#9a3412', border: '#fed7aa' },
}

export default function TabView({ aplicaciones, operaciones }) {
  const [tab, setTab] = useState('operaciones')
  const [showModal, setShowModal] = useState(false)

  const tabs = [
    { key: 'operaciones', label: 'Operaciones', count: operaciones?.length ?? 0, icon: '📋' },
    { key: 'aplicaciones', label: 'Aplicaciones', count: aplicaciones?.length ?? 0, icon: '📁' },
  ]

  return (
    <div>
      {/* Tab bar + action buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: '#fff',
          borderRadius: '12px',
          padding: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
        }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: tab === t.key ? 600 : 400,
                background: tab === t.key ? '#2563eb' : 'transparent',
                color: tab === t.key ? '#fff' : '#64748b',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              <span style={{
                fontSize: '0.7rem',
                background: tab === t.key ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: tab === t.key ? '#fff' : '#94a3b8',
                borderRadius: '20px',
                padding: '1px 7px',
                fontWeight: 600,
              }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Action buttons */}
        {tab === 'operaciones' && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37,99,235,0.35)',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ fontSize: '1rem' }}>＋</span>
            Nueva Operación
          </button>
        )}
      </div>

      {/* Tab content */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        padding: '1.25rem',
      }}>
        {tab === 'aplicaciones' && (
          aplicaciones.length === 0
            ? <EmptyState message="Sin aplicaciones presupuestarias." />
            : <DataTable
                key="aplicaciones"
                rows={aplicaciones}
                textFields={APLICACIONES_TEXT_FIELDS}
                numFields={APLICACIONES_NUM_FIELDS}
                allColumns={APLICACIONES_COLUMNS}
                columnLabels={APLICACIONES_LABELS}
              />
        )}

        {tab === 'operaciones' && (
          operaciones.length === 0
            ? <EmptyState message="Sin operaciones registradas." />
            : <DataTable
                key="operaciones"
                rows={operaciones}
                textFields={OPERACIONES_TEXT_FIELDS}
                numFields={OPERACIONES_NUM_FIELDS}
                allColumns={OPERACIONES_COLUMNS}
                columnLabels={OPERACIONES_LABELS}
                tipoBadgeColors={TIPO_BADGE_COLORS}
              />
        )}
      </div>

      {/* Create Operacion Modal */}
      {showModal && (
        <CreateOperacionModal
          onClose={() => setShowModal(false)}
          aplicaciones={aplicaciones}
          operaciones={operaciones}
        />
      )}
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
      <p style={{ fontSize: '0.9rem' }}>{message}</p>
    </div>
  )
}
