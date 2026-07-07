// Pure derivation helpers shared by screens.

// Aggregate an asset's buildings: total m², area-weighted occupancy, vacant m².
export function aggAsset(a) {
  const t = a.subs.reduce((n, s) => n + s.sqm, 0)
  const o = t ? a.subs.reduce((n, s) => n + s.sqm * s.occ, 0) / t : 0
  const v = a.subs.reduce((n, s) => n + s.sqm * (1 - s.occ), 0)
  return { t, o, v }
}

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

// All (asset, building) pairs inside the current filter scope.
export function scopeSubs(assets, fAsset, fSub) {
  const out = []
  assets.forEach((a) =>
    a.subs.forEach((s) => {
      if (fAsset !== 'all' && a.id !== fAsset) return
      if (fSub !== 'all' && s.id !== fSub) return
      out.push({ a, s })
    })
  )
  return out
}
