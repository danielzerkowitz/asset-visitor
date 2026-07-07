import { createClient } from '@supabase/supabase-js'

// Null when env vars are absent — the app then falls back to localStorage,
// so local dev works without a Supabase project.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = url && anonKey ? createClient(url, anonKey) : null

// Each collection maps 1:1 to a table. `position` mirrors the array index so
// the stored order is exactly the in-app order; nested lists (buildings,
// broker contacts) travel as jsonb.
export const TABLES = {
  assets: {
    table: 'assets',
    toRow: (a, i) => ({
      id: a.id, name: a.name, short: a.short, type: a.type,
      loc: a.loc, manager: a.manager, subs: a.subs, position: i,
    }),
    fromRow: (r) => ({
      id: r.id, name: r.name, short: r.short, type: r.type,
      loc: r.loc, manager: r.manager, subs: r.subs ?? [],
    }),
  },
  brokers: {
    table: 'brokers',
    toRow: (b, i) => ({ id: b.id, name: b.name, contacts: b.contacts, position: i }),
    fromRow: (r) => ({ id: r.id, name: r.name, contacts: r.contacts ?? [] }),
  },
  managers: {
    table: 'managers',
    toRow: (m, i) => ({ id: m.id, name: m.name, init: m.init, position: i }),
    fromRow: (r) => ({ id: r.id, name: r.name, init: r.init }),
  },
  stages: {
    table: 'stages',
    toRow: (s, i) => ({ id: s.id, label: s.label, dot: s.dot, position: i }),
    fromRow: (r) => ({ id: r.id, label: r.label, dot: r.dot }),
  },
  leads: {
    table: 'leads',
    toRow: (l, i) => ({
      id: l.id, company: l.company, contact: l.contact, type: l.type,
      sqm: l.sqm, asset_id: l.assetId, sub_id: l.subId ?? null,
      stage: l.stage, broker_contact: l.brokerContact,
      next_step: l.next, when_label: l.when ?? null, position: i,
    }),
    fromRow: (r) => ({
      id: r.id, company: r.company, contact: r.contact, type: r.type,
      sqm: Number(r.sqm), assetId: r.asset_id, subId: r.sub_id,
      stage: r.stage, brokerContact: r.broker_contact,
      next: r.next_step, ...(r.when_label ? { when: r.when_label } : {}),
    }),
  },
}

export async function fetchCollection(name) {
  const cfg = TABLES[name]
  const { data, error } = await supabase.from(cfg.table).select('*').order('position')
  if (error) throw error
  return data.map(cfg.fromRow)
}

export async function insertCollection(name, items) {
  const cfg = TABLES[name]
  const { error } = await supabase.from(cfg.table).insert(items.map(cfg.toRow))
  if (error) throw error
}

// Write-through sync: upsert every current row, delete rows that disappeared.
// Collections are small, so full-collection writes keep this simple and exact.
export async function syncCollection(name, items, removedIds) {
  const cfg = TABLES[name]
  const { error } = await supabase.from(cfg.table).upsert(items.map(cfg.toRow))
  if (error) throw error
  if (removedIds.length) {
    const { error: delError } = await supabase.from(cfg.table).delete().in('id', removedIds)
    if (delError) throw delError
  }
}
