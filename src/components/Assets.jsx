import { area } from '../units.js'
import { aggAsset, buildingCount, isActive } from '../lib.js'

export default function Assets({ assets, leads, openAsset, onNewAsset }) {
  const totalSubs = assets.reduce((n, a) => n + a.subs.length, 0)
  const totalSqm = assets.reduce((n, a) => n + a.subs.reduce((m, s) => m + s.sqm, 0), 0)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Assets</h1>
          <div className="page-sub">
            {assets.length} assets · {totalSubs} buildings · {area(totalSqm)}
          </div>
        </div>
        <button className="btn-primary" onClick={onNewAsset}>
          <span className="plus">+</span>New asset
        </button>
      </div>

      <div className="asset-grid">
        {assets.map((a) => {
          const { t, o, v } = aggAsset(a)
          const nLeads = leads.filter((l) => l.assetId === a.id && isActive(l)).length
          const pct = Math.round(o * 100)
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
                  <div className="mlabel mlabel--sm">AREA</div>
                  <div className="asset-stat-val">{area(t)}</div>
                </div>
                <div>
                  <div className="mlabel mlabel--sm">OCCUPANCY</div>
                  <div className="asset-stat-val">{pct}%</div>
                  <div className="meter" style={{ marginTop: 5, height: 4 }}>
                    <div style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mlabel mlabel--sm">VACANT</div>
                  <div className="asset-stat-val">{area(v)}</div>
                </div>
                <div>
                  <div className="mlabel mlabel--sm">ACTIVE LEADS</div>
                  <div className="asset-stat-val">{nLeads}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
