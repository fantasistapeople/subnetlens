import { useState, useMemo } from 'react'
import { calcSubnet, validateIP } from '../utils/subnet'
import BinaryVisualizer from './BinaryVisualizer'

const PRESETS = [
  { label: '10.0.0.0/8',       ip: '10.0.0.0',     cidr: '8'  },
  { label: '172.16.0.0/12',    ip: '172.16.0.0',   cidr: '12' },
  { label: '192.168.0.0/16',   ip: '192.168.0.0',  cidr: '16' },
  { label: '192.168.1.0/24',   ip: '192.168.1.0',  cidr: '24' },
  { label: '10.10.0.0/22',     ip: '10.10.0.0',    cidr: '22' },
  { label: '172.31.255.0/28',  ip: '172.31.255.0', cidr: '28' },
]

const BADGE_MAP = {
  private:     { cls: 'badge-private',   icon: '🔒', label: 'Private'    },
  public:      { cls: 'badge-public',    icon: '🌐', label: 'Public'     },
  loopback:    { cls: 'badge-loopback',  icon: '↩',  label: 'Loopback'  },
  multicast:   { cls: 'badge-multicast', icon: '📡', label: 'Multicast'  },
  'link-local':{ cls: 'badge-linklocal', icon: '🔗', label: 'Link-Local' },
}

function getErrorMsg(ip, cidr) {
  if (!ip && !cidr) return ''
  if (ip && !validateIP(ip)) return '✗ Invalid IP address format'
  if (ip && cidr === '') return '✗ Prefix length is required (0–32)'
  const p = parseInt(cidr, 10)
  if (cidr !== '' && (isNaN(p) || p < 0 || p > 32)) return '✗ Prefix must be between 0 and 32'
  return ''
}

function ResultItem({ label, value, full, large, onCopy }) {
  return (
    <div className={`result-item${full ? ' full' : ''}`} onClick={() => onCopy(String(value))}>
      <div className="result-key">{label}</div>
      <div className={large ? 'result-host-count' : 'result-val'}>{value}</div>
    </div>
  )
}

export default function Calculator({ onCopy }) {
  const [ip,   setIp]   = useState('192.168.1.0')
  const [cidr, setCidr] = useState('24')

  const result = useMemo(() => {
    const p = parseInt(cidr, 10)
    if (!ip || cidr === '' || isNaN(p) || p < 0 || p > 32) return null
    return calcSubnet(ip, cidr)
  }, [ip, cidr])

  const errorMsg  = getErrorMsg(ip, cidr)
  const hasError  = Boolean(errorMsg)
  const cidrNum   = Math.min(Math.max(parseInt(cidr, 10) || 0, 0), 32)
  const sliderPct = `${(cidrNum / 32) * 100}%`

  const handleSlider = (e) => setCidr(e.target.value)

  const loadPreset = (p) => { setIp(p.ip); setCidr(p.cidr) }

  return (
    <>
      <div className="page-header">
        <h1>IP Subnet <span>Calculator</span></h1>
        <p>Enter an IP address with CIDR notation to compute all subnet parameters in real-time.</p>
      </div>

      <div className="calc-grid">

        <div>
          <div className="card">
            <div className="card-label">Input</div>

            <div className="input-group">
              <label className="input-label">IP Address / CIDR</label>
              <div className={`ip-input-row${hasError ? ' error' : ''}`}>
                <input
                  className="ip-field"
                  type="text"
                  placeholder="192.168.1.0"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                />
                <span className="cidr-sep">/</span>
                <input
                  className="cidr-field"
                  type="text"
                  placeholder="24"
                  maxLength={2}
                  value={cidr}
                  onChange={(e) => setCidr(e.target.value)}
                />
              </div>
              <div className="error-msg">{errorMsg}</div>

              <div className="slider-row">
                <span className="slider-label">0</span>
                <input
                  type="range"
                  min="0" max="32"
                  value={cidrNum}
                  style={{ '--pct': sliderPct }}
                  onChange={handleSlider}
                />
                <span className="slider-label">32</span>
              </div>
            </div>

            <div>
              <div className="input-label">Quick Presets</div>
              <div className="presets">
                {PRESETS.map((p) => (
                  <button key={p.label} className="preset-btn" onClick={() => loadPreset(p)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {result && (
              <div className="ip-meta">
                {(() => {
                  const badge = BADGE_MAP[result.ipType]
                  return badge ? (
                    <span className={`ip-badge ${badge.cls}`}>
                      {badge.icon} {badge.label}
                    </span>
                  ) : null
                })()}
                <span className="ip-badge badge-class">
                  Class {result.ipClass}
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-label">Results</div>

            {result ? (
              <div className="result-grid animate-in">
                <ResultItem label="Network Address"    value={result.network}                  onCopy={onCopy} />
                <ResultItem label="Broadcast Address"  value={result.broadcast}                onCopy={onCopy} />
                <ResultItem label="Subnet Mask"        value={result.mask}                     onCopy={onCopy} />
                <ResultItem label="Wildcard Mask"      value={result.wildcard}                 onCopy={onCopy} />
                <ResultItem label="First Usable Host"  value={result.firstHost}                onCopy={onCopy} />
                <ResultItem label="Last Usable Host"   value={result.lastHost}                 onCopy={onCopy} />
                <ResultItem label="Total IPs"          value={result.totalIps.toLocaleString()} onCopy={onCopy} />
                <ResultItem label="Usable Hosts"       value={result.usable.toLocaleString()}  onCopy={onCopy} large />
                <ResultItem label="CIDR Notation"      value={result.cidr}                     onCopy={onCopy} full />
              </div>
            ) : (
              <div className="empty-state">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <p>Enter a valid IP address above to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-label">Binary Visualizer</div>
        <BinaryVisualizer result={result} />
      </div>
    </>
  )
}
