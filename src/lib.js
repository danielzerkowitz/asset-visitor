// Pure derivation helpers shared by screens.

export function buildingCount(a) {
  if (a.subs.length === 0) return 'No buildings yet'
  if (a.subs.length === 1) return 'Single building'
  return `${a.subs.length} buildings`
}

export function findAsset(assets, id) {
  return assets.find((a) => a.id === id)
}

export function whereLabel(assets, lead) {
  const a = findAsset(assets, lead.assetId)
  if (!a) return '—'
  const s = a.subs.find((x) => x.id === lead.subId)
  if (!s || s.single) return a.short
  return `${a.short} · ${s.short}`
}

// A lead is active while the deal is still in play — not signed, not out.
const INACTIVE_STAGES = ['signed', 'out']
export const isActive = (l) => !INACTIVE_STAGES.includes(l.stage)

// Loggable activity on a lead, lawyer-style. Everything the asset manager
// does with a lead lands here; visits are the type the dashboard reports on.
export const EVENT_TYPES = [
  { id: 'call', label: 'Phone call' },
  { id: 'visit', label: 'Visit' },
  { id: 'email', label: 'Email' },
  { id: 'meeting', label: 'Meeting' },
  { id: 'proposal', label: 'Proposal sent' },
  { id: 'followup', label: 'Follow-up' },
  { id: 'other', label: 'Other' },
]

export function eventTypeLabel(type) {
  return EVENT_TYPES.find((t) => t.id === type)?.label ?? type
}

// Deal profile vocabularies. Deal types only apply to current tenants —
// a lease can be renewed, extended or shrunk, not started twice.
export const TENANT_KINDS = [
  { id: 'new', label: 'New tenant' },
  { id: 'current', label: 'Current tenant' },
]

export const DEAL_TYPES = [
  { id: 'Renewal', label: 'Renewal' },
  { id: 'Extension', label: 'Extension' },
  { id: 'Reduction', label: 'Reduction' },
]

// All events of a lead, oldest first. Imported leads carry a legacy `visits`
// array of plain dates — surfaced here as visit events so nothing is lost.
export function leadEvents(l) {
  const legacy = (l.visits || []).map((d, i) => ({ id: `legacy-${i}`, type: 'visit', date: d, note: '', legacy: true }))
  return [...legacy, ...(l.events || [])].sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0))
}

export function visitDates(l) {
  return leadEvents(l).filter((e) => e.type === 'visit').map((e) => e.date)
}

export function lastVisit(l) {
  const v = visitDates(l)
  return v.length ? v[v.length - 1] : null
}

export function visitCount(l) {
  return visitDates(l).length
}

// Visits inside [cutoff, until] ('YYYY-MM-DD'); either bound may be null.
// Imported data schedules visits ahead, so "done" counts need `until` = today.
export function visitsBetween(l, cutoff, until) {
  return visitDates(l).filter((d) => (!cutoff || d >= cutoff) && (!until || d <= until)).length
}

export function lastEvent(l) {
  const evs = leadEvents(l)
  return evs.length ? evs[evs.length - 1] : null
}

// 'YYYY-MM-DD' → '22 Jan 24'
export function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
}

// full ISO timestamp → '8 Jul 26 · 14:32'
export function fmtDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })} · ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
}

export function brokerName(brokers, id) {
  const b = brokers.find((x) => x.id === id)
  return b ? b.name : null
}

export function findContact(brokers, id) {
  for (const b of brokers) {
    const c = b.contacts.find((x) => x.id === id)
    if (c) return { ...c, broker: b }
  }
  return null
}

export function contactInit(brokers, id) {
  const c = findContact(brokers, id)
  return c ? c.init : String(id || '—').slice(0, 2).toUpperCase()
}

export function managerName(managers, id) {
  const m = managers.find((x) => x.id === id)
  return m ? m.name : '—'
}

export function initialsOf(name) {
  return name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

export function shortName(n) {
  return n.length > 12 ? n.slice(0, 12) + '…' : n
}

export function leadInScope(l, fAsset, fSub) {
  if (fAsset !== 'all' && l.assetId !== fAsset) return false
  if (fSub !== 'all' && l.subId !== fSub) return false
  return true
}

