import { useState } from 'react'
import { cv, sizeLabel } from '../units.js'
import { DEAL_TYPES, TENANT_KINDS, findAsset } from '../lib.js'
import { Field, Modal, Select } from './ui.jsx'

const TYPE_OPTIONS = [
  { id: 'Office', label: 'Office' },
  { id: 'Retail', label: 'Retail' },
  { id: 'Industrial', label: 'Industrial' },
]

export function LeadModal({ assets, brokers, firstStageLabel, initialAssetId, lead, onClose, onSubmit, onDelete }) {
  const editing = !!lead
  const firstContact = brokers.flatMap((b) => b.contacts)[0]
  const [form, setForm] = useState(() =>
    editing
      ? {
          company: lead.company, contact: lead.contact || '', type: lead.type,
          sqm: lead.sqm ? String(Math.round(cv(lead.sqm))) : '',
          asset: lead.assetId, sub: lead.subId || '',
          brokerContact: lead.brokerContact || '', next: lead.next || '',
          tenantKind: lead.tenantKind || 'new', dealType: lead.dealType || '',
          activity: lead.activity || '', timing: lead.timing || '',
          intro: lead.intro || '', lastProposal: lead.lastProposal || '', proposalAgreed: lead.proposalAgreed || '',
        }
      : {
          company: '', contact: '', type: 'Office', sqm: '',
          asset: initialAssetId || '', sub: '', brokerContact: firstContact?.id ?? '', next: '',
          tenantKind: 'new', dealType: '', activity: '', timing: '',
        }
  )
  const set = (key) => (e) => {
    const v = e.target.value
    setForm((f) => {
      if (key === 'asset') return { ...f, asset: v, sub: '' }
      // deal type is meaningless for a new tenant — drop it on the switch
      if (key === 'tenantKind') return { ...f, tenantKind: v, dealType: v === 'new' ? '' : f.dealType }
      return { ...f, [key]: v }
    })
  }

  const mAsset = form.asset ? findAsset(assets, form.asset) : null
  const mMulti = mAsset ? mAsset.subs.filter((s) => !s.single) : []
  const assetOptions = [{ id: '', label: 'Select asset…' }, ...assets.map((a) => ({ id: a.id, label: a.name }))]
  const subOptions = mAsset
    ? mMulti.length
      ? [{ id: '', label: 'Whole asset' }, ...mMulti.map((s) => ({ id: s.id, label: s.name }))]
      : [{ id: '', label: 'Whole building' }]
    : [{ id: '', label: 'Select an asset first' }]
  const subDisabled = !mAsset || mMulti.length === 0
  // Imported deal types can fall outside the standard three — keep them selectable.
  const dealOptions = [
    { id: '', label: 'Not set' },
    ...DEAL_TYPES,
    ...(form.dealType && !DEAL_TYPES.some((t) => t.id === form.dealType)
      ? [{ id: form.dealType, label: form.dealType }]
      : []),
  ]
  // Imported leads may lack a contact person or size — don't block saving them.
  const canSubmit = editing
    ? !!(form.company.trim() && form.asset)
    : !!(form.company.trim() && form.contact.trim() && form.asset && Number(form.sqm) > 0)

  return (
    <Modal
      title={editing ? 'Edit lead' : 'New lead'}
      sub={editing ? `Deal with ${lead.company}` : `Starts in the “${firstStageLabel}” stage of the pipeline`}
      width={530}
      onClose={onClose}
      footer={
        <>
          {editing && (
            <button className="btn-danger" style={{ marginRight: 'auto' }} onClick={() => onDelete()}>
              Delete lead
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSubmit} onClick={() => canSubmit && onSubmit(form)}>
            {editing ? 'Save' : 'Add lead'}
          </button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="COMPANY *">
          <input className="field" value={form.company} onChange={set('company')} placeholder="e.g. Vectis Group" />
        </Field>
        <Field label="CONTACT *">
          <input className="field" value={form.contact} onChange={set('contact')} placeholder="Full name" />
        </Field>
        <Field label="SPACE TYPE">
          <Select value={form.type} onChange={set('type')} options={TYPE_OPTIONS} />
        </Field>
        <Field label={sizeLabel()}>
          <input className="field" type="number" min="0" value={form.sqm} onChange={set('sqm')} placeholder="450" />
        </Field>
        <Field label="ASSIGN TO ASSET *">
          <Select value={form.asset} onChange={set('asset')} options={assetOptions} />
        </Field>
        <Field label="BUILDING">
          <Select faded value={form.sub} onChange={set('sub')} options={subOptions} disabled={subDisabled} />
        </Field>
        <Field label="BROKER CONTACT">
          <Select
            value={form.brokerContact}
            onChange={set('brokerContact')}
            options={[{ id: '', label: 'No broker contact' }]}
            groups={brokers
              .filter((b) => b.contacts.length)
              .map((b) => ({ label: b.name, options: b.contacts.map((c) => ({ id: c.id, label: c.name })) }))}
          />
        </Field>
        <Field label="TENANT">
          <Select value={form.tenantKind} onChange={set('tenantKind')} options={TENANT_KINDS} />
        </Field>
        <Field label="DEAL TYPE">
          <Select faded value={form.dealType} onChange={set('dealType')} options={dealOptions} disabled={form.tenantKind !== 'current'} />
        </Field>
        <Field label="SECTOR">
          <input className="field" value={form.activity} onChange={set('activity')} placeholder="e.g. Biotech research" />
        </Field>
        <Field label="TIMING">
          <input className="field" value={form.timing} onChange={set('timing')} placeholder="e.g. Q2 2027" />
        </Field>
        {editing && (
          <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="INTRODUCED">
              <input className="field" type="date" value={form.intro} onChange={set('intro')} />
            </Field>
            <Field label="LAST PROPOSAL">
              <input className="field" type="date" value={form.lastProposal} onChange={set('lastProposal')} />
            </Field>
            <Field label="PROPOSAL AGREED">
              <input className="field" type="date" value={form.proposalAgreed} onChange={set('proposalAgreed')} />
            </Field>
          </div>
        )}
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="NEXT STEP">
            <input
              className="field"
              value={form.next}
              onChange={set('next')}
              placeholder="e.g. Follow-up call Friday"
            />
          </Field>
        </div>
      </div>
    </Modal>
  )
}

export function AssetModal({ managers, brokers, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '', loc: '', type: 'Office', structure: 'park',
    manager: managers[0]?.id ?? '', tenantRep: '',
  })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const canSubmit = !!form.name.trim()
  const structOptions = [
    { id: 'park', label: 'Park (multi-building)' },
    { id: 'single', label: 'Single building' },
  ]

  return (
    <Modal
      title="New asset"
      sub="A single building, or a park holding multiple buildings"
      width={530}
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSubmit} onClick={() => canSubmit && onSubmit(form)}>
            Add asset
          </button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="NAME *">
          <input className="field" value={form.name} onChange={set('name')} placeholder="e.g. Beaulieu Office Park" />
        </Field>
        <Field label="LOCATION">
          <input className="field" value={form.loc} onChange={set('loc')} placeholder="City, country" />
        </Field>
        <Field label="TYPE">
          <Select value={form.type} onChange={set('type')} options={TYPE_OPTIONS} />
        </Field>
        <Field label="ASSET MANAGER">
          <Select value={form.manager} onChange={set('manager')} options={managers.map((m) => ({ id: m.id, label: m.name }))} />
        </Field>
        <Field label="TENANT REP">
          <Select
            value={form.tenantRep}
            onChange={set('tenantRep')}
            options={[{ id: '', label: 'None' }, ...brokers.map((b) => ({ id: b.id, label: b.name }))]}
          />
        </Field>
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="flabel">STRUCTURE</div>
          <div className="seg">
            {structOptions.map((o) => (
              <button
                key={o.id}
                className={form.structure === o.id ? 'on' : ''}
                onClick={() => setForm((f) => ({ ...f, structure: o.id }))}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function BuildingModal({ assetName, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '' })
  const canSubmit = !!form.name.trim()

  return (
    <Modal
      title="Add building"
      sub={`New building in ${assetName}`}
      width={400}
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSubmit} onClick={() => canSubmit && onSubmit(form)}>
            Add building
          </button>
        </>
      }
    >
      <Field label="NAME *">
        <input
          className="field"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
          placeholder="e.g. Building E"
        />
      </Field>
    </Modal>
  )
}

export function EditAssetModal({ asset, managers, brokers, leadCount, onClose, onSubmit, onDelete }) {
  const [form, setForm] = useState({
    name: asset.name,
    loc: asset.loc === '—' ? '' : asset.loc,
    type: asset.type,
    manager: asset.manager || '',
    tenantRep: asset.tenantRep || '',
  })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const canSave = !!form.name.trim()

  return (
    <Modal
      title="Edit asset"
      sub={leadCount ? `${leadCount} ${leadCount === 1 ? 'lead references' : 'leads reference'} this asset` : 'No leads reference this asset'}
      width={530}
      onClose={onClose}
      footer={
        <>
          <button
            className="btn-danger"
            style={{ marginRight: 'auto' }}
            title={leadCount ? 'Blocked while leads reference this asset' : undefined}
            onClick={() => onDelete()}
          >
            Delete asset
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSave} onClick={() => canSave && onSubmit(form)}>
            Save
          </button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="NAME *">
          <input className="field" value={form.name} onChange={set('name')} />
        </Field>
        <Field label="LOCATION">
          <input className="field" value={form.loc} onChange={set('loc')} placeholder="City, country" />
        </Field>
        <Field label="TYPE">
          <Select value={form.type} onChange={set('type')} options={TYPE_OPTIONS} />
        </Field>
        <Field label="ASSET MANAGER">
          <Select
            value={form.manager}
            onChange={set('manager')}
            options={[{ id: '', label: 'Unassigned' }, ...managers.map((m) => ({ id: m.id, label: m.name }))]}
          />
        </Field>
        <Field label="TENANT REP">
          <Select
            value={form.tenantRep}
            onChange={set('tenantRep')}
            options={[{ id: '', label: 'None' }, ...brokers.map((b) => ({ id: b.id, label: b.name }))]}
          />
        </Field>
      </div>
    </Modal>
  )
}

export function EditBuildingModal({ building, leadCount, onClose, onRename, onDelete }) {
  const [name, setName] = useState(building.name)
  const canSave = !!name.trim()

  return (
    <Modal
      title="Edit building"
      sub={leadCount ? `${leadCount} active ${leadCount === 1 ? 'lead is' : 'leads are'} assigned here` : 'No active leads assigned'}
      width={400}
      onClose={onClose}
      footer={
        <>
          <button
            className="btn-danger"
            style={{ marginRight: 'auto' }}
            title={leadCount ? 'Its leads move to “Whole asset”' : undefined}
            onClick={() => onDelete()}
          >
            Delete{leadCount ? ` (${leadCount} ${leadCount === 1 ? 'lead' : 'leads'} → whole asset)` : ''}
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSave} onClick={() => canSave && onRename(name.trim())}>
            Save
          </button>
        </>
      }
    >
      <Field label="NAME *">
        <input
          className="field"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && canSave) onRename(name.trim()) }}
        />
      </Field>
    </Modal>
  )
}

