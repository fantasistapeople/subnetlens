import { useMemo } from 'react'
import { ipToInt, padBin } from '../utils/subnet'

function parseOctets(ipInt, prefix) {
  const bin = padBin(ipInt)
  return Array.from({ length: 4 }, (_, oct) =>
    Array.from({ length: 8 }, (_, b) => {
      const idx = oct * 8 + b
      return { bit: bin[idx], isNet: idx < prefix }
    })
  )
}

function BinRow({ label, ipInt, prefix }) {
  const octets = useMemo(() => parseOctets(ipInt, prefix), [ipInt, prefix])

  return (
    <div className="bin-row">
      <div className="bin-title">{label}</div>
      <div className="bin-display">
        {octets.map((octet, oi) => (
          <div key={oi} className="bin-octet">
            {octet.map(({ bit, isNet }, bi) => (
              <div key={bi} className={`bin-bit ${isNet ? 'net' : 'host'}`}>
                {bit}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BinaryVisualizer({ result }) {
  if (!result) {
    return (
      <div className="empty-state" style={{ padding: '30px 20px' }}>
        <p>Binary representation will appear here</p>
      </div>
    )
  }

  const { ip, mask, network, prefix } = result
  const ipInt      = ipToInt(ip)
  const maskInt    = ipToInt(mask)
  const networkInt = ipToInt(network)

  return (
    <div className="binary-wrap animate-in">
      <BinRow label={`IP Address — ${ip}`}          ipInt={ipInt}      prefix={prefix} />
      <BinRow label={`Subnet Mask — ${mask}`}        ipInt={maskInt}    prefix={prefix} />
      <BinRow label={`Network Address — ${network}`} ipInt={networkInt} prefix={prefix} />

      <div className="bin-legend">
        <div className="bin-legend-item">
          <div className="legend-dot net" />
          Network portion (/{prefix})
        </div>
        <div className="bin-legend-item">
          <div className="legend-dot host" />
          Host portion ({32 - prefix} bits)
        </div>
      </div>
    </div>
  )
}
