import { useEffect, useRef, useState } from 'react'
import { area, cv, fmt, unit } from '../units.js'
import { buildingCount, findAsset, fmtDate, isActive, leadInScope, visitDates, visitsBetween, whereLabel } from '../lib.js'
import { KpiCard, Select } from './ui.jsx'

function todayLabel() {
  return new Date()
    .toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    .replace(',', '')
}

const demandOf = (ls) => ls.reduce((n, l) => n + (l.sqm || 0), 0)

// Preset timespans the visit numbers report on (KPI, table column, recent list).
const PERIODS = [
  { id: 'all', label: 'All time', days: null },
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: '90', label: 'Last 90 days', days: 90 },
  { id: '365', label: 'Last 12 months', days: 365 },
]

function rangeLabel(range) {
  if (range.preset !== 'custom') return PERIODS.find((p) => p.id === range.preset).label
  if (range.from && range.to) return `${fmtDate(range.from)} – ${fmtDate(range.to)}`
  if (range.from) return `Since ${fmtDate(range.from)}`
  if (range.to) return `Until ${fmtDate(range.to)}`
  return 'Custom range'
}

function VisitRangePicker({ range, setRange, todayIso }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const custom = range.preset === 'custom'
  return (
    <div className="rangewrap" ref={wrapRef}>
      <button className="range-btn" onClick={() => setOpen((o) => !o)}>
        <span>{rangeLabel(range)}</span>
        <span className="range-arrow">▼</span>
      </button>
      {open && (
        <div className="rangepop">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              className={`rangepop-item${range.preset === p.id ? ' active' : ''}`}
              onClick={() => { setRange({ preset: p.id, from: '', to: '' }); setOpen(false) }}
            >
              <span>{p.label}</span>
              {range.preset === p.id && <span>✓</span>}
            </button>
          ))}
          <div className="rangepop-sep" />
          <div className="rangepop-custom">
            <div className="flabel">CUSTOM RANGE</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div className="flabel">FROM</div>
                <input
                  type="date"
                  className="field field--date"
                  value={custom ? range.from : ''}
                  max={(custom && range.to) || todayIso}
                  onChange={(e) => setRange({ preset: 'custom', from: e.target.value, to: custom ? range.to : '' })}
                />
              </div>
              <div>
                <div className="flabel">TO</div>
                <input
                  type="date"
                  className="field field--date"
                  value={custom ? range.to : ''}
                  min={custom && range.from ? range.from : undefined}
                  max={todayIso}
                  onChange={(e) => setRange({ preset: 'custom', from: custom ? range.from : '', to: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard({ assets, leads, fAsset, fSub, setFAsset, setFSub, openAsset }) {
  const [range, setRange] = useState({ preset: 'all', from: '', to: '' })
  const selAsset = fAsset !== 'all' ? findAsset(assets, fAsset) : null

  // Upper bound: imported data holds visits scheduled ahead — those aren't "done".
  const todayIso = new Date().toISOString().slice(0, 10)
  const preset = PERIODS.find((p) => p.id === range.preset)
  const cutoff = range.preset === 'custom'
    ? range.from || null
    : preset.days
      ? new Date(Date.now() - preset.days * 86400000).toISOString().slice(0, 10)
      : null
  const until = range.preset === 'custom' && range.to && range.to < todayIso ? range.to : todayIso

  const assetOptions = [{ id: 'all', label: 'All assets' }, ...assets.map((a) => ({ id: a.id, label: a.name }))]
  const multiSubs = selAsset ? selAsset.subs.filter((s) => !s.single) : []
  const subOptions =
    selAsset && multiSubs.length
      ? [{ id: 'all', label: 'All buildings' }, ...multiSubs.map((s) => ({ id: s.id, label: s.name }))]
      : [{ id: 'all', label: 'All buildings' }]
  const subDisabled = !selAsset || multiSubs.length === 0
  const filterActive = fAsset !== 'all' || fSub !== 'all'

  const leadsScoped = leads.filter((l) => leadInScope(l, fAsset, fSub))
  const activeScoped = leadsScoped.filter(isActive)
  // Visits are counted over all leads in scope (incl. signed/out) — activity
  // happened regardless of where the deal ended up.
  const visitsDone = leadsScoped.reduce((n, l) => n + visitsBetween(l, cutoff, until), 0)
  const proposals = activeScoped.filter((l) => l.stage === 'proposal' || l.stage === 'agreed').length

  const kpis = [
    { label: 'ACTIVE LEADS', value: String(activeScoped.length), unit: '', note: 'excluding signed & out' },
    { label: 'DEMAND', value: fmt(cv(demandOf(activeScoped))), unit: unit(), note: 'sqm active leads are seeking' },
    { label: 'VISITS DONE', value: String(visitsDone), unit: '', note: range.preset === 'custom' ? rangeLabel(range) : preset.label.toLowerCase() },
    { label: 'PROPOSALS OUT', value: String(proposals), unit: '', note: 'incl. agreed' },
  ]

  // ---- leads-by-asset (or by building when an asset is selected)
  let tableTitle, colLabel, rows
  if (!selAsset) {
    tableTitle = 'Leads by asset'
    colLabel = 'ASSET'
    rows = assets.map((a) => {
      const all = leads.filter((l) => l.assetId === a.id)
      const mine = all.filter(isActive)
      return {
        id: a.id,
        name: a.name,
        meta: `${a.type} · ${buildingCount(a).toLowerCase()}`,
        active: mine.length,
        demand: demandOf(mine),
        visits: all.reduce((n, l) => n + visitsBetween(l, cutoff, until), 0),
        open: () => openAsset(a.id),
      }
    })
  } else {
    tableTitle = `Leads by building — ${selAsset.name}`
    colLabel = 'BUILDING'
    const bRows = selAsset.subs
      .filter((s) => fSub === 'all' || s.id === fSub)
      .map((s) => {
        const all = leads.filter((l) => l.assetId === selAsset.id && l.subId === s.id)
        return { id: s.id, name: s.name, meta: null, all }
      })
    const loose = leads.filter((l) => l.assetId === selAsset.id && !l.subId)
    if (fSub === 'all' && loose.length) {
      bRows.push({ id: '__whole', name: 'Whole asset', meta: 'no building assigned', all: loose })
    }
    rows = bRows.map((r) => {
      const mine = r.all.filter(isActive)
      return {
        id: r.id,
        name: r.name,
        meta: r.meta,
        active: mine.length,
        demand: demandOf(mine),
        visits: r.all.reduce((n, l) => n + visitsBetween(l, cutoff, until), 0),
        open: () => openAsset(selAsset.id),
      }
    })
  }
  const maxDemand = Math.max(1, ...rows.map((r) => r.demand))

  const visits = leadsScoped
    .map((l) => {
      const dates = visitDates(l).filter((d) => (!cutoff || d >= cutoff) && d <= until)
      return { l, last: dates.length ? dates[dates.length - 1] : null }
    })
    .filter((x) => x.last)
    .sort((a, b) => (b.last > a.last ? 1 : -1))
    .slice(0, 6)
    .map(({ l, last }) => ({
      id: l.id,
      company: l.company,
      where: whereLabel(assets, l),
      when: fmtDate(last),
    }))

  const tableCols = 'minmax(170px,1.2fr) 80px 1fr 110px 90px'

  return (
    <div className="page page--dash">
      <div className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <div className="page-sub">Portfolio overview · {todayLabel()}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="mlabel">FILTER</span>
          <Select
            bar
            value={fAsset}
            onChange={(e) => { setFAsset(e.target.value); setFSub('all') }}
            options={assetOptions}
            style={{ maxWidth: 220 }}
          />
          <Select
            bar
            faded
            value={fSub}
            onChange={(e) => setFSub(e.target.value)}
            options={subOptions}
            disabled={subDisabled}
            style={{ maxWidth: 190 }}
          />
          {filterActive && (
            <button className="btn-link" onClick={() => { setFAsset('all'); setFSub('all') }}>
              Clear
            </button>
          )}
          <span className="mlabel" style={{ marginLeft: 10 }}>VISITS</span>
          <VisitRangePicker range={range} setRange={setRange} todayIso={todayIso} />
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: 14, alignItems: 'start' }}>
        <div className="card card--clip">
          <div className="card-head">
            <span className="card-title">{tableTitle}</span>
            <span className="mlabel" style={{ letterSpacing: '.06em' }}>CLICK A ROW TO OPEN</span>
          </div>
          <div className="grid-row thead-row" style={{ gridTemplateColumns: tableCols }}>
            <span className="mlabel">{colLabel}</span>
            <span className="mlabel" style={{ textAlign: 'right' }}>ACTIVE</span>
            <span className="mlabel">DEMAND</span>
            <span />
            <span className="mlabel" style={{ textAlign: 'right' }}>VISITS</span>
          </div>
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid-row occ-row"
              style={{ gridTemplateColumns: tableCols }}
              onClick={row.open}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{row.name}</div>
                {row.meta && <div style={{ marginTop: 2, fontSize: 11.5, color: 'var(--muted)' }}>{row.meta}</div>}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12.5, fontWeight: 600, textAlign: 'right' }}>
                {row.active}
              </div>
              <div className="meter"><div style={{ width: `${Math.round((row.demand / maxDemand) * 100)}%` }} /></div>
              <div className="mono-cell">{row.demand ? area(row.demand) : '—'}</div>
              <div className="mono-cell" style={{ fontSize: 11, color: 'var(--muted)' }}>{row.visits}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card card--clip">
            <div className="card-head" style={{ paddingBottom: 9 }}>
              <span className="card-title">Recent visits</span>
              <span className="count-chip">{visits.length}</span>
            </div>
            {visits.map((v) => (
              <div
                key={v.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 10, padding: '10px 16px', borderTop: '1px solid var(--bd-row)',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{v.company}</div>
                  <div style={{ marginTop: 1, fontSize: 11.5, color: 'var(--muted)' }}>{v.where}</div>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500,
                    background: 'var(--bg-side)', border: '1px solid var(--bd)',
                    padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap',
                  }}
                >
                  {v.when}
                </span>
              </div>
            ))}
            {visits.length === 0 && (
              <div style={{ padding: '14px 16px', fontSize: 12, color: 'var(--faint)', borderTop: '1px solid var(--bd-row)' }}>
                No visits in this scope yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
