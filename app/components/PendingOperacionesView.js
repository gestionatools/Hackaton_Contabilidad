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
  const [autoValidating, setAutoValidating] = useState(new Set())
  const [validatedIds, setValidatedIds] = useState(new Set())
  const [errors, setErrors] = useState({})

  if (!pendingOperaciones || pendingOperaciones.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>Sin operaciones pendientes</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Todas las operaciones tienen Árbol ID asignado.</p>
      </div>
    )
  }

  const handleAutoValidate = async (op) => {
    const opId = op.operacion_ID
    if (!opId || autoValidating.has(opId)) return

    setAutoValidating(prev => new Set(prev).add(opId))
    setErrors(prev => { const n = { ...prev }; delete n[opId]; return n })

    try {
      const res = await fetch(`/api/operaciones/${opId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operacion_tipo: op.operacion_tipo || 'RC',
          arbol_linked: false,
          arbol_ID: '',
          operacion_importeretenido: op.operacion_importeretenido ?? '',
          operacion_importegastado: op.operacion_importegastado ?? '',
          operacion_descripcion: op.operacion_descripcion || '',
          operacion_unidadgestora: op.operacion_unidadgestora || '',
          operacion_fecha: op.operacion_fecha || '',
          operacion_aplicacion: op.operacion_aplicacion || '',
          NIF_tercero: op.NIF_tercero || '',
          expediente_codigo: op.expediente_codigo || '',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al validar la operación.')
      setValidatedIds(prev => new Set(prev).add(opId))
      await onSaved?.()
    } catch (err) {
      setErrors(prev => ({ ...prev, [opId]: err.message }))
    } finally {
      setAutoValidating(prev => {
        const n = new Set(prev); n.delete(opId); return n
      })
    }
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
          <strong>{pendingOperaciones.length}</strong> operación{pendingOperaciones.length !== 1 ? 'es' : ''} pendiente{pendingOperaciones.length !== 1 ? 's' : ''} de validar —
          sin Árbol ID asignado.
        </span>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr 1fr 1fr 140px 160px',
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
        {pendingOperaciones.map((op, idx) => {
          const opId = op.operacion_ID
          const isValidating = autoValidating.has(opId)
          const isValidated = validatedIds.has(opId)
          const rowError = errors[opId]

          return (
            <div key={opId || idx}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 1fr 1fr 140px 160px',
                  gap: '0',
                  padding: '0.75rem 1rem',
                  alignItems: 'center',
                  background: isValidated
                    ? '#f0fdf4'
                    : idx % 2 === 0 ? '#fff' : '#fafafa',
                  borderBottom: idx < pendingOperaciones.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'background 0.1s',
                  opacity: isValidating ? 0.7 : 1,
                }}
                onMouseOver={e => { if (!isValidating && !isValidated) e.currentTarget.style.background = '#fffbeb' }}
                onMouseOut={e => { if (!isValidating && !isValidated) e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafafa' }}
              >
                {/* Tipo */}
                <div>
                  <TipoBadge tipo={op.operacion_tipo} />
                </div>

                {/* ID Operación */}
                <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#0f172a', fontWeight: 600 }}>
                  {opId || <span style={{ color: '#f59e0b', fontStyle: 'italic' }}>pendiente</span>}
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

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  {isValidated ? (
                    <span style={{
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#16a34a',
                      background: '#dcfce7',
                      borderRadius: '6px',
                      border: '1px solid #bbf7d0',
                    }}>
                      ✓ Validada
                    </span>
                  ) : (
                    <>
                      {/* Quick validate button */}
                      <button
                        onClick={() => handleAutoValidate(op)}
                        disabled={isValidating}
                        title="Validar automáticamente con IDs generados"
                        style={{
                          padding: '5px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          fontFamily: 'inherit',
                          background: isValidating
                            ? '#86efac'
                            : 'linear-gradient(135deg, #16a34a, #15803d)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: isValidating ? 'not-allowed' : 'pointer',
                          boxShadow: isValidating ? 'none' : '0 1px 4px rgba(22,163,74,0.3)',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        onMouseOver={e => { if (!isValidating) e.currentTarget.style.transform = 'translateY(-1px)' }}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        {isValidating ? <>⏳ Validando…</> : <>✓ Validar</>}
                      </button>

                      {/* Details/edit button */}
                      <button
                        onClick={() => setValidatingOp(op)}
                        disabled={isValidating}
                        title="Ver detalles y editar antes de validar"
                        style={{
                          padding: '5px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          fontFamily: 'inherit',
                          background: '#fff',
                          color: '#64748b',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          cursor: isValidating ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseOver={e => { if (!isValidating) e.currentTarget.style.background = '#f8fafc' }}
                        onMouseOut={e => e.currentTarget.style.background = '#fff'}
                      >
                        ✏️
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Error row */}
              {rowError && (
                <div style={{
                  padding: '0.5rem 1rem',
                  background: '#fef2f2',
                  borderBottom: '1px solid #fecaca',
                  fontSize: '0.78rem',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span>⚠️</span> {rowError}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Validation modal (for manual editing) */}
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
