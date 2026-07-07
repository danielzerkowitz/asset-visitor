import { useRef, useState } from 'react'
import { fromIn, rentIn } from './units.js'
import { findAsset, initialsOf, isActive, shortName } from './lib.js'
import useStore from './useStore.js'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import Assets from './components/Assets.jsx'
import AssetDetail from './components/AssetDetail.jsx'
import Pipeline from './components/Pipeline.jsx'
import Brokers from './components/Brokers.jsx'
import Managers from './components/Managers.jsx'
import { AssetModal, BrokerModal, BuildingModal, ContactModal, LeadModal, ManagerModal } from './components/modals.jsx'

// Dot colors handed out to user-created stages, first unused wins.
const STAGE_DOTS = ['#948A7B', '#B08327', '#C05F2E', '#9D4A26', '#74803B', '#4C8355', '#3F7A6E', '#9A7B2E', '#6E7A3D', '#A85A32']

export default function App() {
  const {
    assets, setAssets,
    brokers, setBrokers,
    managers, setManagers,
    stages, setStages,
    leads, setLeads,
    ready,
  } = useStore()

  const [view, setView] = useState('dashboard')
  const [assetId, setAssetId] = useState(null)

  const [fAsset, setFAsset] = useState('all')
  const [fSub, setFSub] = useState('all')
  const [pAsset, setPAsset] = useState('all')

  // null = closed; leadModal holds the pre-selected asset id ('' = none)
  const [leadModal, setLeadModal] = useState(null)
  const [assetModal, setAssetModal] = useState(false)
  const [buildingModal, setBuildingModal] = useState(false)
  const [brokerModal, setBrokerModal] = useState(false)
  // null = closed; otherwise the id of the broker the new contact belongs to
  const [contactModal, setContactModal] = useState(null)
  const [managerModal, setManagerModal] = useState(false)

  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)
  const showToast = (msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(''), 2600)
  }

  const openAsset = (id) => { setAssetId(id); setView('detail') }
  const detailAsset = view === 'detail' && assetId ? findAsset(assets, assetId) : null

  const moveLead = (id, stageId) => {
    const lead = leads.find((l) => l.id === id)
    if (!lead || lead.stage === stageId) return
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, stage: stageId } : l)))
    showToast(`${lead.company} → ${stages.find((s) => s.id === stageId).label}`)
  }

  const addStage = (label) => {
    const dot = STAGE_DOTS.find((c) => !stages.some((s) => s.dot === c)) || STAGE_DOTS[stages.length % STAGE_DOTS.length]
    setStages((ss) => [...ss, { id: `st${Date.now()}`, label, dot }])
    showToast(`Stage added — ${label}`)
  }

  const renameStage = (id, label) => {
    setStages((ss) => ss.map((s) => (s.id === id ? { ...s, label } : s)))
  }

  const removeStage = (id) => {
    const stg = stages.find((s) => s.id === id)
    if (!stg) return
    if (stages.length === 1) {
      showToast('The pipeline needs at least one stage')
      return
    }
    const n = leads.filter((l) => l.stage === id).length
    if (n) {
      showToast(`Move ${n} ${n === 1 ? 'lead' : 'leads'} out of “${stg.label}” first`)
      return
    }
    setStages((ss) => ss.filter((s) => s.id !== id))
    showToast(`Stage removed — ${stg.label}`)
  }

  const submitLead = (form) => {
    const first = stages[0]
    const firm = brokers.find((b) => b.contacts.some((c) => c.id === form.brokerContact))
    const lead = {
      id: `l${Date.now()}`,
      company: form.company.trim(),
      contact: form.contact.trim(),
      type: form.type,
      sqm: fromIn(Number(form.sqm)),
      assetId: form.asset,
      subId: form.sub || null,
      stage: first.id,
      broker: firm?.id ?? null,
      brokerContact: form.brokerContact,
      visits: [],
      next: 'First call to book',
    }
    setLeads((ls) => [lead, ...ls])
    setLeadModal(null)
    setView('pipeline')
    setPAsset('all')
    showToast(`Lead added — ${lead.company} in ${first.label}`)
  }

  const submitAsset = (form) => {
    const single = form.structure === 'single'
    const id = `a${Date.now()}`
    const name = form.name.trim()
    const asset = {
      id,
      name,
      short: shortName(name),
      type: form.type,
      loc: form.loc.trim() || '—',
      manager: form.manager,
      tenantRep: form.tenantRep || null,
      subs: single
        ? [{
            id: 'main',
            name: `${name} (whole building)`,
            short: '',
            single: true,
            sqm: fromIn(Number(form.sqm)),
            occ: 0,
            units: Number(form.units),
            vacant: Number(form.units),
            rent: rentIn(Number(form.rent) || 0),
          }]
        : [],
    }
    setAssets((as) => [...as, asset])
    setAssetModal(false)
    openAsset(id)
    showToast(single ? `Asset added — ${name}` : 'Asset added — now add its buildings')
  }

  const submitBuilding = (form) => {
    if (!detailAsset) return
    const name = form.name.trim()
    const sub = {
      id: `s${Date.now()}`,
      name,
      short: shortName(name),
      sqm: fromIn(Number(form.sqm)),
      occ: 0,
      units: Number(form.units),
      vacant: Number(form.units),
      rent: rentIn(Number(form.rent) || 0),
    }
    setAssets((as) =>
      as.map((a) =>
        a.id !== detailAsset.id
          ? a
          : {
              ...a,
              // A former single-building asset becomes a multi-building park.
              subs: [...a.subs.map((x) => (x.single ? { ...x, single: false, short: x.short || 'Main' } : x)), sub],
            }
      )
    )
    setBuildingModal(false)
    showToast(`Building added — ${name}`)
  }

  const submitBroker = (form) => {
    const name = form.name.trim()
    setBrokers((bs) => [...bs, { id: `br${Date.now()}`, name, contacts: [] }])
    setBrokerModal(false)
    showToast(`Broker added — ${name}`)
  }

  const submitContact = (form) => {
    const broker = brokers.find((b) => b.id === contactModal)
    if (!broker) return
    const name = form.name.trim()
    const contact = { id: `c${Date.now()}`, name, init: initialsOf(name) }
    setBrokers((bs) => bs.map((b) => (b.id === broker.id ? { ...b, contacts: [...b.contacts, contact] } : b)))
    setContactModal(null)
    showToast(`Contact added — ${name} (${broker.name})`)
  }

  const submitManager = (form) => {
    const name = form.name.trim()
    setManagers((ms) => [...ms, { id: `mg${Date.now()}`, name, init: initialsOf(name) }])
    setManagerModal(false)
    showToast(`Asset manager added — ${name}`)
  }

  if (!ready) {
    return (
      <div className="app" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <span className="mlabel">LOADING PORTFOLIO…</span>
      </div>
    )
  }

  const counts = {
    assets: assets.length,
    active: leads.filter(isActive).length,
    brokers: brokers.length,
    managers: managers.length,
  }

  return (
    <div className="app">
      <Sidebar view={view} counts={counts} onNav={setView} onNewLead={() => setLeadModal('')} />
      <main className="main">
        {view === 'dashboard' && (
          <Dashboard
            assets={assets}
            leads={leads}
            fAsset={fAsset}
            fSub={fSub}
            setFAsset={setFAsset}
            setFSub={setFSub}
            openAsset={openAsset}
          />
        )}
        {view === 'assets' && (
          <Assets assets={assets} leads={leads} openAsset={openAsset} onNewAsset={() => setAssetModal(true)} />
        )}
        {detailAsset && (
          <AssetDetail
            asset={detailAsset}
            leads={leads}
            brokers={brokers}
            managers={managers}
            stages={stages}
            goAssets={() => setView('assets')}
            onAddLead={() => setLeadModal(detailAsset.id)}
            onAddBuilding={() => setBuildingModal(true)}
          />
        )}
        {view === 'pipeline' && (
          <Pipeline
            assets={assets}
            leads={leads}
            brokers={brokers}
            stages={stages}
            pAsset={pAsset}
            setPAsset={setPAsset}
            openAsset={openAsset}
            moveLead={moveLead}
            onAddStage={addStage}
            onRenameStage={renameStage}
            onRemoveStage={removeStage}
          />
        )}
        {view === 'brokers' && (
          <Brokers
            brokers={brokers}
            assets={assets}
            leads={leads}
            onAddBroker={() => setBrokerModal(true)}
            onAddContact={(brokerId) => setContactModal(brokerId)}
          />
        )}
        {view === 'managers' && (
          <Managers managers={managers} assets={assets} leads={leads} onAdd={() => setManagerModal(true)} />
        )}
      </main>

      {leadModal !== null && (
        <LeadModal
          assets={assets}
          brokers={brokers}
          firstStageLabel={stages[0].label}
          initialAssetId={leadModal}
          onClose={() => setLeadModal(null)}
          onSubmit={submitLead}
        />
      )}
      {assetModal && (
        <AssetModal managers={managers} brokers={brokers} onClose={() => setAssetModal(false)} onSubmit={submitAsset} />
      )}
      {buildingModal && detailAsset && (
        <BuildingModal assetName={detailAsset.name} onClose={() => setBuildingModal(false)} onSubmit={submitBuilding} />
      )}
      {brokerModal && <BrokerModal onClose={() => setBrokerModal(false)} onSubmit={submitBroker} />}
      {contactModal !== null && (
        <ContactModal
          brokerName={brokers.find((b) => b.id === contactModal)?.name ?? ''}
          onClose={() => setContactModal(null)}
          onSubmit={submitContact}
        />
      )}
      {managerModal && <ManagerModal onClose={() => setManagerModal(false)} onSubmit={submitManager} />}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
