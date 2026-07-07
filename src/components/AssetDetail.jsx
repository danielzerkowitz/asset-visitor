import { area, cv, fmt, rentFmt, unit } from '../units.js'
import { aggAsset, brokerName, buildingCount, contactInit, isActive, managerName } from '../lib.js'
import { Avatar, KpiCard } from './ui.jsx'

export default function AssetDetail({ asset, leads, brokers, managers, stages, goAssets, onAddLead, onAddBuilding }) {
  const { t, o, v } = aggAsset(asset)
  const aLeads = leads.filter((l) => l.assetId === asset.id)
  const order = stages.map((s) => s.id)
  const sorted = aLeads.slice().sort((x, y) => order.indexOf(x.stage) - order.indexOf(y.stage))

  const kpis = [
    { label: 'TOTAL AREA', value: fmt(cv(t)), unit: unit(), note: `${asset.subs.reduce((n, s) => n + s.units, 0)} units` },
    { label: 'OCCUPANCY', value: String(Math.round(o * 100)), unit: '%', note: 'weighted by area' },
    { label: 'VACANT AREA', value: fmt(cv(v)), unit: unit(), note: `${asset.subs.reduce((n, s) => n + s.vacant, 0)} vacant units` },
    { label: 'ACTIVE LEADS', value: String(aLeads.filter(isActive).length), unit: '', note: 'excluding signed & out' },
  ]

  return (
    <div className="page" style={{ paddingTop: 22 }}>
      <div>
        <button className="btn-back" onClick={goAssets}>← ALL ASSETS</button>
        <div className="page-head" style={{ marginTop: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="page-title" style={{ fontSize: 24 }}>{asset.name}</h1>
              <span className="type-chip">{asset.type.toUpperCase()}</span>
            </div>
            <div className="page-sub" style={{ marginTop: 4 }}>
              {asset.loc} · {buildingCount(asset)} · Managed by {managerName(managers, asset.manager)}
              {asset.tenantRep && brokerName(brokers, asset.tenantRep) && (
                <> · Tenant rep: {brokerName(brokers, asset.tenantRep)}</>
              )}
            </div>
          </div>
          <button className="btn-primary" onClick={onAddLead}>
            <span className="plus">+</span>Add lead
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span className="card-title">Buildings</span>
          <button className="btn-secondary btn-secondary--sm" onClick={onAddBuilding}>
            <span className="plus">+</span>Add building
          </button>
        </div>
        <div className="subs-grid">
          {asset.subs.map((s) => {
            const n = leads.filter((l) => l.assetId === asset.id && l.subId === s.id && isActive(l)).length
            const pct = Math.round(s.occ * 100)
            return (
              <div key={s.id} className="card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                  <span className="card-title">{s.name}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600 }}>{pct}%</span>
                </div>
                <div className="meter" style={{ height: 5 }}><div style={{ width: `${pct}%` }} /></div>
                <div
                  style={{
                    display: 'flex', justifyContent: 'space-between', gap: 8,
                    fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', whiteSpace: 'nowrap',
                  }}
                >
                  <span>{area(s.sqm)}</span>
                  <span>{s.units} units</span>
                  <span>{s.vacant} vacant</span>
                </div>
                <div
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                    paddingTop: 9, borderTop: '1px solid var(--bd-soft)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--muted)' }}>
                    {s.rent ? rentFmt(s.rent) : 'rent —'}
                  </span>
                  <span className={`lead-pill ${n ? 'on' : 'off'}`}>{n === 1 ? '1 lead' : `${n} leads`}</span>
                </div>
              </div>
            )
          })}
          {asset.subs.length === 0 && (
            <button className="dashed-add" onClick={onAddBuilding}>
              No buildings yet — click to add the first one
            </button>
          )}
        </div>
      </div>

      <div className="card card--clip">
        <div className="card-head">
          <span className="card-title">Leads on this asset</span>
          <span className="count-chip">{aLeads.length}</span>
        </div>
        {sorted.map((l) => {
          const stg = stages.find((s) => s.id === l.stage) || { dot: '#948A7B', label: l.stage }
          const sub = asset.subs.find((s) => s.id === l.subId)
          return (
            <div key={l.id} className="grid-row dlead-cols dlead-row">
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{l.company}</div>
                <div style={{ marginTop: 1, fontSize: 11.5, color: 'var(--muted)' }}>{l.contact}</div>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                {l.type} · {area(l.sqm)}
              </span>
              <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                {sub ? (sub.single ? '—' : sub.short) : 'Whole asset'}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--ink-2)' }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: stg.dot, flex: 'none' }} />
                {stg.label}
              </span>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{l.next}</span>
              <Avatar>{contactInit(brokers, l.brokerContact)}</Avatar>
            </div>
          )
        })}
        {aLeads.length === 0 && (
          <div style={{ padding: 16, fontSize: 12, color: 'var(--faint)', borderTop: '1px solid var(--bd-row)' }}>
            No leads on this asset yet.
          </div>
        )}
      </div>
    </div>
  )
}
