const TABS = [
  { id: 'calculator', label: 'Calculator'       },
  { id: 'splitter',   label: 'Subnet Splitter'  },
  { id: 'range',      label: 'Range to CIDR'    },
  { id: 'overlap',    label: 'Overlap Checker'  },
  { id: 'cheatsheet', label: 'CIDR Sheet'       },
]

export default function Nav({ activeTab, onTabChange }) {
  return (
    <nav className="nav">
      <a className="nav-logo" href="#">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
          <path d="M6 7h4M6 11h4M14 7h4M14 11h4" />
        </svg>
        SubnetLens
      </a>

      <div className="nav-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
