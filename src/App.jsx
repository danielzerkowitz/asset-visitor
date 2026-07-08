import { useRef, useState } from 'react'
import { fromIn } from './units.js'
import { eventTypeLabel, findAsset, findContact, initialsOf, isActive, leadEvents, shortName } from './lib.js'
import useStore from './useStore.js'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import Assets from './components/Assets.jsx'
import AssetDetail from './components/AssetDetail.jsx'
import Leads from './components/Leads.jsx'
import LeadDetail from './components/LeadDetail.jsx'
import Pipeline from './components/Pipeline.jsx'
import Brokers from './components/Brokers.jsx'
import Managers from './components/Managers.jsx'
import Config from './components/Config.jsx'
import { AssetModal, BrokerModal, BuildingModal, ContactModal, EditAssetModal, EditBrokerModal, EditBuildingModal, EditContactModal, EditManagerModal, LeadModal, ManagerModal } from './components/modals.jsx'

// Dot colors handed out to user-created stages, first unused wins.
const STAGE_DOTS = ['#948A7B', '#B08327', '#C05F2E', '#9D4A26', '#74803B', '#4C8355', '#3F7A6E', '#9A7B2E', '#6E7A3D', '#A85A32']

export default function App() {
  const {
    assets, setAssets,
    brokers, setBrokers,
    managers, setManagers,
    stages, setStages,
    leads, setLeads,
    eventTypes, setEventTypes,
    ready,
  } = useStore()

  const [view, setView] = useState('dashboard')
  const [assetId, setAssetId] = useState(null)
  const [leadId, setLeadId] = useState(null)

  const [fAsset, setFAsset] = useState('all')
  const [fSub, setFSub] = useState('all')
  const [pAsset, setPAsset] = useState('all')

  // null = closed; leadModal holds the pre-selected asset id ('' = none)
  const [leadModal, setLeadModal] = useState(null)
  const [assetModal, setAssetModal] = useState(false)
  const [buildingModal, setBuildingModal] = useState(false)
  // null = closed; otherwise the id of the building being edited (within detailAsset)
  const [editBuilding, setEditBuilding] = useState(null)
  const [editAsset, setEditAsset] = useState(false)
  // null = closed; otherwise the id of the lead being edited
  const [editLead, setEditLead] = useState(null)
  const [brokerModal, setBrokerModal] = useState(false)
  // null = closed; otherwise the id of the broker being edited
  const [editBroker, setEditBroker] = useState(null)
  // null = closed; otherwise the id of the broker the new contact belongs to
  const [contactModal, setContactModal] = useState(null)
  // null = closed; otherwise the id of the contact being edited
  const [editContact, setEditContact] = useState(null)
  const [managerModal, setManagerModal] = useState(false)
  // null = closed; otherwise the id of the manager being edited
  const [editManager, setEditManager] = useState(null)

  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)
  const showToast = (msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(''), 2600)
  }

  const openAsset = (id) => { setAssetId(id); setView('detail') }
  const detailAsset = view === 'detail' && assetId ? findAsset(assets, assetId) : null
  const editBrokerObj = editBroker ? brokers.find((b) => b.id === editBroker) : null
  // findContact attaches the owning broker as `.broker`
  const editContactObj = editContact ? findContact(brokers, editContact) : null
  const editManagerObj = editManager ? managers.find((m) => m.id === editManager) : null

  const openLead = (id) => { setLeadId(id); setView('lead') }
  const detailLead = view === 'lead' && leadId ? leads.find((l) => l.id === leadId) : null

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
      tenantKind: form.tenantKind,
      dealType: form.dealType || null,
      activity: form.activity.trim() || null,
      timing: form.timing.trim() || null,
      visits: [],
      next: 'First call to book',
    }
    setLeads((ls) => [lead, ...ls])
    setLeadModal(null)
    openLead(lead.id)
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
        ? [{ id: 'main', name: `${name} (whole building)`, short: '', single: true, sqm: 0, occ: 0, units: 0, vacant: 0, rent: 0 }]
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
      sqm: 0, occ: 0, units: 0, vacant: 0, rent: 0,
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

  const updateLead = (id, form) => {
    const firm = brokers.find((b) => b.contacts.some((c) => c.id === form.brokerContact))
    setLeads((ls) =>
      ls.map((l) =>
        l.id !== id
          ? l
          : {
              ...l,
              company: form.company.trim(),
              contact: form.contact.trim(),
              type: form.type,
              sqm: form.sqm === '' ? 0 : fromIn(Number(form.sqm)),
              assetId: form.asset,
              subId: form.sub || null,
              broker: firm?.id ?? null,
              brokerContact: form.brokerContact || null,
              tenantKind: form.tenantKind,
              dealType: form.dealType || null,
              activity: form.activity.trim() || null,
              timing: form.timing.trim() || null,
              intro: form.intro || null,
              lastProposal: form.lastProposal || null,
              proposalAgreed: form.proposalAgreed || null,
              next: form.next.trim(),
            }
      )
    )
    setEditLead(null)
    showToast(`Lead updated — ${form.company.trim()}`)
  }

  const deleteLead = (id) => {
    const lead = leads.find((l) => l.id === id)
    if (!lead) return
    setLeads((ls) => ls.filter((l) => l.id !== id))
    setEditLead(null)
    if (view === 'lead') setView('leads')
    showToast(`Lead deleted — ${lead.company}`)
  }

  const addLeadEvent = (id, form) => {
    const lead = leads.find((l) => l.id === id)
    if (!lead) return
    const ev = { id: `e${Date.now()}`, type: form.type, date: form.date, note: form.note.trim() }
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, events: [...(l.events || []), ev] } : l)))
    showToast(`${eventTypeLabel(ev.type, eventTypes)} logged — ${lead.company}`)
  }

  const removeLeadEvent = (id, evId) => {
    setLeads((ls) =>
      ls.map((l) => {
        if (l.id !== id) return l
        // legacy entries live in the imported `visits` date array, keyed by index
        if (evId.startsWith('legacy-')) {
          const idx = Number(evId.slice('legacy-'.length))
          return { ...l, visits: (l.visits || []).filter((_, i) => i !== idx) }
        }
        return { ...l, events: (l.events || []).filter((e) => e.id !== evId) }
      })
    )
    showToast('Log entry removed')
  }

  const addEventType = (label) => {
    setEventTypes((ts) => [...ts, { id: `et${Date.now()}`, label }])
    showToast(`Activity type added — ${label}`)
  }

  const renameEventType = (id, label) => {
    setEventTypes((ts) => ts.map((t) => (t.id === id ? { ...t, label } : t)))
    showToast(`Activity type renamed — ${label}`)
  }

  const removeEventType = (id) => {
    const t = eventTypes.find((x) => x.id === id)
    if (!t) return
    if (eventTypes.length === 1) {
      showToast('The log needs at least one activity type')
      return
    }
    const n = leads.reduce((acc, l) => acc + leadEvents(l).filter((e) => e.type === id).length, 0)
    if (n) {
      showToast(`${n} log ${n === 1 ? 'entry uses' : 'entries use'} “${t.label}” — remove them first`)
      return
    }
    setEventTypes((ts) => ts.filter((x) => x.id !== id))
    showToast(`Activity type removed — ${t.label}`)
  }

  const updateAsset = (form) => {
    if (!detailAsset) return
    const name = form.name.trim()
    setAssets((as) =>
      as.map((a) =>
        a.id !== detailAsset.id
          ? a
          : {
              ...a,
              name,
              short: shortName(name),
              loc: form.loc.trim() || '—',
              type: form.type,
              manager: form.manager || null,
              tenantRep: form.tenantRep || null,
            }
      )
    )
    setEditAsset(false)
    showToast(`Asset updated — ${name}`)
  }

  const deleteAsset = () => {
    if (!detailAsset) return
    const n = leads.filter((l) => l.assetId === detailAsset.id).length
    if (n) {
      showToast(`Reassign or delete ${n} ${n === 1 ? 'lead' : 'leads'} first`)
      return
    }
    const name = detailAsset.name
    setAssets((as) => as.filter((a) => a.id !== detailAsset.id))
    setEditAsset(false)
    setView('assets')
    showToast(`Asset deleted — ${name}`)
  }

  const renameBuilding = (name) => {
    if (!detailAsset || !editBuilding) return
    setAssets((as) =>
      as.map((a) =>
        a.id !== detailAsset.id
          ? a
          : { ...a, subs: a.subs.map((s) => (s.id === editBuilding ? { ...s, name, short: shortName(name) } : s)) }
      )
    )
    setEditBuilding(null)
    showToast(`Building renamed — ${name}`)
  }

  const deleteBuilding = () => {
    if (!detailAsset || !editBuilding) return
    const sub = detailAsset.subs.find((s) => s.id === editBuilding)
    if (!sub) return
    const moved = leads.filter((l) => l.assetId === detailAsset.id && l.subId === editBuilding).length
    setAssets((as) =>
      as.map((a) => (a.id !== detailAsset.id ? a : { ...a, subs: a.subs.filter((s) => s.id !== editBuilding) }))
    )
    if (moved) {
      // leads assigned to the removed building fall back to the whole asset
      setLeads((ls) =>
        ls.map((l) => (l.assetId === detailAsset.id && l.subId === editBuilding ? { ...l, subId: null } : l))
      )
    }
    setEditBuilding(null)
    showToast(`Building removed — ${sub.name}${moved ? ` (${moved} ${moved === 1 ? 'lead' : 'leads'} → whole asset)` : ''}`)
  }

  const submitBroker = (form) => {
    const name = form.name.trim()
    setBrokers((bs) => [...bs, { id: `br${Date.now()}`, name, contacts: [] }])
    setBrokerModal(false)
    showToast(`Broker added — ${name}`)
  }

  const renameBroker = (name) => {
    setBrokers((bs) => bs.map((b) => (b.id === editBroker ? { ...b, name } : b)))
    setEditBroker(null)
    showToast(`Broker renamed — ${name}`)
  }

  const deleteBroker = () => {
    const broker = brokers.find((b) => b.id === editBroker)
    if (!broker) return
    const contactIds = broker.contacts.map((c) => c.id)
    const linked = (l) => l.broker === broker.id || contactIds.includes(l.brokerContact)
    const unlinked = leads.filter(linked).length
    setBrokers((bs) => bs.filter((b) => b.id !== broker.id))
    if (unlinked) {
      // its leads keep running, just without a broker attached
      setLeads((ls) => ls.map((l) => (linked(l) ? { ...l, broker: null, brokerContact: null } : l)))
    }
    if (assets.some((a) => a.tenantRep === broker.id)) {
      setAssets((as) => as.map((a) => (a.tenantRep === broker.id ? { ...a, tenantRep: null } : a)))
    }
    setEditBroker(null)
    showToast(`Broker deleted — ${broker.name}${unlinked ? ` (${unlinked} ${unlinked === 1 ? 'lead' : 'leads'} → no broker)` : ''}`)
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

  const updateContact = (form) => {
    if (!editContactObj) return
    const from = editContactObj.broker
    const raw = from.contacts.find((c) => c.id === editContactObj.id)
    if (!raw) return
    const name = form.name.trim()
    const next = { ...raw, name, init: initialsOf(name) }
    const moved = form.broker !== from.id
    setBrokers((bs) =>
      bs.map((b) => {
        if (!moved) return b.id === from.id ? { ...b, contacts: b.contacts.map((c) => (c.id === next.id ? next : c)) } : b
        if (b.id === from.id) return { ...b, contacts: b.contacts.filter((c) => c.id !== next.id) }
        if (b.id === form.broker) return { ...b, contacts: [...b.contacts, next] }
        return b
      })
    )
    if (moved) {
      // the contact's leads follow them to the new brokerage
      setLeads((ls) => ls.map((l) => (l.brokerContact === next.id ? { ...l, broker: form.broker } : l)))
    }
    setEditContact(null)
    const to = brokers.find((b) => b.id === form.broker)
    showToast(moved ? `Contact updated — ${name} moved to ${to?.name ?? 'new brokerage'}` : `Contact updated — ${name}`)
  }

  const deleteContact = () => {
    if (!editContactObj) return
    const from = editContactObj.broker
    const n = leads.filter((l) => l.brokerContact === editContactObj.id).length
    setBrokers((bs) =>
      bs.map((b) => (b.id === from.id ? { ...b, contacts: b.contacts.filter((c) => c.id !== editContactObj.id) } : b))
    )
    if (n) {
      // leads stay with the brokerage, just without a contact person
      setLeads((ls) => ls.map((l) => (l.brokerContact === editContactObj.id ? { ...l, brokerContact: null } : l)))
    }
    setEditContact(null)
    showToast(`Contact deleted — ${editContactObj.name}${n ? ` (${n} ${n === 1 ? 'lead' : 'leads'} → no contact)` : ''}`)
  }

  const updateManager = (form) => {
    if (!editManagerObj) return
    setManagers((ms) => ms.map((m) => (m.id === editManagerObj.id ? { ...m, name: form.name, init: initialsOf(form.name) } : m)))
    setAssets((as) =>
      as.map((a) => {
        if (form.assetIds.includes(a.id)) return a.manager === editManagerObj.id ? a : { ...a, manager: editManagerObj.id }
        return a.manager === editManagerObj.id ? { ...a, manager: null } : a
      })
    )
    setEditManager(null)
    showToast(`Manager updated — ${form.name}`)
  }

  const deleteManager = () => {
    if (!editManagerObj) return
    const n = assets.filter((a) => a.manager === editManagerObj.id).length
    setManagers((ms) => ms.filter((m) => m.id !== editManagerObj.id))
    if (n) {
      setAssets((as) => as.map((a) => (a.manager === editManagerObj.id ? { ...a, manager: null } : a)))
    }
    setEditManager(null)
    showToast(`Manager deleted — ${editManagerObj.name}${n ? ` (${n} ${n === 1 ? 'asset' : 'assets'} unassigned)` : ''}`)
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
    leads: leads.length,
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
            onEditBuilding={(subId) => setEditBuilding(subId)}
            onEditAsset={() => setEditAsset(true)}
            onOpenLead={openLead}
          />
        )}
        {view === 'leads' && (
          <Leads
            assets={assets}
            leads={leads}
            brokers={brokers}
            stages={stages}
            openLead={openLead}
            onNewLead={() => setLeadModal('')}
          />
        )}
        {detailLead && (
          <LeadDetail
            lead={detailLead}
            assets={assets}
            brokers={brokers}
            stages={stages}
            eventTypes={eventTypes}
            goLeads={() => setView('leads')}
            openAsset={openAsset}
            onEdit={() => setEditLead(detailLead.id)}
            moveLead={moveLead}
            onAddEvent={(form) => addLeadEvent(detailLead.id, form)}
            onRemoveEvent={(evId) => removeLeadEvent(detailLead.id, evId)}
            onToast={showToast}
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
            onOpenLead={openLead}
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
            onEditBroker={(brokerId) => setEditBroker(brokerId)}
            onEditContact={(contactId) => setEditContact(contactId)}
          />
        )}
        {view === 'config' && (
          <Config
            eventTypes={eventTypes}
            leads={leads}
            onAddType={addEventType}
            onRenameType={renameEventType}
            onRemoveType={removeEventType}
          />
        )}
        {view === 'managers' && (
          <Managers
            managers={managers}
            assets={assets}
            leads={leads}
            onAdd={() => setManagerModal(true)}
            onEdit={(managerId) => setEditManager(managerId)}
          />
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
      {editLead && leads.some((l) => l.id === editLead) && (
        <LeadModal
          assets={assets}
          brokers={brokers}
          lead={leads.find((l) => l.id === editLead)}
          onClose={() => setEditLead(null)}
          onSubmit={(form) => updateLead(editLead, form)}
          onDelete={() => deleteLead(editLead)}
        />
      )}
      {editAsset && detailAsset && (
        <EditAssetModal
          asset={detailAsset}
          managers={managers}
          brokers={brokers}
          leadCount={leads.filter((l) => l.assetId === detailAsset.id).length}
          onClose={() => setEditAsset(false)}
          onSubmit={updateAsset}
          onDelete={deleteAsset}
        />
      )}
      {editBuilding && detailAsset && detailAsset.subs.some((s) => s.id === editBuilding) && (
        <EditBuildingModal
          building={detailAsset.subs.find((s) => s.id === editBuilding)}
          leadCount={leads.filter((l) => l.assetId === detailAsset.id && l.subId === editBuilding && isActive(l)).length}
          onClose={() => setEditBuilding(null)}
          onRename={renameBuilding}
          onDelete={deleteBuilding}
        />
      )}
      {brokerModal && <BrokerModal onClose={() => setBrokerModal(false)} onSubmit={submitBroker} />}
      {editBrokerObj && (
        <EditBrokerModal
          broker={editBrokerObj}
          leadCount={leads.filter((l) => l.broker === editBrokerObj.id || editBrokerObj.contacts.some((c) => c.id === l.brokerContact)).length}
          onClose={() => setEditBroker(null)}
          onRename={renameBroker}
          onDelete={deleteBroker}
        />
      )}
      {contactModal !== null && (
        <ContactModal
          brokerName={brokers.find((b) => b.id === contactModal)?.name ?? ''}
          onClose={() => setContactModal(null)}
          onSubmit={submitContact}
        />
      )}
      {editContactObj && (
        <EditContactModal
          contact={editContactObj}
          brokers={brokers}
          leadCount={leads.filter((l) => l.brokerContact === editContactObj.id).length}
          onClose={() => setEditContact(null)}
          onSubmit={updateContact}
          onDelete={deleteContact}
        />
      )}
      {managerModal && <ManagerModal onClose={() => setManagerModal(false)} onSubmit={submitManager} />}
      {editManagerObj && (
        <EditManagerModal
          manager={editManagerObj}
          managers={managers}
          assets={assets}
          onClose={() => setEditManager(null)}
          onSubmit={updateManager}
          onDelete={deleteManager}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
