import { useState } from 'react'
import { rangeToCidr, validateIP } from '../utils/subnet'

function getFieldError(startIp, endIp) {
  if (!startIp && !endIp) return { start: '', end: '' }
  const errors = { start: '', end: '' }
  if (startIp && !validateIP(startIp)) errors.start = '✗ Invalid IP format'
  if (endIp   && !validateIP(endIp))   errors.end   = '✗ Invalid IP format'
  return errors
}

export default function RangeConverter() {
  const [startIp, setStartIp] = useState('')
  const [endIp,   setEndIp]   = useState('')
  const [result,  setResult]  = useState(null)

  const fieldErrors = getFieldError(startIp, endIp)
  const hasError    = Boolean(fieldErrors.start || fieldErrors.end)

  const handleConvert = () => {
    setResult(rangeToCidr(startIp.trim(), endIp.trim()))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !hasError) handleConvert()
  }

  const loadExample = (s, e) => { setStartIp(s); setEndIp(e); setResult(null) }

  return (
    <>
      <div className="page-header">
        <h1>IP Range <span>to CIDR</span></h1>
        <p>Convert an IP address range into the minimal set of CIDR blocks that exactly cover it.</p>
      </div>

      <div className="calc-grid">
        <div>
          <div className="card">
            <div className="card-label">Input Range</div>

            <div className="input-group">
              <label className="input-label">Start IP Address</label>
              <div className={`ip-input-row${fieldErrors.start ? ' error' : ''}`}>
                <input
                  className="ip-field"
                  type="text"
                  placeholder="10.0.0.0"
                  value={startIp}
                  onChange={(e) => { setStartIp(e.target.value); setResult(null) }}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="error-msg">{fieldErrors.start}</div>
            </div>

            <div className="input-group">
              <label className="input-label">End IP Address</label>
              <div className={`ip-input-row${fieldErrors.end ? ' error' : ''}`}>
                <input
                  className="ip-field"
                  type="text"
                  placeholder="10.0.0.255"
                  value={endIp}
                  onChange={(e) => { setEndIp(e.target.value); setResult(null) }}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="error-msg">{fieldErrors.end}</div>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: '4px' }}
              onClick={handleConvert}
              disabled={hasError}
            >
              Convert to CIDR
            </button>

            <div style={{ marginTop: '20px' }}>
              <div className="input-label">Examples</div>
              <div className="presets" style={{ flexDirection: 'column', gap: '8px' }}>
                <button className="preset-btn" style={{ textAlign: 'left', width: '100%' }}
                  onClick={() => loadExample('192.168.1.0', '192.168.1.63')}>
                  192.168.1.0 – 192.168.1.63 <span style={{ color: 'var(--green)', marginLeft: 8 }}>Exact /26</span>
                </button>
                <button className="preset-btn" style={{ textAlign: 'left', width: '100%' }}
                  onClick={() => loadExample('10.0.0.0', '10.0.0.100')}>
                  10.0.0.0 – 10.0.0.100 <span style={{ color: 'var(--amber)', marginLeft: 8 }}>Multiple blocks</span>
                </button>
                <button className="preset-btn" style={{ textAlign: 'left', width: '100%' }}
                  onClick={() => loadExample('172.16.0.0', '172.31.255.255')}>
                  172.16.0.0 – 172.31.255.255 <span style={{ color: 'var(--green)', marginLeft: 8 }}>Exact /12</span>
                </button>
                <button className="preset-btn" style={{ textAlign: 'left', width: '100%' }}
                  onClick={() => loadExample('192.168.0.1', '192.168.0.200')}>
                  192.168.0.1 – 192.168.0.200 <span style={{ color: 'var(--amber)', marginLeft: 8 }}>Unaligned range</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-label">CIDR Blocks</div>

            {!result ? (
              <div className="empty-state">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5">
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                </svg>
                <p>Enter a start and end IP to see the result</p>
              </div>
            ) : result.error ? (
              <p style={{ color: 'var(--red)', fontSize: '13px', fontFamily: 'var(--mono)', padding: '8px 0' }}>
                ✗ {result.error}
              </p>
            ) : (
              <div className="animate-in">
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: result.isExact ? 'rgba(74,222,128,.08)' : 'rgba(251,191,36,.08)',
                  border: `1px solid ${result.isExact ? 'rgba(74,222,128,.25)' : 'rgba(251,191,36,.25)'}`,
                  borderRadius: 10, padding: '12px 16px', marginBottom: 16,
                }}>
                  <span style={{ fontSize: 20 }}>{result.isExact ? '✅' : '⚠️'}</span>
                  <div>
                    <div style={{
                      fontSize: 12, fontWeight: 600,
                      color: result.isExact ? 'var(--green)' : 'var(--amber)',
                      marginBottom: 2,
                    }}>
                      {result.isExact ? 'Exact CIDR Match' : `${result.blocks.length} CIDR Blocks Required`}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                      Total addresses in range:{' '}
                      <strong style={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}>
                        {result.totalAddresses.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="subnet-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>CIDR Block</th>
                        <th>Network</th>
                        <th>Broadcast</th>
                        <th>Total IPs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.blocks.map((b, i) => (
                        <tr key={i}>
                          <td style={{ color: 'var(--text-2)', fontFamily: 'var(--sans)' }}>{i + 1}</td>
                          <td className="td-network">{b.cidr}</td>
                          <td>{b.network}</td>
                          <td>{b.broadcast}</td>
                          <td className="td-hosts">{b.totalIps.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!result.isExact && (
                  <div className="info-banner" style={{ marginTop: 16, marginBottom: 0 }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                    <span>
                      This range cannot be expressed as a single CIDR block because it is not aligned
                      to a power-of-2 boundary. The minimal covering requires{' '}
                      <strong>{result.blocks.length} blocks</strong>.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
