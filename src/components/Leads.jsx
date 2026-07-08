import { useState } from 'react'
import { area } from '../units.js'
import { contactInit, eventTypeLabel, fmtDate, isActive, lastEvent, whereLabel } from '../lib.js'
import { Avatar, Select } from './ui.jsx'

export default function Leads({ assets, leads, brokers, stages, openLead, onNewLead }) {
  const [q, setQ] = useState('')
  const [fStage, setFStage] = useState('all')
  const [fAsset, setFAsset] = useState('all')

  const stageOptions = [{ id: 'all', label: 'All stages' }, ...stages.map((s) => ({ id: s.id, label: s.label }))]
  const assetOptions = [{ id: 'all', label: 'All assets' }, ...assets.map((a) => ({ id: a.id, label: a.name }))]

  const needle = q.trim().toLowerCase()
  const order = stages.map((s) => s.id)
  const rows = leads
    .filter((l) => fStage === 'all' || l.stage === fStage)
    .filter((l) => fAsset === 'all' || l.assetId === fAsset)
    .filter((l) => !needle || l.company.toLowerCase().includes(needle) || (l.contact || '').toLowerCase().includes(needle))
    .slice()
    .sort((x, y) => order.indexOf(x.stage) - order.indexOf(y.stage) || x.company.localeCompare(y.company))

  const active = leads.filter(isActive).length

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Leads</h1>
          <div className="page-sub">{leads.length} leads · {active} active · click a lead to open it</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            className="field"
            style={{ height: 34, maxWidth: 190, fontSize: 12.5 }}
            placeholder="Search company or contact…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select bar value={fStage} onChange={(e) => setFStage(e.target.value)} options={stageOptions} style={{ maxWidth: 150 }} />
          <Select bar value={fAsset} onChange={(e) => setFAsset(e.target.value)} options={assetOptions} style={{ maxWidth: 190 }} />
          <button className="btn-primary" onClick={onNewLead}>
            <span className="plus">+</span>New lead
          </button>
        </div>
      </div>

      <div className="card card--clip">
        <div className="grid-row thead-row lead-cols">
          <span className="mlabel">COMPANY</span>
          <span className="mlabel">NEED</span>
          <span className="mlabel">WHERE</span>
          <span className="mlabel">STAGE</span>
          <span className="mlabel">LAST ACTIVITY</span>
          <span className="mlabel">NEXT STEP</span>
          <span />
        </div>
        {rows.map((l) => {
          const stg = stages.find((s) => s.id === l.stage) || { dot: '#948A7B', label: l.stage }
          const last = lastEvent(l)
          return (
            <div key={l.id} className="grid-row lead-cols dlead-row dlead-row--click" title="Click to open" onClick={() => openLead(l.id)}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.company}</span>
                  {l.tenantKind === 'current' && <span className="ev-chip" title={`Sitting tenant${l.dealType ? ` · ${l.dealType}` : ''}`}>CURRENT</span>}
                </div>
                <div style={{ marginTop: 1, fontSize: 11.5, color: 'var(--muted)' }}>{l.contact || '—'}</div>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                {l.type} · {l.sqm ? area(l.sqm) : '— m²'}
              </span>
              <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{whereLabel(assets, l)}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--ink-2)' }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: stg.dot, flex: 'none' }} />
                {stg.label}
              </span>
              {last ? (
                <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                  {eventTypeLabel(last.type)}
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--muted)' }}> · {fmtDate(last.date)}</span>
                </span>
              ) : (
                <span style={{ fontSize: 11.5, color: 'var(--faint)' }}>No activity yet</span>
              )}
              <span style={{ fontSize: 11.5, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {l.next}
              </span>
              <Avatar>{contactInit(brokers, l.brokerContact)}</Avatar>
            </div>
          )
        })}
        {rows.length === 0 && (
          <div style={{ padding: 16, fontSize: 12, color: 'var(--faint)', borderTop: '1px solid var(--bd-row)' }}>
            No leads match this filter.
          </div>
        )}
      </div>
    </div>
  )
}