export function BrokerModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '' })
  const canSubmit = !!form.name.trim()

  return (
    <Modal
      title="Add broker"
      sub="External brokerage — add its contacts afterwards"
      width={400}
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSubmit} onClick={() => canSubmit && onSubmit(form)}>
            Add broker
          </button>
        </>
      }
    >
      <Field label="COMPANY NAME *">
        <input
          className="field"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
          placeholder="e.g. Quadrant Partners"
        />
      </Field>
    </Modal>
  )
}

export function EditBrokerModal({ broker, leadCount, onClose, onRename, onDelete }) {
  const [name, setName] = useState(broker.name)
  const canSave = !!name.trim()

  return (
    <Modal
      title="Edit broker"
      sub={leadCount ? `${leadCount} ${leadCount === 1 ? 'lead references' : 'leads reference'} this broker` : 'No leads reference this broker'}
      width={400}
      onClose={onClose}
      footer={
        <>
          <button
            className="btn-danger"
            style={{ marginRight: 'auto' }}
            title={leadCount ? 'Its leads keep running without a broker' : undefined}
            onClick={() => onDelete()}
          >
            Delete{leadCount ? ` (${leadCount} ${leadCount === 1 ? 'lead' : 'leads'} → no broker)` : ''}
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSave} onClick={() => canSave && onRename(name.trim())}>
            Save
          </button>
        </>
      }
    >
      <Field label="COMPANY NAME *">
        <input
          className="field"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && canSave) onRename(name.trim()) }}
        />
      </Field>
    </Modal>
  )
}

