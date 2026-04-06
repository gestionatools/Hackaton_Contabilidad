'use client'

import { useState, useMemo } from 'react'

const TIPOS = ['RC', 'A', 'D', 'O', 'ADO', 'AD']

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  fontSize: '0.875rem',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontFamily: 'inherit',
  outline: 'none',
  background: '#fff',
  color: '#0f172a',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '5px',
}

const fieldGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
}

function toDateOnly(isoStr) {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    const pad = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  } catch {
    return ''
  }
}

export default function ValidarOperacionModal({ operacion, onClose, aplicaciones, operaciones, onSaved }) {
  const [form, setForm] = useState({
    operacion_tipo: operacion.operacion_tipo || 'RC',
    arbol_ID: '',
    arbol_linked: false,
    operacion_importeretenido: operacion.operacion_importeretenido ?? '',
    operacion_importegastado: operacion.operacion_importegastado ?? '',
    operacion_descripcion: operacion.operacion_descripcion || '',
    operacion_unidadgestora: operacion.operacion_unidadgestora || '',
    operacion_fecha: toDateOnly(operacion.operacion_fecha),
    operacion_aplicacion: operacion.operacion_aplicacion || '',
    NIF_tercero: operacion.NIF_tercero || '',
    expediente_codigo: operacion.expediente_codigo || '',
  })

  const [arbolInherited, setArbolInherited] = useState({
    importeretenido: null,
    aplicacion: null,
    unidadgestora: null,
    nif_tercero: null,
  })

  const [showArbolPicker, setShowArbolPicker] = useState(false)
  const [arbolSearch, setArbolSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isRC = form.operacion_tipo === 'RC'
  const isOADO = form.operacion_tipo === 'O' || form.operacion_tipo === 'ADO'
  const showImporteRetenido = isRC || form.arbol_linked

  // Preview of next RC_Numero
  const nextRCPreview = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const maxRCNum = (operaciones || []).reduce((max, op) => {
      const match = op.RC_Numero?.match(/^RC-\d{4}-(\d+)$/)
      if (match) {
        const n = parseInt(match[1], 10)
        return n > max ? n : max
      }
      return max
    }, 0)
    return `RC-${currentYear}-${String(maxRCNum + 1).padStart(5, '0')}`
  }, [operaciones])

  // Distinct arbol_IDs from existing operaciones
  const arbolIDs = useMemo(() => {
    const ids = new Set()
    ;(operaciones || []).forEach(op => { if (op.arbol_ID) ids.add(op.arbol_ID) })
    return [...ids].sort()
  }, [operaciones])

  const filteredArbolIDs = arbolSearch
    ? arbolIDs.filter(id => id.toLowerCase().includes(arbolSearch.toLowerCase()))
    : arbolIDs

  const selectArbol = (arbolId) => {
    const matchingRows = (operaciones || []).filter(op => op.arbol_ID === arbolId)
    const withRetenido = matchingRows.find(op => op.operacion_importeretenido != null)
    const withAplicacion = matchingRows.find(op => op.operacion_aplicacion != null)
    const withUnidad = matchingRows.find(op => op.operacion_unidadgestora != null)
    const withNIF = matchingRows.find(op => op.NIF_tercero != null && op.NIF_tercero !== '')

    const inheritedRetenido = withRetenido?.operacion_importeretenido ?? null
    const inheritedAplicacion = withAplicacion?.operacion_aplicacion ?? null
    const inheritedUnidad = withUnidad?.operacion_unidadgestora ?? null
    const inheritedNIF = withNIF?.NIF_tercero ?? null

    setArbolInherited({ importeretenido: inheritedRetenido, aplicacion: inheritedAplicacion, unidadgestora: inheritedUnidad, nif_tercero: inheritedNIF })
    setForm(prev => ({
      ...prev,
      arbol_ID: arbolId,
      arbol_linked: true,
      ...(inheritedRetenido != null && { operacion_importeretenido: inheritedRetenido }),
      ...(inheritedAplicacion != null && { operacion_aplicacion: inheritedAplicacion }),
      ...(inheritedUnidad != null && { operacion_unidadgestora: inheritedUnidad }),
      ...(inheritedNIF != null && { NIF_tercero: inheritedNIF }),
    }))
    setShowArbolPicker(false)
    setArbolSearch('')
  }

  const clearArbol = () => {
    setForm(prev => ({
      ...prev,
      arbol_ID: '',
      arbol_linked: false,
      ...(arbolInherited.importeretenido != null && { operacion_importeretenido: '' }),
      ...(arbolInherited.aplicacion != null && { operacion_aplicacion: '' }),
      ...(arbolInherited.unidadgestora != null && { operacion_unidadgestora: '' }),
      ...(arbolInherited.nif_tercero != null && { NIF_tercero: '' }),
    }))
    setArbolInherited({ importeretenido: null, aplicacion: null, unidadgestora: null, nif_tercero: null })
  }

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.operacion_tipo) return setError('El tipo de operación es obligatorio.')
    if (!form.operacion_aplicacion) return setError('La aplicación presupuestaria es obligatoria.')
    if (!form.operacion_fecha) return setError('La fecha de la operación es obligatoria.')
    if (isOADO && (form.operacion_importegastado === '' || form.operacion_importegastado === null)) {
      return setError('El importe gastado es obligatorio para operaciones de tipo O o ADO.')
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/operaciones/${operacion.operacion_ID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al validar la operación.')
      await onSaved?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '640px',
        maxHeight: '90vh',
        overflowY: 'auto',
        zIndex: 1001,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          borderRadius: '16px 16px 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem',
            }}>
              ⚠️
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Completar Operación Pendiente
              </h2>
              <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, marginTop: 2 }}>
                ID: <strong style={{ color: '#92400e', fontFamily: 'monospace' }}>{operacion.operacion_ID}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '1.25rem', color: '#94a3b8', padding: '4px',
              lineHeight: 1, borderRadius: '6px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Warning banner */}
        <div style={{
          margin: '1rem 1.5rem 0',
          padding: '0.6rem 0.9rem',
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: '#92400e',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>⚠️</span>
          Esta operación no tiene Árbol ID asignado. Complete los campos faltantes y haga clic en <strong>Validar Operación</strong>.
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

            {/* Tipo de operación */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Tipo de operación <Required />
              </label>
              <select
                value={form.operacion_tipo}
                onChange={e => set('operacion_tipo', e.target.value)}
                style={inputStyle}
                required
              >
                {TIPOS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* RC Número - auto-generated preview, only shown for type RC */}
            {isRC && (
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>
                  RC Número
                  <PendingBadge />
                </label>
                <div style={{
                  ...inputStyle,
                  background: '#fffbeb',
                  color: '#92400e',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  cursor: 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <span style={{ fontSize: '0.75rem' }}>⚡</span>{nextRCPreview}
                </div>
              </div>
            )}

            {/* Árbol ID — campo pendiente principal */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                ID Árbol
                <PendingBadge />
              </label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', position: 'relative' }}>
                <div style={{
                  ...inputStyle,
                  flex: 1,
                  background: form.arbol_linked ? '#eff6ff' : '#fffbeb',
                  color: form.arbol_linked ? '#2563eb' : '#92400e',
                  borderColor: form.arbol_linked ? '#bfdbfe' : '#fde68a',
                  fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '6px',
                  cursor: 'not-allowed',
                }}>
                  {form.arbol_linked
                    ? <><span>🔗</span>{form.arbol_ID}</>
                    : <><span style={{ fontSize: '0.75rem' }}>⚡</span>{operacion.operacion_ID} (auto)</>
                  }
                </div>
                {form.arbol_linked && (
                  <button
                    type="button"
                    onClick={clearArbol}
                    title="Desvincular árbol"
                    style={{
                      padding: '6px 8px', border: '1px solid #e2e8f0',
                      borderRadius: '8px', background: '#fff', cursor: 'pointer',
                      fontSize: '0.75rem', color: '#ef4444',
                    }}
                  >
                    ✕
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowArbolPicker(v => !v)}
                  title="Vincular a árbol existente"
                  style={{
                    padding: '6px 10px', border: '1px solid #d1d5db',
                    borderRadius: '8px', background: '#fff', cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  🔍
                </button>

                {/* Arbol picker dropdown */}
                {showArbolPicker && (
                  <div style={{
                    position: 'absolute', top: '110%', right: 0,
                    background: '#fff', border: '1px solid #e2e8f0',
                    borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    width: '280px', zIndex: 10, padding: '0.75rem',
                  }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                      Vincular a árbol existente
                    </p>
                    <input
                      type="text"
                      placeholder="Buscar ID árbol..."
                      value={arbolSearch}
                      onChange={e => setArbolSearch(e.target.value)}
                      autoFocus
                      style={{ ...inputStyle, marginBottom: '0.5rem', fontSize: '0.8rem' }}
                    />
                    <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                      {filteredArbolIDs.length === 0 && (
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', padding: '0.5rem 0' }}>
                          Sin resultados
                        </p>
                      )}
                      {filteredArbolIDs.map(id => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => selectArbol(id)}
                          style={{
                            display: 'block', width: '100%', textAlign: 'left',
                            padding: '6px 8px', borderRadius: '6px',
                            border: 'none', background: 'none', cursor: 'pointer',
                            fontSize: '0.8rem', fontFamily: 'inherit',
                            color: '#374151', fontWeight: 500,
                          }}
                          onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
                          onMouseOut={e => e.currentTarget.style.background = 'none'}
                        >
                          {id}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Aplicación */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Aplicación
                {form.arbol_linked && arbolInherited.aplicacion != null && <InheritedBadge />}
              </label>
              <select
                value={form.operacion_aplicacion}
                onChange={e => set('operacion_aplicacion', e.target.value)}
                style={{
                  ...inputStyle,
                  ...(form.arbol_linked && arbolInherited.aplicacion != null ? { background: '#eff6ff', borderColor: '#bfdbfe' } : {}),
                }}
              >
                <option value="">— Seleccionar —</option>
                {(aplicaciones || []).map(a => (
                  <option key={a.aplicacion_presup} value={a.aplicacion_presup}>
                    {a.aplicacion_presup}
                  </option>
                ))}
              </select>
            </div>

            {/* Importe Retenido */}
            {showImporteRetenido && (
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>
                  Importe Retenido
                  {form.arbol_linked && arbolInherited.importeretenido != null && <InheritedBadge />}
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.operacion_importeretenido}
                  onChange={e => set('operacion_importeretenido', e.target.value)}
                  style={{
                    ...inputStyle,
                    ...(form.arbol_linked && arbolInherited.importeretenido != null ? { background: '#eff6ff', borderColor: '#bfdbfe' } : {}),
                  }}
                />
              </div>
            )}

            {/* Importe Gastado — solo O o ADO */}
            {isOADO && (
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Importe Gastado <Required /></label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.operacion_importegastado}
                  onChange={e => set('operacion_importegastado', e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}

            {/* Fecha */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Fecha operación</label>
              <input
                type="date"
                value={form.operacion_fecha}
                onChange={e => set('operacion_fecha', e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Unidad Gestora */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Unidad Gestora
                {form.arbol_linked && arbolInherited.unidadgestora != null && <InheritedBadge />}
              </label>
              <input
                type="text"
                placeholder="Texto libre..."
                value={form.operacion_unidadgestora}
                onChange={e => set('operacion_unidadgestora', e.target.value)}
                style={{
                  ...inputStyle,
                  ...(form.arbol_linked && arbolInherited.unidadgestora != null ? { background: '#eff6ff', borderColor: '#bfdbfe' } : {}),
                }}
              />
            </div>

            {/* NIF Tercero */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                NIF Tercero
                {form.arbol_linked && arbolInherited.nif_tercero != null && <InheritedBadge />}
              </label>
              <input
                type="text"
                placeholder="Ej: 12345678A"
                value={form.NIF_tercero}
                onChange={e => set('NIF_tercero', e.target.value)}
                style={{
                  ...inputStyle,
                  ...(form.arbol_linked && arbolInherited.nif_tercero != null ? { background: '#eff6ff', borderColor: '#bfdbfe' } : {}),
                }}
              />
            </div>

            {/* Expediente Código */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Expediente relacionado</label>
              <input
                type="text"
                placeholder="Código de expediente..."
                value={form.expediente_codigo}
                onChange={e => set('expediente_codigo', e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Descripción — full width */}
            <div style={{ ...fieldGroupStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Descripción</label>
              <textarea
                placeholder="Descripción de la operación..."
                value={form.operacion_descripcion}
                onChange={e => set('operacion_descripcion', e.target.value)}
                rows={3}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  minHeight: '72px',
                  lineHeight: 1.5,
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              fontSize: '0.825rem',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: '10px',
            marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 20px', fontSize: '0.875rem', fontFamily: 'inherit',
                background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px',
                cursor: 'pointer', color: '#374151', fontWeight: 500,
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '9px 24px', fontSize: '0.875rem', fontFamily: 'inherit',
                background: saving ? '#86efac' : 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#fff', border: 'none', borderRadius: '8px',
                cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600,
                boxShadow: saving ? 'none' : '0 2px 6px rgba(22,163,74,0.35)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {saving ? (
                <><span>⏳</span> Validando...</>
              ) : (
                <><span>✓</span> Validar Operación</>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

function Required() {
  return <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>
}

function PendingBadge() {
  return (
    <span style={{
      marginLeft: 6, fontSize: '0.68rem', color: '#92400e',
      background: '#fef3c7', padding: '1px 6px', borderRadius: '4px',
      border: '1px solid #fde68a',
    }}>
      pendiente
    </span>
  )
}

function InheritedBadge() {
  return (
    <span style={{
      marginLeft: 6, fontSize: '0.68rem', color: '#2563eb',
      background: '#eff6ff', padding: '1px 6px', borderRadius: '4px',
    }}>
      heredado del árbol
    </span>
  )
}
