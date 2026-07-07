import { area, cv, fmt, unit } from '../units.js'
import { aggAsset, buildingCount, findAsset, fmtDate, isActive, lastVisit, leadInScope, scopeSubs, visitCount, whereLabel } from '../lib.js'
import { KpiCard, Select } from './ui.jsx'

function todayLabel() {
  return new Date()
    .toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    .replace(',', '')
}

export default function Dashboard({ assets, leads, fAsset, fSub, setFAsset, setFSub, openAsset }) {
  const selAsset = fAsset !== 'all' ? findAsset(assets, fAsset) : null

  const assetOptions = [{ id: 'all', label: 'All assets' }, ...assets.map((a) => ({ id: a.id, label: a.name }))]
  const multiSubs = selAsset ? selAsset.subs.filter((s) => !s.single) : []
  const subOptions =
    selAsset && multiSubs.length
      ? [{ id: 'all', label: 'All buildings' }, ...multiSubs.map((s) => ({ id: s.id, label: s.name }))]
      : [{ id: 'all', label: 'All buildings' }]
  const subDisabled = !selAsset || multiSubs.length === 0
  const filterActive = fAsset !== 'all' || fSub !== 'all'

  const scope = scopeSubs(assets, fAsset, fSub)
  const totSqm = scope.reduce((n, x) => n + x.s.sqm, 0)
  const occ = totSqm ? scope.reduce((n, x) => n + x.s.sqm * x.s.occ, 0) / totSqm : 0
  const vac = scope.reduce((n, x) => n + x.s.sqm * (1 - x.s.occ), 0)
  const leadsScoped = leads.filter((l) => leadInScope(l, fAsset, fSub))
  const activeScoped = leadsScoped.filter(isActive)
  const visitsDone = activeScoped.reduce((n, l) => n + visitCount(l), 0)

  const kpis = [
    { label: 'OCCUPANCY', value: String(Math.round(occ * 100)), unit: '%', note: 'weighted by area' },
    {
      label: 'VACANT AREA',
      value: fmt(cv(vac)),
      unit: unit(),
      note: `${scope.length} ${scope.length === 1 ? 'building' : 'buildings'} in scope`,
    },
    { label: 'ACTIVE LEADS', value: String(activeScoped.length), unit: '', note: 'excluding signed & out' },
    { label: 'VISITS DONE', value: String(visitsDone), unit: '', note: 'across active leads' },
  ]

  let occTitle, occColLabel, occRows
  if (!selAsset) {
    occTitle = 'Occupancy by asset'
    occColLabel = 'ASSET'
    occRows = assets.map((a) => {
      const { t, o, v } = aggAsset(a)
      return {
        id: a.id,
        name: a.name,
        meta: `${a.type} · ${buildingCount(a).toLowerCase()}`,
        area: area(t),
        pct: Math.round(o * 100),
        vacant: area(v),
        open: () => openAsset(a.id),
      }
    })
  } else {
    occTitle = `Buildings — ${selAsset.name}`
    occColLabel = 'BUILDING'
    occRows = selAsset.subs
      .filter((s) => fSub === 'all' || s.id === fSub)
      .map((s) => ({
        id: s.id,
        name: s.name,
        meta: `${s.units} units · ${s.vacant} vacant`,
        area: area(s.sqm),
        pct: Math.round(s.occ * 100),
        vacant: area(s.sqm * (1 - s.occ)),
        open: () => openAsset(selAsset.id),
      }))
  }

  const visits = activeScoped
    .filter((l) => lastVisit(l))
    .sort((a, b) => (lastVisit(b) > lastVisit(a) ? 1 : -1))
    .slice(0, 6)
    .map((l) => ({
      id: l.id,
      company: l.company,
      where: whereLabel(assets, l),
      when: l.when || fmtDate(lastVisit(l)),
    }))

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
            <span className="card-title">{occTitle}</span>
            <span className="mlabel" style={{ letterSpacing: '.06em' }}>CLICK A ROW TO OPEN</span>
          </div>
          <div className="grid-row occ-cols thead-row">
            <span className="mlabel">{occColLabel}</span>
            <span className="mlabel" style={{ textAlign: 'right' }}>AREA</span>
            <span className="mlabel">OCCUPANCY</span>
            <span />
            <span className="mlabel" style={{ textAlign: 'right' }}>VACANT</span>
          </div>
          {occRows.map((row) => (
            <div key={row.id} className="grid-row occ-cols occ-row" onClick={row.open}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{row.name}</div>
                <div style={{ marginTop: 2, fontSize: 11.5, color: 'var(--muted)' }}>{row.meta}</div>
              </div>
              <div className="mono-cell">{row.area}</div>
              <div className="meter"><div style={{ width: `${row.pct}%` }} /></div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12.5, fontWeight: 600, textAlign: 'right' }}>
                {row.pct}%
              </div>
              <div className="mono-cell" style={{ fontSize: 11, color: 'var(--muted)' }}>{row.vacant}</div>
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
