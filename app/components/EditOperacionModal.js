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

// Format datetime-local value from ISO string
function toDatetimeLocal(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (isNaN(d)) return ''
  // Format: YYYY-MM-DDTHH:MM
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EditOperacionModal({ operacion, onClose, aplicaciones, operaciones, onSaved }) {
  const [form, setForm] = useState({
    operacion_tipo: operacion.operacion_tipo || 'RC',
    arbol_ID: operacion.arbol_ID || '',
    arbol_linked: operacion.arbol_ID && operacion.arbol_ID !== operacion.operacion_ID,
    operacion_importeretenido: operacion.operacion_importeretenido ?? '',
    operacion_importegastado: operacion.operacion_importegastado ?? '',
    operacion_descripcion: operacion.operacion_descripcion || '',
    operacion_unidadgestora: operacion.operacion_unidadgestora || '',
    operacion_fecha: toDatetimeLocal(operacion.operacion_fecha),
    operacion_aplicacion: operacion.operacion_aplicacion || '',
    NIF_tercero: operacion.NIF_tercero || '',
    expediente_codigo: operacion.expediente_codigo || '',
  })

  const [showArbolPicker, setShowArbolPicker] = useState(false)
  const [arbolSearch, setArbolSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isRC = form.operacion_tipo === 'RC'
  const isOADO = form.operacion_tipo === 'O' || form.operacion_tipo === 'ADO'
  const showImporteRetenido = isRC || form.arbol_linked

  // Distinct arbol_IDs from existing operaciones (excluding this operation's own ID if it's a self-tree)
  const arbolIDs = useMemo(() => {
    const ids = new Set()
    ;(operaciones || []).forEach(op => { if (op.arbol_ID) ids.add(op.arbol_ID) })
    return [...ids].sort()
  }, [operaciones])

  const filteredArbolIDs = arbolSearch
    ? arbolIDs.filter(id => id.toLowerCase().includes(arbolSearch.toLowerCase()))
    : arbolIDs

  const selectArbol = (arbolId) => {
    setForm(prev => ({
      ...prev,
      arbol_ID: arbolId,
      arbol_linked: arbolId !== operacion.operacion_ID,
    }))
    setShowArbolPicker(false)
    setArbolSearch('')
  }

  const clearArbol = () => {
    setForm(prev => ({
      ...prev,
      arbol_ID: operacion.operacion_ID,
      arbol_linked: false,
    }))
  }

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.operacion_tipo) return setError('El tipo de operación es obligatorio.')

    setSaving(true)
    try {
      const res = await fetch(`/api/operaciones/${operacion.operacion_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar la operación.')
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
          background: 'linear-gradient(135deg, #fefce8, #fef9c3)',
          borderRadius: '16px 16px 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem',
            }}>
              ✏️
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Editar Operación
              </h2>
              <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, marginTop: 2 }}>
                ID: <strong style={{ color: '#ca8a04', fontFamily: 'monospace' }}>{operacion.operacion_ID}</strong>
                {operacion.RC_Numero && (
                  <span style={{ marginLeft: 8, color: '#1d4ed8' }}>{operacion.RC_Numero}</span>
                )}
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

            {/* Tipo de operación */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Tipo de operación <Required />
              </label>
              <select
                value={form.operacion_tipo}
                onChange={e => set('operacion_tipo', e.target.value)}
                style={{ ...inputStyle }}
                required
              >
                {TIPOS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* RC Número - read-only, show existing value */}
            {isRC && operacion.RC_Numero && (
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>RC Número <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 400 }}>(generado)</span></label>
                <div style={{
                  ...inputStyle,
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  cursor: 'not-allowed',
                }}>
                  {operacion.RC_Numero}
                </div>
              </div>
            )}

            {/* Aplicación */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Aplicación</label>
              <select
                value={form.operacion_aplicacion}
                onChange={e => set('operacion_aplicacion', e.target.value)}
                style={{ ...inputStyle }}
              >
                <option value="">— Seleccionar —</option>
                {(aplicaciones || []).map(a => (
                  <option key={a.aplicacion_presup} value={a.aplicacion_presup}>
                    {a.aplicacion_presup}
                  </option>
                ))}
              </select>
            </div>

            {/* Árbol ID */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>ID Árbol</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', position: 'relative' }}>
                <div style={{
                  ...inputStyle,
                  flex: 1,
                  background: form.arbol_linked ? '#eff6ff' : '#f8fafc',
                  color: form.arbol_linked ? '#2563eb' : '#94a3b8',
                  fontWeight: form.arbol_linked ? 600 : 400,
                  display: 'flex', alignItems: 'center', gap: '6px',
                  cursor: 'not-allowed',
                }}>
                  {form.arbol_linked
                    ? <><span>🔗</span>{form.arbol_ID}</>
                    : <><span style={{ fontSize: '0.75rem' }}>🌳</span>{form.arbol_ID || operacion.operacion_ID}</>
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
                  title="Seleccionar árbol existente"
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
                      Seleccionar árbol existente
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

            {/* Importe retenido */}
            {showImporteRetenido && (
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Importe Retenido</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.operacion_importeretenido}
                  onChange={e => set('operacion_importeretenido', e.target.value)}
                  style={{ ...inputStyle }}
                />
              </div>
            )}

            {/* Importe gastado */}
            {isOADO && (
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>
                  Importe Gastado <Required />
                </label>
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
                type="datetime-local"
                step="1"
                value={form.operacion_fecha}
                onChange={e => set('operacion_fecha', e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Unidad gestora */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Unidad Gestora</label>
              <input
                type="text"
                placeholder="Texto libre..."
                value={form.operacion_unidadgestora}
                onChange={e => set('operacion_unidadgestora', e.target.value)}
                style={{ ...inputStyle }}
              />
            </div>

            {/* NIF Tercero */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>NIF Tercero</label>
              <input
                type="text"
                placeholder="Ej: 12345678A"
                value={form.NIF_tercero}
                onChange={e => set('NIF_tercero', e.target.value)}
                style={{ ...inputStyle }}
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
                style={{ ...inputStyle }}
              />
            </div>

            {/* Descripción - full width */}
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
                background: saving ? '#fcd34d' : 'linear-gradient(135deg, #ca8a04, #a16207)',
                color: '#fff', border: 'none', borderRadius: '8px',
                cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600,
                boxShadow: saving ? 'none' : '0 2px 6px rgba(202,138,4,0.35)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {saving ? (
                <><span>⏳</span> Guardando...</>
              ) : (
                <><span>✓</span> Guardar Cambios</>
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
