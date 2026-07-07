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

export function lastVisit(l) {
  const v = l.visits || []
  return v.length ? v[v.length - 1] : null
}

export function visitCount(l) {
  return (l.visits || []).length
}

// 'YYYY-MM-DD' → '22 Jan 24'
export function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
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

