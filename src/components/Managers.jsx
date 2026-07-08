import { isActive } from '../lib.js'

export default function Managers({ managers, assets, leads, onAdd, onEdit }) {
  return (
    <div className="page page--narrow">
      <div className="page-head">
        <div>
          <h1 className="page-title">Asset managers</h1>
          <div className="page-sub">Internal team — they own the assets and mandate agents</div>
        </div>
        <button className="btn-primary" onClick={onAdd}>
          <span className="plus">+</span>Add manager
        </button>
      </div>

      <div className="card card--clip">
        <div className="grid-row mgr-cols thead-row">
          <span className="mlabel">MANAGER</span>
          <span className="mlabel" style={{ textAlign: 'right' }}>ASSETS MANAGED</span>
          <span className="mlabel" style={{ textAlign: 'right' }}>ACTIVE LEADS</span>
        </div>
        {managers.map((m) => {
          const ownedIds = assets.filter((a) => a.manager === m.id).map((a) => a.id)
          const active = leads.filter((l) => ownedIds.includes(l.assetId) && isActive(l)).length
          return (
            <div
              key={m.id}
              className="grid-row mgr-cols people-row people-row--click"
              title="Click to edit"
              onClick={() => onEdit(m.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span
                  style={{
                    width: 30, height: 30, flex: 'none', borderRadius: 999,
                    background: 'var(--ink)', display: 'grid', placeItems: 'center',
                    fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, color: 'var(--bg)',
                  }}
                >
                  {m.init}
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{m.name}</span>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, fontWeight: 600, textAlign: 'right' }}>
                {ownedIds.length}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--ink-3)', textAlign: 'right' }}>
                {active}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
