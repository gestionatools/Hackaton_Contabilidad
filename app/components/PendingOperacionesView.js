'use client'

import { useState } from 'react'
import ValidarOperacionModal from './ValidarOperacionModal'

const TIPO_BADGE_COLORS = {
  RC:  { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  A:   { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
  D:   { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
  O:   { bg: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff' },
  ADO: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  AD:  { bg: '#ffedd5', color: '#9a3412', border: '#fed7aa' },
}

function TipoBadge({ tipo }) {
  const colors = TIPO_BADGE_COLORS[tipo] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 700,
      background: colors.bg,
      color: colors.color,
      border: `1px solid ${colors.border}`,
      letterSpacing: '0.03em',
    }}>
      {tipo || '—'}
    </span>
  )
}

function formatDate(isoStr) {
  if (!isoStr) return '—'
  try {
    return new Date(isoStr).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return isoStr
  }
}

function truncate(str, max = 60) {
  if (!str) return '—'
  return str.length > max ? str.slice(0, max) + '…' : str
}

export default function PendingOperacionesView({ pendingOperaciones, aplicaciones, operaciones, onSaved }) {
  const [validatingOp, setValidatingOp] = useState(null)

  if (!pendingOperaciones || pendingOperaciones.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>Sin operaciones pendientes</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Todas las operaciones tienen Árbol ID asignado.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Summary header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '0.75rem 1rem',
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '10px',
        marginBottom: '1rem',
        fontSize: '0.85rem',
        color: '#92400e',
      }}>
        <span style={{ fontSize: '1.1rem' }}>⚠️</span>
        <span>
          <strong>{pendingOperaciones.length}</strong> operación{pendingOperaciones.length !== 1 ? 'es' : ''} pendiente{pendingOperaciones.length !== 1 ? 's' : ''} de completar —
          sin Árbol ID asignado.
        </span>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr 1fr 1fr 140px 80px',
        gap: '0',
        padding: '0.5rem 1rem',
        background: '#f8fafc',
        borderRadius: '8px 8px 0 0',
        border: '1px solid #e2e8f0',
        borderBottom: 'none',
      }}>
        {['Tipo', 'ID Operación', 'Aplicación', 'Unidad Gestora', 'Fecha', ''].map((h, i) => (
          <span key={i} style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '0 0 8px 8px',
        overflow: 'hidden',
      }}>
        {pendingOperaciones.map((op, idx) => (
          <div
            key={op.operacion_ID}
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 1fr 1fr 140px 80px',
              gap: '0',
              padding: '0.75rem 1rem',
              alignItems: 'center',
              background: idx % 2 === 0 ? '#fff' : '#fafafa',
              borderBottom: idx < pendingOperaciones.length - 1 ? '1px solid #f1f5f9' : 'none',
              transition: 'background 0.1s',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#fffbeb'}
            onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafafa'}
          >
            {/* Tipo */}
            <div>
              <TipoBadge tipo={op.operacion_tipo} />
            </div>

            {/* ID Operación */}
            <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#0f172a', fontWeight: 600 }}>
              {op.operacion_ID}
            </div>

            {/* Aplicación */}
            <div style={{ fontSize: '0.8rem', color: '#374151' }}>
              {op.operacion_aplicacion || <span style={{ color: '#94a3b8' }}>—</span>}
            </div>

            {/* Unidad Gestora */}
            <div style={{ fontSize: '0.8rem', color: '#374151' }} title={op.operacion_unidadgestora || ''}>
              {truncate(op.operacion_unidadgestora, 30) || <span style={{ color: '#94a3b8' }}>—</span>}
            </div>

            {/* Fecha */}
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {formatDate(op.operacion_fecha)}
            </div>

            {/* Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setValidatingOp(op)}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(245,158,11,0.3)',
                  whiteSpace: 'nowrap',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Ver detalles
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Validation modal */}
      {validatingOp && (
        <ValidarOperacionModal
          operacion={validatingOp}
          onClose={() => setValidatingOp(null)}
          aplicaciones={aplicaciones}
          operaciones={operaciones}
          onSaved={async () => {
            setValidatingOp(null)
            await onSaved?.()
          }}
        />
      )}
    </div>
  )
}
