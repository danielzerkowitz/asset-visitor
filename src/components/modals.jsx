import { useState } from 'react'
import { sizeLabel } from '../units.js'
import { findAsset } from '../lib.js'
import { Field, Modal, Select } from './ui.jsx'

const TYPE_OPTIONS = [
  { id: 'Office', label: 'Office' },
  { id: 'Retail', label: 'Retail' },
  { id: 'Industrial', label: 'Industrial' },
]

export function LeadModal({ assets, brokers, firstStageLabel, initialAssetId, onClose, onSubmit }) {
  const firstContact = brokers.flatMap((b) => b.contacts)[0]
  const [form, setForm] = useState({
    company: '', contact: '', type: 'Office', sqm: '',
    asset: initialAssetId || '', sub: '', brokerContact: firstContact?.id ?? '',
  })
  const set = (key) => (e) => {
    const v = e.target.value
    setForm((f) => (key === 'asset' ? { ...f, asset: v, sub: '' } : { ...f, [key]: v }))
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
  const canSubmit = form.company.trim() && form.contact.trim() && form.asset && Number(form.sqm) > 0

  return (
    <Modal
      title="New lead"
      sub={`Starts in the “${firstStageLabel}” stage of the pipeline`}
      width={530}
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSubmit} onClick={() => canSubmit && onSubmit(form)}>
            Add lead
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
            groups={brokers
              .filter((b) => b.contacts.length)
              .map((b) => ({ label: b.name, options: b.contacts.map((c) => ({ id: c.id, label: c.name })) }))}
          />
        </Field>
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
