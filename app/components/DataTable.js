'use client'

import { useState, useMemo } from 'react'

const styles = {
  panel: {
    border: '1px solid #ccc',
    borderRadius: '6px',
    marginBottom: '1rem',
    overflow: 'hidden',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.6rem 1rem',
    background: '#f0f4f8',
    cursor: 'pointer',
    userSelect: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  panelBody: {
    padding: '1rem',
    borderTop: '1px solid #ccc',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '0.75rem 1.25rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  label: {
    fontSize: '0.75rem',
    color: '#555',
    fontWeight: 500,
  },
  input: {
    padding: '4px 6px',
    fontSize: '0.8rem',
    border: '1px solid #bbb',
    borderRadius: '4px',
    width: '100%',
    boxSizing: 'border-box',
  },
  rangeRow: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#334',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    margin: '0 0 0.5rem',
  },
  divider: {
    margin: '0.85rem 0',
    border: 'none',
    borderTop: '1px solid #e0e0e0',
  },
  resetBtn: {
    marginTop: '0.85rem',
    padding: '5px 14px',
    fontSize: '0.8rem',
    background: '#e8ecf0',
    border: '1px solid #bbb',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  badge: {
    fontSize: '0.72rem',
    background: '#3b82f6',
    color: '#fff',
    borderRadius: '10px',
    padding: '1px 7px',
    marginLeft: '8px',
    fontWeight: 600,
  },
  chevron: {
    fontSize: '0.8rem',
    transition: 'transform 0.2s',
  },
}

// textFields: [{ key, label }]
// numFields:  [{ key, label }]
// allColumns: [string]
export default function DataTable({ rows, textFields = [], numFields = [], allColumns = [] }) {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState({})

  const setFilter = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }))

  const resetFilters = () => setFilters({})

  const activeCount = Object.values(filters).filter(v => v !== '' && v !== undefined).length

  const filtered = useMemo(() => {
    return rows.filter(row => {
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
  }, [rows, filters, textFields, numFields])

  return (
    <>
      {/* Filter panel */}
      <div style={styles.panel}>
        <div style={styles.panelHeader} onClick={() => setOpen(o => !o)} role="button" aria-expanded={open}>
          <span>
            Filtros
            {activeCount > 0 && <span style={styles.badge}>{activeCount}</span>}
          </span>
          <span style={{ ...styles.chevron, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
        </div>

        {open && (
          <div style={styles.panelBody}>
            {textFields.length > 0 && (
              <>
                <p style={styles.sectionTitle}>Campos de texto (contiene)</p>
                <div style={styles.grid}>
                  {textFields.map(({ key, label }) => (
                    <div key={key} style={styles.fieldGroup}>
                      <label style={styles.label}>{label}</label>
                      <input
                        type="text"
                        style={styles.input}
                        placeholder="buscar..."
                        value={filters[key] ?? ''}
                        onChange={e => setFilter(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {textFields.length > 0 && numFields.length > 0 && <hr style={styles.divider} />}

            {numFields.length > 0 && (
              <>
                <p style={styles.sectionTitle}>Campos numéricos (rango)</p>
                <div style={styles.grid}>
                  {numFields.map(({ key, label }) => (
                    <div key={key} style={styles.fieldGroup}>
                      <label style={styles.label}>{label}</label>
                      <div style={styles.rangeRow}>
                        <input
                          type="number"
                          style={styles.input}
                          placeholder="mín"
                          value={filters[`${key}_min`] ?? ''}
                          onChange={e => setFilter(`${key}_min`, e.target.value)}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#888' }}>–</span>
                        <input
                          type="number"
                          style={styles.input}
                          placeholder="máx"
                          value={filters[`${key}_max`] ?? ''}
                          onChange={e => setFilter(`${key}_max`, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <button style={styles.resetBtn} onClick={resetFilters}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <p style={{ fontSize: '0.82rem', color: '#555', margin: '0 0 0.5rem' }}>
        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        {filtered.length !== rows.length && ` de ${rows.length}`}
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <p>Sin resultados para los filtros aplicados.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr>
                {allColumns.map(col => (
                  <th
                    key={col}
                    style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f0f0f0', whiteSpace: 'nowrap' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id ?? i}>
                  {allColumns.map(col => (
                    <td key={col} style={{ border: '1px solid #ccc', padding: '4px 8px', whiteSpace: 'nowrap' }}>
                      {row[col] ?? ''}
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