export function ContactModal({ brokerName, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '' })
  const canSubmit = !!form.name.trim()

  return (
    <Modal
      title="Add contact"
      sub={`The person you talk to at ${brokerName}`}
      width={400}
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSubmit} onClick={() => canSubmit && onSubmit(form)}>
            Add contact
          </button>
        </>
      }
    >
      <Field label="FULL NAME *">
        <input
          className="field"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
          placeholder="e.g. Nora El Amrani"
        />
      </Field>
    </Modal>
  )
}

export function EditContactModal({ contact, brokers, leadCount, onClose, onSubmit, onDelete }) {
  const [form, setForm] = useState({ name: contact.name, broker: contact.broker.id })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const canSave = !!form.name.trim()

  return (
    <Modal
      title="Edit contact"
      sub={leadCount ? `${leadCount} ${leadCount === 1 ? 'lead runs' : 'leads run'} through this contact` : 'No leads run through this contact'}
      width={400}
      onClose={onClose}
      footer={
        <>
          <button
            className="btn-danger"
            style={{ marginRight: 'auto' }}
            title={leadCount ? `Its leads stay with ${contact.broker.name}, just without a contact person` : undefined}
            onClick={() => onDelete()}
          >
            Delete{leadCount ? ` (${leadCount} ${leadCount === 1 ? 'lead' : 'leads'} → no contact)` : ''}
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSave} onClick={() => canSave && onSubmit(form)}>
            Save
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="FULL NAME *">
          <input className="field" autoFocus value={form.name} onChange={set('name')} />
        </Field>
        <Field label="BROKERAGE">
          <Select
            value={form.broker}
            onChange={set('broker')}
            options={brokers.map((b) => ({ id: b.id, label: b.name }))}
          />
        </Field>
        {form.broker !== contact.broker.id && leadCount > 0 && (
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            Their {leadCount === 1 ? 'lead moves' : `${leadCount} leads move`} with them to the new brokerage.
          </div>
        )}
      </div>
    </Modal>
  )
}

