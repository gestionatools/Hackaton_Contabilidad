'use client'

import { useState, useMemo } from 'react'

const TIPO_BADGE_COLORS = {
  RC: { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  A:  { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
  D:  { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
  O:  { bg: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff' },
  ADO:{ bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  AD: { bg: '#ffedd5', color: '#9a3412', border: '#fed7aa' },
}

function TipoBadge({ tipo }) {
  const colors = TIPO_BADGE_COLORS[tipo] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' }
  return (
    <span style={{
      fontSize: '0.7rem', fontWeight: 700,
      background: colors.bg, color: colors.color,
      border: `1px solid ${colors.border}`,
      borderRadius: '5px', padding: '2px 7px', letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
    }}>
      {tipo}
    </span>
  )
}

function formatEur(val) {
  if (val == null || val === '') return null
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val)
}

function formatDate(val) {
  if (!val) return null
  const d = new Date(val)
  if (isNaN(d)) return val
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function OperacionRow({ op }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px',
      padding: '8px 20px 8px 48px',
      borderBottom: '1px solid #f8fafc',
      fontSize: '0.81rem', color: '#374151',
      background: '#fff',
    }}>
      <TipoBadge tipo={op.operacion_tipo} />
      <span style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace', fontSize: '0.78rem' }}>
        {op.operacion_ID}
      </span>
      {op.RC_Numero && (
        <span style={{ color: '#1d4ed8', fontWeight: 500 }}>{op.RC_Numero}</span>
      )}
      {op.operacion_descripcion && (
        <span style={{ color: '#64748b', flex: 1, minWidth: 80 }}>
          {op.operacion_descripcion}
        </span>
      )}
      {op.operacion_unidadgestora && (
        <span style={{ color: '#94a3b8', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
          {op.operacion_unidadgestora}
        </span>
      )}
      {formatEur(op.operacion_importeretenido) && (
        <span style={{ color: '#059669', fontWeight: 500, whiteSpace: 'nowrap' }}>
          Ret: {formatEur(op.operacion_importeretenido)}
        </span>
      )}
      {formatEur(op.operacion_importegastado) && (
        <span style={{ color: '#7c3aed', fontWeight: 500, whiteSpace: 'nowrap' }}>
          Gas: {formatEur(op.operacion_importegastado)}
        </span>
      )}
      {formatDate(op.operacion_fecha) && (
        <span style={{ color: '#94a3b8', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
          {formatDate(op.operacion_fecha)}
        </span>
      )}
    </div>
  )
}

function ArbolAccordion({ arbolId, operations }) {
  const [open, setOpen] = useState(false)

  // RC is the top-level header; if no RC, use the first operation
  const headerOp = operations.find(op => op.operacion_tipo === 'RC') || operations[0]
  const childOps = operations.filter(op => op !== headerOp)

  const totalRetenido = operations.reduce((s, op) =>
    s + (op.operacion_importeretenido != null ? Number(op.operacion_importeretenido) : 0), 0)
  const totalGastado = operations.reduce((s, op) =>
    s + (op.operacion_importegastado != null ? Number(op.operacion_importegastado) : 0), 0)

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      marginBottom: '0.65rem',
      overflow: 'hidden',
      boxShadow: open ? '0 2px 8px rgba(37,99,235,0.07)' : '0 1px 2px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.15s',
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '11px 16px',
          background: open ? '#f0f9ff' : '#f8fafc',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
          borderBottom: open ? '1px solid #e2e8f0' : 'none',
          transition: 'background 0.15s',
        }}
        onMouseOver={e => { if (!open) e.currentTarget.style.background = '#f1f5f9' }}
        onMouseOut={e => { if (!open) e.currentTarget.style.background = '#f8fafc' }}
      >
        {/* Chevron */}
        <span style={{
          fontSize: '0.65rem',
          transform: open ? 'rotate(90deg)' : 'rotate(0)',
          transition: 'transform 0.2s',
          display: 'inline-block',
          color: '#94a3b8',
          flexShrink: 0,
        }}>
          ▶
        </span>

        {/* Árbol ID chip */}
        <span style={{
          fontSize: '0.72rem', fontWeight: 700, color: '#2563eb',
          background: '#eff6ff', padding: '2px 9px', borderRadius: '6px',
          border: '1px solid #bfdbfe', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          🌳 {arbolId}
        </span>

        <TipoBadge tipo={headerOp.operacion_tipo} />

        <span style={{
          fontWeight: 600, color: '#0f172a', fontSize: '0.83rem',
          fontFamily: 'monospace', whiteSpace: 'nowrap',
        }}>
          {headerOp.operacion_ID}
        </span>

        {headerOp.RC_Numero && (
          <span style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {headerOp.RC_Numero}
          </span>
        )}

        {headerOp.operacion_descripcion && (
          <span style={{ fontSize: '0.82rem', color: '#64748b', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {headerOp.operacion_descripcion}
          </span>
        )}

        {/* Totals */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          {totalRetenido > 0 && (
            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalRetenido)}
            </span>
          )}
          {totalGastado > 0 && (
            <span style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Gas: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalGastado)}
            </span>
          )}
        </div>

        {/* Count badge */}
        <span style={{
          fontSize: '0.68rem', background: '#f1f5f9', color: '#64748b',
          borderRadius: '20px', padding: '2px 8px', fontWeight: 600,
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {operations.length} op{operations.length !== 1 ? 's' : ''}
        </span>
      </button>

      {/* Child operations */}
      {open && (
        <div>
          {childOps.length > 0 ? (
            childOps.map(op => <OperacionRow key={op.operacion_ID} op={op} />)
          ) : (
            <div style={{ padding: '10px 48px', fontSize: '0.79rem', color: '#94a3b8', background: '#fff' }}>
              No hay más operaciones en este árbol.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function TreeViewOperaciones({ operaciones }) {
  const trees = useMemo(() => {
    const map = {}
    ;(operaciones || []).forEach(op => {
      const key = op.arbol_ID || '__sin_arbol__'
      if (!map[key]) map[key] = []
      map[key].push(op)
    })
    return map
  }, [operaciones])

  const arbolIds = useMemo(() =>
    Object.keys(trees).sort(),
    [trees]
  )

  if (arbolIds.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌳</div>
        <p style={{ fontSize: '0.9rem' }}>Sin árboles de operaciones.</p>
      </div>
    )
  }

  return (
    <div>
      {arbolIds.map(id => (
        <ArbolAccordion key={id} arbolId={id} operations={trees[id]} />
      ))}
    </div>
  )
}
