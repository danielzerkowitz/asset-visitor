export default function Sidebar({ view, counts, onNav, onNewLead }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', badge: '' },
    { id: 'assets', label: 'Assets', badge: String(counts.assets) },
    { id: 'leads', label: 'Leads', badge: String(counts.leads) },
    { id: 'pipeline', label: 'Pipeline', badge: String(counts.active) },
    { id: 'brokers', label: 'Brokers', badge: String(counts.brokers) },
    { id: 'managers', label: 'Asset managers', badge: String(counts.managers) },
    { id: 'config', label: 'Configuration', badge: '' },
  ]
  return (
    <aside className="sidebar">
      <div className="logo-row">
        <div className="logo-mark">A</div>
        <div>
          <div className="logo-name">Atlas</div>
          <div className="logo-sub">ASSET CRM</div>
        </div>
      </div>
      <button className="btn-primary" style={{ width: '100%' }} onClick={onNewLead}>
        <span className="plus">+</span>New lead
      </button>
      <nav className="nav">
        {items.map((n) => {
          const active = view === n.id || (n.id === 'assets' && view === 'detail') || (n.id === 'leads' && view === 'lead')
          return (
            <button
              key={n.id}
              className={`nav-item${active ? ' active' : ''}`}
              onClick={() => onNav(n.id)}
            >
              <span>{n.label}</span>
              <span className="nav-badge">{n.badge}</span>
            </button>
          )
        })}
      </nav>
      <div style={{ flex: 1 }} />
      <div className="user-row">
        <div className="user-avatar">LV</div>
        <div>
          <div className="user-name">Lena Vos</div>
          <div className="user-role">ASSET MANAGER</div>
        </div>
      </div>
    </aside>
  )
}