export function EditManagerModal({ manager, managers, assets, onClose, onSubmit, onDelete }) {
  const [name, setName] = useState(manager.name)
  const [assetIds, setAssetIds] = useState(() => assets.filter((a) => a.manager === manager.id).map((a) => a.id))
  const toggle = (id) => setAssetIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  const canSave = !!name.trim()
  const owned = assets.filter((a) => a.manager === manager.id).length

  return (
    <Modal
      title="Edit asset manager"
      sub={owned ? `Manages ${owned} ${owned === 1 ? 'asset' : 'assets'}` : 'Manages no assets yet'}
      width={460}
      onClose={onClose}
      footer={
        <>
          <button
            className="btn-danger"
            style={{ marginRight: 'auto' }}
            title={owned ? 'Their assets become unassigned' : undefined}
            onClick={() => onDelete()}
          >
            Delete{owned ? ` (${owned} ${owned === 1 ? 'asset' : 'assets'} → unassigned)` : ''}
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSave} onClick={() => canSave && onSubmit({ name: name.trim(), assetIds })}>
            Save
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="FULL NAME *">
          <input
            className="field"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="ASSETS MANAGED">
          <div style={{ border: '1px solid var(--bd-input)', borderRadius: 8, maxHeight: 230, overflowY: 'auto' }}>
            {assets.map((a) => {
              const other = a.manager && a.manager !== manager.id ? managers.find((m) => m.id === a.manager) : null
              return (
                <label
                  key={a.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px',
                    fontSize: 13, cursor: 'pointer', borderBottom: '1px solid var(--bd-row)',
                  }}
                >
                  <input type="checkbox" checked={assetIds.includes(a.id)} onChange={() => toggle(a.id)} />
                  <span style={{ fontWeight: 600 }}>{a.name}</span>
                  {other && (
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>now: {other.name}</span>
                  )}
                </label>
              )
            })}
            {assets.length === 0 && (
              <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--faint)' }}>No assets in the portfolio yet.</div>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 6 }}>
            Ticking an asset reassigns it here — unticking leaves it without a manager.
          </div>
        </Field>
      </div>
    </Modal>
  )
}

export function ManagerModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '' })
  const canSubmit = !!form.name.trim()

  return (
    <Modal
      title="Add asset manager"
      sub="Internal team — owns assets and mandates agents"
      width={400}
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSubmit} onClick={() => canSubmit && onSubmit(form)}>
            Add manager
          </button>
        </>
      }
    >
      <Field label="FULL NAME *">
        <input
          className="field"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
          placeholder="e.g. Pieter Vandenberghe"
        />
      </Field>
    </Modal>
  )
}
