'use client'

import { useState, useCallback } from 'react'
import DataTable from './DataTable'
import CreateOperacionModal from './CreateOperacionModal'
import EditOperacionModal from './EditOperacionModal'
import TreeViewOperaciones from './TreeViewOperaciones'

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
  { key: 'expediente_codigo', label: 'Expediente relacionado' },
]

const OPERACIONES_NUM_FIELDS = [
  { key: 'operacion_importeretenido', label: 'Importe Retenido' },
  { key: 'operacion_importegastado', label: 'Importe Gastado' },
]

const OPERACIONES_COLUMNS = [
  'operacion_tipo', 'operacion_ID', 'arbol_ID', 'RC_Numero',
  'operacion_importeretenido', 'operacion_importegastado',
  'operacion_descripcion', 'operacion_unidadgestora', 'operacion_fecha', 'operacion_aplicacion',
  'expediente_codigo',
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
  expediente_codigo: 'Expediente relacionado',
}

const TIPO_BADGE_COLORS = {
  RC: { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  A: { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
  D: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
  O: { bg: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff' },
  ADO: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  AD: { bg: '#ffedd5', color: '#9a3412', border: '#fed7aa' },
}

export default function TabView({ aplicaciones: initialAplicaciones, operaciones: initialOperaciones }) {
  const [tab, setTab] = useState('operaciones')
  const [opViewMode, setOpViewMode] = useState('tabla') // 'tabla' | 'arbol'
  const [showModal, setShowModal] = useState(false)
  const [editingOp, setEditingOp] = useState(null)
  const [operaciones, setOperaciones] = useState(initialOperaciones || [])
  const [aplicaciones, setAplicaciones] = useState(initialAplicaciones || [])
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/data')
      if (res.ok) {
        const data = await res.json()
        setOperaciones(data.operaciones || [])
        setAplicaciones(data.aplicaciones || [])
      }
    } finally {
      setRefreshing(false)
    }
  }, [])

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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Refresh button */}
          <button
            onClick={fetchData}
            disabled={refreshing}
            title="Refrescar datos desde la base de datos"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#fff',
              color: refreshing ? '#94a3b8' : '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={e => { if (!refreshing) e.currentTarget.style.background = '#f8fafc' }}
            onMouseOut={e => { e.currentTarget.style.background = '#fff' }}
          >
            <span style={{ display: 'inline-block', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>
              🔄
            </span>
            {refreshing ? 'Actualizando...' : 'Refrescar'}
          </button>

          {tab === 'operaciones' && (
            <>
              {/* View mode toggle */}
              <div style={{
                display: 'flex',
                background: '#f1f5f9',
                borderRadius: '8px',
                padding: '3px',
                gap: '2px',
              }}>
                {[
                  { key: 'tabla', icon: '☰', label: 'Tabla' },
                  { key: 'arbol', icon: '🌳', label: 'Árbol' },
                ].map(v => (
                  <button
                    key={v.key}
                    onClick={() => setOpViewMode(v.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '5px 12px',
                      border: 'none', borderRadius: '6px',
                      cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: '0.8rem', fontWeight: opViewMode === v.key ? 600 : 400,
                      background: opViewMode === v.key ? '#fff' : 'transparent',
                      color: opViewMode === v.key ? '#1d4ed8' : '#64748b',
                      boxShadow: opViewMode === v.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>{v.icon}</span>
                    <span>{v.label}</span>
                  </button>
                ))}
              </div>

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
            </>
          )}
        </div>
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
            : opViewMode === 'arbol'
              ? <TreeViewOperaciones operaciones={operaciones} onEdit={op => setEditingOp(op)} />
              : <DataTable
                  key="operaciones"
                  rows={operaciones}
                  textFields={OPERACIONES_TEXT_FIELDS}
                  numFields={OPERACIONES_NUM_FIELDS}
                  allColumns={OPERACIONES_COLUMNS}
                  columnLabels={OPERACIONES_LABELS}
                  tipoBadgeColors={TIPO_BADGE_COLORS}
                  onEdit={op => setEditingOp(op)}
                />
        )}
      </div>

      {/* Create Operacion Modal */}
      {showModal && (
        <CreateOperacionModal
          onClose={() => setShowModal(false)}
          aplicaciones={aplicaciones}
          operaciones={operaciones}
          onSaved={fetchData}
        />
      )}

      {/* Edit Operacion Modal */}
      {editingOp && (
        <EditOperacionModal
          operacion={editingOp}
          onClose={() => setEditingOp(null)}
          aplicaciones={aplicaciones}
          operaciones={operaciones}
          onSaved={fetchData}
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
