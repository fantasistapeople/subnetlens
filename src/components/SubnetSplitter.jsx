import { useState } from 'react'
import { splitSubnets } from '../utils/subnet'

export default function SubnetSplitter() {
  const [network, setNetwork] = useState('192.168.1.0/24')
  const [count,   setCount]   = useState('4')
  const [result,  setResult]  = useState(null)

  const handleCalculate = () => {
    setResult(splitSubnets(network, count))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCalculate()
  }

  return (
    <>
      <div className="page-header">
        <h1>Subnet <span>Splitter</span></h1>
        <p>Split a network into equal subnets by specifying how many subnets you need.</p>
      </div>

      <div className="card">
        <div className="card-label">Configuration</div>

        <div className="split-controls">
          <div className="form-group">
            <label className="form-label">Network</label>
            <input
              className="form-input"
              type="text"
              placeholder="192.168.1.0/24"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Split Into</label>
            <input
              className="form-input narrow"
              type="number"
              placeholder="4"
              min="2" max="256"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button className="btn-primary" onClick={handleCalculate}>
            Calculate Subnets
          </button>
        </div>

        {!result ? (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <p>Results will appear here — fill in the fields above and press Enter or click Calculate</p>
          </div>
        ) : result.error ? (
          <p style={{ color: 'var(--red)', fontSize: '13px', padding: '16px 0', fontFamily: 'var(--mono)' }}>
            ✗ {result.error}
          </p>
        ) : (
          <>
            {result.wasRounded && (
              <div className="info-banner">
                <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
                <span>
                  <strong>{count}</strong> is not a power of 2, so the network was split into{' '}
                  <strong>{result.actualCount}</strong> subnets instead (the next power of 2).
                  Subnets must always be split in powers of 2 due to binary addressing.
                </span>
              </div>
            )}

            <p style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '14px', lineHeight: 1.6 }}>
              Split{' '}
              <strong style={{ color: 'var(--cyan)' }}>{result.baseNetwork}</strong>
              {' '}into{' '}
              <strong style={{ color: 'var(--cyan)' }}>{result.actualCount}</strong>
              {' '}subnets (/{result.newPrefix}), each with{' '}
              <strong style={{ color: 'var(--green)' }}>{result.usablePerSubnet.toLocaleString()}</strong>
              {' '}usable hosts.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table className="subnet-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Network</th>
                    <th>Host Range</th>
                    <th>Broadcast</th>
                    <th>Usable Hosts</th>
                  </tr>
                </thead>
                <tbody className="animate-in">
                  {result.subnets.map((s) => (
                    <tr key={s.index}>
                      <td>Subnet {s.index}</td>
                      <td className="td-network">{s.network}</td>
                      <td>{s.hostRange}</td>
                      <td>{s.broadcast}</td>
                      <td className="td-hosts">{s.usable.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  )
}
