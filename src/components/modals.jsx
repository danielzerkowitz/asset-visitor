import { useState } from 'react'
import { areaLabel, rentLabel, sizeLabel } from '../units.js'
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

export function AssetModal({ managers, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '', loc: '', type: 'Office', structure: 'park',
    manager: managers[0]?.id ?? '', sqm: '', units: '', rent: '',
  })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const single = form.structure === 'single'
  const canSubmit = !!(form.name.trim() && (!single || (Number(form.sqm) > 0 && Number(form.units) > 0)))
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
        {single && (
          <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label={`${areaLabel()} *`}>
              <input className="field" type="number" min="0" value={form.sqm} onChange={set('sqm')} placeholder="3100" />
            </Field>
            <Field label="UNITS *">
              <input className="field" type="number" min="0" value={form.units} onChange={set('units')} placeholder="9" />
            </Field>
            <Field label={rentLabel()}>
              <input className="field" type="number" min="0" value={form.rent} onChange={set('rent')} placeholder="185" />
            </Field>
          </div>
        )}
      </div>
    </Modal>
  )
}

export function BuildingModal({ assetName, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', sqm: '', units: '', rent: '' })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const canSubmit = !!(form.name.trim() && Number(form.sqm) > 0 && Number(form.units) > 0)

  return (
    <Modal
      title="Add building"
      sub={`New building in ${assetName} · starts 100% vacant`}
      width={480}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="NAME *">
          <input className="field" value={form.name} onChange={set('name')} placeholder="e.g. Building E" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Field label={`${areaLabel()} *`}>
            <input className="field" type="number" min="0" value={form.sqm} onChange={set('sqm')} placeholder="2800" />
          </Field>
          <Field label="UNITS *">
            <input className="field" type="number" min="0" value={form.units} onChange={set('units')} placeholder="8" />
          </Field>
          <Field label={rentLabel()}>
            <input className="field" type="number" min="0" value={form.rent} onChange={set('rent')} placeholder="165" />
          </Field>
        </div>
      </div>
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
