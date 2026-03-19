'use client'

import { useState, useMemo, useEffect } from 'react'

// textFields: [{ key, label }]
// numFields:  [{ key, label }]
// allColumns: [string]
// columnLabels: { [key]: string }
// tipoBadgeColors: { [tipo]: { bg, color, border } }
export default function DataTable({
  rows,
  textFields = [],
  numFields = [],
  allColumns = [],
  columnLabels = {},
  tipoBadgeColors = {},
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({})
  const [columnOrder, setColumnOrder] = useState(allColumns)
  const [draggedCol, setDraggedCol] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  useEffect(() => {
    setColumnOrder(allColumns)
  }, [allColumns.join(',')])

  const setFilter = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }))

  const resetFilters = () => setFilters({})

  const activeCount = Object.values(filters).filter(v => v !== '' && v !== undefined).length

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    let result = rows.filter(row => {
      for (const { key } of textFields) {
        const val = filters[key]
        if (val && !String(row[key] ?? '').toLowerCase().includes(val.toLowerCase())) return false
      }
      for (const { key } of numFields) {
        const min = filters[`${key}_min`]
        const max = filters[`${key}_max`]
        const v = Number(row[key])
        if (min !== '' && min !== undefined && !isNaN(Number(min)) && v < Number(min)) return false
        if (max !== '' && max !== undefined && !isNaN(Number(max)) && v > Number(max)) return false
      }
      return true
    })

    if (sortCol) {
      result = [...result].sort((a, b) => {
        const av = a[sortCol] ?? ''
        const bv = b[sortCol] ?? ''
        const cmp = String(av).localeCompare(String(bv), 'es', { numeric: true })
        return sortDir === 'asc' ? cmp : -cmp
      })
    }

    return result
  }, [rows, filters, textFields, numFields, sortCol, sortDir])

  // Drag and drop handlers
  const handleDragStart = (e, col) => {
    setDraggedCol(col)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, col) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (col !== draggedCol) setDragOverCol(col)
  }

  const handleDrop = (e, targetCol) => {
    e.preventDefault()
    if (!draggedCol || draggedCol === targetCol) {
      setDraggedCol(null)
      setDragOverCol(null)
      return
    }
    setColumnOrder(prev => {
      const next = [...prev]
      const fromIdx = next.indexOf(draggedCol)
      const toIdx = next.indexOf(targetCol)
      next.splice(fromIdx, 1)
      next.splice(toIdx, 0, draggedCol)
      return next
    })
    setDraggedCol(null)
    setDragOverCol(null)
  }

  const handleDragEnd = () => {
    setDraggedCol(null)
    setDragOverCol(null)
  }

  const colLabel = (col) => columnLabels[col] || col

  return (
    <>
      {/* Filter accordion */}
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        marginBottom: '1rem',
        overflow: 'hidden',
      }}>
        <button
          onClick={() => setFiltersOpen(o => !o)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 1rem',
            background: filtersOpen ? '#f8fafc' : '#fff',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 600,
            fontSize: '0.85rem',
            color: '#374151',
            transition: 'background 0.15s',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔍</span>
            <span>Filtros</span>
            {activeCount > 0 && (
              <span style={{
                background: '#2563eb',
                color: '#fff',
                borderRadius: '20px',
                padding: '1px 8px',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}>
                {activeCount} activo{activeCount !== 1 ? 's' : ''}
              </span>
            )}
          </span>
          <span style={{
            fontSize: '0.7rem',
            color: '#94a3b8',
            transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
            display: 'inline-block',
          }}>▼</span>
        </button>

        {filtersOpen && (
          <div style={{
            padding: '1rem',
            borderTop: '1px solid #e2e8f0',
            background: '#fafbfc',
          }}>
            {textFields.length > 0 && (
              <>
                <p style={{
                  fontSize: '0.7rem', fontWeight: 700, color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem',
                }}>
                  Texto (contiene)
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '0.6rem 1rem',
                  marginBottom: '0.85rem',
                }}>
                  {textFields.map(({ key, label }) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginBottom: '3px', fontWeight: 500 }}>
                        {label}
                      </label>
                      <input
                        type="text"
                        placeholder="buscar..."
                        value={filters[key] ?? ''}
                        onChange={e => setFilter(key, e.target.value)}
                        style={{
                          width: '100%', padding: '5px 8px', fontSize: '0.8rem',
                          border: '1px solid #d1d5db', borderRadius: '6px',
                          fontFamily: 'inherit', outline: 'none',
                          background: '#fff',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {numFields.length > 0 && (
              <>
                {textFields.length > 0 && <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginBottom: '0.85rem' }} />}
                <p style={{
                  fontSize: '0.7rem', fontWeight: 700, color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem',
                }}>
                  Numérico (rango)
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '0.6rem 1rem',
                  marginBottom: '0.85rem',
                }}>
                  {numFields.map(({ key, label }) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginBottom: '3px', fontWeight: 500 }}>
                        {label}
                      </label>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input
                          type="number"
                          placeholder="mín"
                          value={filters[`${key}_min`] ?? ''}
                          onChange={e => setFilter(`${key}_min`, e.target.value)}
                          style={{
                            flex: 1, padding: '5px 6px', fontSize: '0.8rem',
                            border: '1px solid #d1d5db', borderRadius: '6px',
                            fontFamily: 'inherit', outline: 'none', background: '#fff',
                          }}
                        />
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>–</span>
                        <input
                          type="number"
                          placeholder="máx"
                          value={filters[`${key}_max`] ?? ''}
                          onChange={e => setFilter(`${key}_max`, e.target.value)}
                          style={{
                            flex: 1, padding: '5px 6px', fontSize: '0.8rem',
                            border: '1px solid #d1d5db', borderRadius: '6px',
                            fontFamily: 'inherit', outline: 'none', background: '#fff',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <button
              onClick={resetFilters}
              style={{
                padding: '5px 14px', fontSize: '0.78rem',
                background: '#fff', border: '1px solid #d1d5db',
                borderRadius: '6px', cursor: 'pointer',
                fontFamily: 'inherit', color: '#374151',
              }}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
          <strong style={{ color: '#0f172a' }}>{filtered.length}</strong> resultado{filtered.length !== 1 ? 's' : ''}
          {filtered.length !== rows.length && (
            <span style={{ color: '#94a3b8' }}> de {rows.length}</span>
          )}
        </p>
        <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
          ↔ Arrastra columnas para reordenar
        </p>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
          Sin resultados para los filtros aplicados.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.82rem', width: '100%', minWidth: 'max-content' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {columnOrder.map(col => (
                  <th
                    key={col}
                    draggable
                    onDragStart={e => handleDragStart(e, col)}
                    onDragOver={e => handleDragOver(e, col)}
                    onDrop={e => handleDrop(e, col)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleSort(col)}
                    style={{
                      padding: '10px 14px',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      userSelect: 'none',
                      borderBottom: '2px solid #e2e8f0',
                      borderRight: '1px solid #e2e8f0',
                      textAlign: 'left',
                      opacity: draggedCol === col ? 0.4 : 1,
                      borderLeft: dragOverCol === col && dragOverCol !== draggedCol
                        ? '3px solid #2563eb'
                        : '3px solid transparent',
                      transition: 'border-left 0.1s, opacity 0.1s',
                      background: sortCol === col ? '#eff6ff' : undefined,
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ cursor: 'grab', color: '#cbd5e1', fontSize: '0.7rem' }}>⠿</span>
                      {colLabel(col)}
                      {sortCol === col && (
                        <span style={{ color: '#2563eb', fontSize: '0.65rem' }}>
                          {sortDir === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  style={{
                    background: i % 2 === 0 ? '#fff' : '#fafbfc',
                    transition: 'background 0.1s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
                  onMouseOut={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafbfc'}
                >
                  {columnOrder.map(col => (
                    <td
                      key={col}
                      style={{
                        padding: '9px 14px',
                        borderBottom: '1px solid #f1f5f9',
                        borderRight: '1px solid #f1f5f9',
                        whiteSpace: 'nowrap',
                        color: '#374151',
                        maxWidth: '260px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {col === 'operacion_tipo' && row[col] && tipoBadgeColors[row[col]]
                        ? <TipoBadge tipo={row[col]} colors={tipoBadgeColors[row[col]]} />
                        : formatCell(col, row[col])
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function TipoBadge({ tipo, colors }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      background: colors.bg,
      color: colors.color,
      border: `1px solid ${colors.border}`,
    }}>
      {tipo}
    </span>
  )
}

function formatCell(col, value) {
  if (value === null || value === undefined || value === '') return (
    <span style={{ color: '#cbd5e1' }}>—</span>
  )
  if (col.includes('fecha') || col.includes('_at')) {
    try {
      const d = new Date(value)
      if (!isNaN(d)) return d.toLocaleString('es-ES', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      })
    } catch {}
  }
  if (col.includes('importe') || col.includes('Importe')) {
    const n = Number(value)
    if (!isNaN(n)) return new Intl.NumberFormat('es-ES', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
    }).format(n)
  }
  return String(value)
}
