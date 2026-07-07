import { area } from '../units.js'
import { buildingCount, isActive, visitCount } from '../lib.js'

export default function Assets({ assets, leads, openAsset, onNewAsset }) {
  const totalSubs = assets.reduce((n, a) => n + a.subs.length, 0)
  const active = leads.filter(isActive)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Assets</h1>
          <div className="page-sub">
            {assets.length} assets · {totalSubs} buildings · {active.length} active leads
          </div>
        </div>
        <button className="btn-primary" onClick={onNewAsset}>
          <span className="plus">+</span>New asset
        </button>
      </div>

      <div className="asset-grid">
        {assets.map((a) => {
          const mine = active.filter((l) => l.assetId === a.id)
          const demand = mine.reduce((n, l) => n + (l.sqm || 0), 0)
          const visits = mine.reduce((n, l) => n + visitCount(l), 0)
          return (
            <div key={a.id} className="asset-card" onClick={() => openAsset(a.id)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{a.name}</div>
                  <div style={{ marginTop: 3, fontSize: 12, color: 'var(--muted)' }}>
                    {a.loc} · {buildingCount(a)}
                  </div>
                </div>
                <span className="type-chip">{a.type.toUpperCase()}</span>
              </div>
              <div className="asset-stats">
                <div>
                  <div className="mlabel mlabel--sm">ACTIVE LEADS</div>
                  <div className="asset-stat-val">{mine.length}</div>
                </div>
                <div>
                  <div className="mlabel mlabel--sm">DEMAND</div>
                  <div className="asset-stat-val">{demand ? area(demand) : '—'}</div>
                </div>
                <div>
                  <div className="mlabel mlabel--sm">VISITS DONE</div>
                  <div className="asset-stat-val">{visits}</div>
                </div>
                <div>
                  <div className="mlabel mlabel--sm">BUILDINGS</div>
                  <div className="asset-stat-val">{a.subs.length}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
