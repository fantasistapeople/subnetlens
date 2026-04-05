import { useState } from 'react'
import { checkOverlaps } from '../utils/subnet'

const DEFAULT_ROWS = ['192.168.1.0/24', '192.168.1.128/25', '10.0.0.0/8', '']

const OVERLAP_COLORS = {
  identical: { bg: 'rgba(248,113,113,.10)', border: 'rgba(248,113,113,.3)',  icon: '🔴', label: 'Identical',      color: 'var(--red)'    },
  subset:    { bg: 'rgba(251,191,36,.08)',  border: 'rgba(251,191,36,.3)',   icon: '⚠️', label: 'Subset',         color: 'var(--amber)'  },
  partial:   { bg: 'rgba(251,191,36,.08)',  border: 'rgba(251,191,36,.3)',   icon: '⚠️', label: 'Partial Overlap', color: 'var(--amber)'  },
}

export default function OverlapChecker() {
  const [rows,   setRows]   = useState(DEFAULT_ROWS)
  const [result, setResult] = useState(null)

  const updateRow = (i, val) => {
    const next = [...rows]
    next[i] = val
    setRows(next)
    setResult(null)
  }

  const addRow = () => {
    if (rows.length < 12) setRows([...rows, ''])
  }

  const removeRow = (i) => {
    if (rows.length <= 2) return
    setRows(rows.filter((_, idx) => idx !== i))
    setResult(null)
  }

  const handleCheck = () => {
    const filled = rows.filter((r) => r.trim())
    setResult(checkOverlaps(filled))
  }

  const loadExample = (list) => { setRows([...list, '']); setResult(null) }

  return (
    <>
      <div className="page-header">
        <h1>Network <span>Overlap Checker</span></h1>
        <p>Enter multiple networks to detect conflicts — subsets, supersets, or partial overlaps.</p>
      </div>

      <div className="calc-grid">
        <div>
          <div className="card">
            <div className="card-label">Networks</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {rows.map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 11,
                    color: 'var(--text-3)', minWidth: 20, textAlign: 'right',
                  }}>
                    {i + 1}
                  </span>

                  <div className="ip-input-row" style={{ flex: 1 }}>
                    <input
                      className="ip-field"
                      type="text"
                      placeholder="e.g. 192.168.1.0/24"
                      value={row}
                      onChange={(e) => updateRow(i, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                      style={{ fontSize: 14 }}
                    />
                  </div>

                  <button
                    onClick={() => removeRow(i)}
                    disabled={rows.length <= 2}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      color: rows.length <= 2 ? 'var(--text-3)' : 'var(--red)',
                      width: 28, height: 28,
                      cursor: rows.length <= 2 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: 16, lineHeight: 1,
                      transition: 'all .15s',
                    }}
                    title="Remove row"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {rows.length < 12 && (
              <button
                onClick={addRow}
                style={{
                  width: '100%', marginBottom: 16,
                  background: 'none',
                  border: '1px dashed var(--border)',
                  borderRadius: 8, padding: '8px',
                  color: 'var(--text-3)', fontSize: 12,
                  cursor: 'pointer', transition: 'all .15s',
                  fontFamily: 'var(--sans)',
                }}
                onMouseEnter={(e) => { e.target.style.borderColor = 'var(--cyan-dim)'; e.target.style.color = 'var(--cyan)' }}
                onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-3)' }}
              >
                + Add Network
              </button>
            )}

            <button className="btn-primary" style={{ width: '100%' }} onClick={handleCheck}>
              Check Overlaps
            </button>

            <div style={{ marginTop: 20 }}>
              <div className="input-label">Load Examples</div>
              <div className="presets" style={{ flexDirection: 'column', gap: 8 }}>
                <button className="preset-btn" style={{ textAlign: 'left', width: '100%' }}
                  onClick={() => loadExample(['10.0.0.0/8', '10.0.0.0/16', '192.168.1.0/24'])}>
                  Subnet inside parent network
                </button>
                <button className="preset-btn" style={{ textAlign: 'left', width: '100%' }}
                  onClick={() => loadExample(['172.16.0.0/24', '172.16.0.128/25', '192.168.0.0/24'])}>
                  Overlapping ranges + clean network
                </button>
                <button className="preset-btn" style={{ textAlign: 'left', width: '100%' }}
                  onClick={() => loadExample(['10.0.0.0/24', '10.0.1.0/24', '10.0.2.0/24'])}>
                  Three clean, non-overlapping networks ✅
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div className="card">
            <div className="card-label">Result</div>

            {!result ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <p>Click "Check Overlaps" to analyse your networks</p>
              </div>
            ) : result.error ? (
              <p style={{ color: 'var(--red)', fontSize: '13px', fontFamily: 'var(--mono)' }}>
                ✗ {result.error}
              </p>
            ) : (
              <div className="animate-in">
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: result.hasConflict ? 'rgba(248,113,113,.08)' : 'rgba(74,222,128,.08)',
                  border: `1px solid ${result.hasConflict ? 'rgba(248,113,113,.25)' : 'rgba(74,222,128,.25)'}`,
                  borderRadius: 10, padding: '14px 16px', marginBottom: 16,
                }}>
                  <span style={{ fontSize: 24 }}>{result.hasConflict ? '🔴' : '✅'}</span>
                  <div>
                    <div style={{
                      fontSize: 13, fontWeight: 700,
                      color: result.hasConflict ? 'var(--red)' : 'var(--green)',
                      marginBottom: 3,
                    }}>
                      {result.hasConflict
                        ? `${result.overlaps.length} Conflict${result.overlaps.length > 1 ? 's' : ''} Detected`
                        : 'No Conflicts — All Networks are Clean'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                      {result.networks.length} networks analysed
                    </div>
                  </div>
                </div>

                {result.hasConflict && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {result.overlaps.map((o, i) => {
                      const cfg = OVERLAP_COLORS[o.type]
                      return (
                        <div key={i} style={{
                          background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                          borderRadius: 8, padding: '10px 14px',
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                        }}>
                          <span style={{ fontSize: 16, flexShrink: 0 }}>{cfg.icon}</span>
                          <div>
                            <span style={{
                              fontSize: 10, fontWeight: 700, letterSpacing: '1px',
                              textTransform: 'uppercase', color: cfg.color,
                              display: 'block', marginBottom: 3,
                            }}>
                              {cfg.label}
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--mono)' }}>
                              {o.desc}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>
                  Network Status
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.networks.map((n) => {
                    const conflicts = result.overlaps.filter(
                      (o) => o.i === n.index || o.j === n.index
                    )
                    const isClean = conflicts.length === 0

                    return (
                      <div key={n.index} style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--surface)',
                        border: `1px solid ${isClean ? 'var(--border)' : 'rgba(248,113,113,.2)'}`,
                        borderRadius: 8, padding: '10px 14px',
                      }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--cyan)' }}>
                          {n.cidr}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          color: isClean ? 'var(--green)' : 'var(--red)',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          {isClean ? '✓ Clean' : `✗ ${conflicts.length} conflict${conflicts.length > 1 ? 's' : ''}`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
