import { useEffect, useRef, useState } from 'react'
import { supabase, fetchCollection, insertCollection, syncCollection } from './db.js'
import { assetsSeed, brokersSeed, eventTypesSeed, leadsSeed, managersSeed, stages as stagesSeed } from './data.js'

const SEEDS = {
  assets: assetsSeed,
  brokers: brokersSeed,
  managers: managersSeed,
  stages: stagesSeed,
  leads: leadsSeed,
  eventTypes: eventTypesSeed,
}

const lsKey = (name) => `atlas.v1.${name}`

// One collection of app state, backed by Supabase when configured and by
// localStorage otherwise. Loads once on mount; after that, every change is
// written through (debounced) — upserts plus deletes for removed ids.
function useCollection(name) {
  const [value, setValue] = useState(SEEDS[name])
  const [ready, setReady] = useState(false)
  const prevIds = useRef(null)
  const skipNextSync = useRef(true)
  const timer = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!supabase) {
        try {
          const raw = localStorage.getItem(lsKey(name))
          if (raw !== null && !cancelled) setValue(JSON.parse(raw))
        } catch { /* corrupt entry — keep seeds */ }
        if (!cancelled) setReady(true)
        return
      }
      try {
        let items = await fetchCollection(name)
        if (items.length === 0) {
          await insertCollection(name, SEEDS[name])
          items = SEEDS[name]
        }
        if (cancelled) return
        prevIds.current = items.map((x) => x.id)
        skipNextSync.current = true
        setValue(items)
        setReady(true)
      } catch (err) {
        console.error(`atlas: failed to load ${name} from Supabase`, err)
        if (!cancelled) setReady(true)
      }
    }

    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  useEffect(() => {
    if (!ready) return
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }
    if (!supabase) {
      try {
        localStorage.setItem(lsKey(name), JSON.stringify(value))
      } catch { /* storage full or blocked */ }
      return
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const ids = value.map((x) => x.id)
      const removed = (prevIds.current ?? []).filter((id) => !ids.includes(id))
      prevIds.current = ids
      try {
        await syncCollection(name, value, removed)
      } catch (err) {
        console.error(`atlas: failed to sync ${name} to Supabase`, err)
      }
    }, 400)
    return () => clearTimeout(timer.current)
  }, [name, value, ready])

  return [value, setValue, ready]
}

export default function useStore() {
  const [assets, setAssets, r1] = useCollection('assets')
  const [brokers, setBrokers, r2] = useCollection('brokers')
  const [managers, setManagers, r3] = useCollection('managers')
  const [stages, setStages, r4] = useCollection('stages')
  const [leads, setLeads, r5] = useCollection('leads')
  const [eventTypes, setEventTypes, r6] = useCollection('eventTypes')

  return {
    assets, setAssets,
    brokers, setBrokers,
    managers, setManagers,
    stages, setStages,
    leads, setLeads,
    eventTypes, setEventTypes,
    ready: r1 && r2 && r3 && r4 && r5 && r6,
    remote: !!supabase,
  }
}
