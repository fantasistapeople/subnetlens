import { useState, useMemo } from 'react'
import { buildCheatSheet } from '../utils/subnet'

const ALL_ROWS = buildCheatSheet()

export default function CidrCheatSheet() {
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return ALL_ROWS
    return ALL_ROWS.filter((r) =>
      `/${r.prefix} ${r.mask} ${r.wildcard} ${r.total} ${r.usable} ${r.netClass}`
        .toLowerCase()
        .includes(q)
    )
  }, [query])

  return (
    <>
      <div className="page-header">
        <h1>CIDR <span>Cheat Sheet</span></h1>
        <p>Quick reference for all prefix lengths — /0 through /32.</p>
      </div>

      <div className="card">
        <div className="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by CIDR, mask, or host count…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '70vh' }}>
          <table className="cheat-table">
            <thead>
              <tr>
                <th>CIDR</th>
                <th>Subnet Mask</th>
                <th>Wildcard</th>
                <th>Total IPs</th>
                <th>Usable Hosts</th>
                <th>Class</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((r) => (
                  <tr key={r.prefix}>
                    <td>/{r.prefix}</td>
                    <td>{r.mask}</td>
                    <td>{r.wildcard}</td>
                    <td>{r.total.toLocaleString()}</td>
                    <td>{r.usable.toLocaleString()}</td>
                    <td>{r.netClass}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-3)', padding: '32px' }}>
                    No results for "{query}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
