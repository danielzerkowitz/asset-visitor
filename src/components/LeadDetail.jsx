import { useState } from 'react'
import { area } from '../units.js'
import { eventTypeLabel, findContact, fmtDate, leadEvents, whereLabel } from '../lib.js'
import useDictation from '../useDictation.js'
import { Select } from './ui.jsx'

export default function LeadDetail({
  lead, assets, brokers, stages, eventTypes,
  goLeads, openAsset, onEdit, moveLead,
  onAddEvent, onRemoveEvent, onToast,
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [evForm, setEvForm] = useState({ type: 'call', date: today, note: '' })

  const contact = findContact(brokers, lead.brokerContact)
  const events = leadEvents(lead).slice().reverse()
  const visits = events.filter((e) => e.type === 'visit').length

  // If the picked type got deleted meanwhile, fall back to the first one.
  const typeValue = eventTypes.some((t) => t.id === evForm.type) ? evForm.type : (eventTypes[0]?.id ?? '')

  const dict = useDictation(
    (fn) => setEvForm((f) => ({ ...f, note: fn(f.note) })),
    onToast
  )

  const canLog = !!evForm.date && !!typeValue
  const submitEvent = () => {
    if (!canLog) return
    onAddEvent({ ...evForm, type: typeValue })
    setEvForm((f) => ({ ...f, note: '' }))
  }

  return (
    <div className="page" style={{ paddingTop: 22 }}>
      <div>
        <button className="btn-back" onClick={goLeads}>← ALL LEADS</button>
        <div className="page-head" style={{ marginTop: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="page-title" style={{ fontSize: 24 }}>{lead.company}</h1>
              <span className="type-chip">{lead.type.toUpperCase()}</span>
            </div>
            <div className="page-sub" style={{ marginTop: 4 }}>
              {lead.contact || 'No contact'} · seeking {lead.sqm ? area(lead.sqm) : '—'} ·{' '}
              <button className="btn-inline" onClick={() => openAsset(lead.assetId)}>{whereLabel(assets, lead)}</button>
              {contact && <> · via {contact.name} ({contact.broker.name})</>}
              {lead.next && <> · Next: {lead.next}</>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="mlabel">STAGE</span>
            <Select
              bar
              value={lead.stage}
              onChange={(e) => moveLead(lead.id, e.target.value)}
              options={stages.map((s) => ({ id: s.id, label: s.label }))}
              style={{ maxWidth: 150 }}
            />
            <button className="btn-secondary" onClick={onEdit}>Edit lead</button>
          </div>
        </div>
      </div>

      <div className="card card--clip">
        <div className="card-head">
          <span className="card-title">Deal profile</span>
          <button className="btn-secondary btn-secondary--sm" onClick={onEdit}>Edit</button>
        </div>
        <div className="prof prof--grid">
          <ProfCell label="TENANT">
            {lead.tenantKind === 'current'
              ? `Current tenant${lead.dealType ? ` · ${lead.dealType}` : ''}`
              : 'New tenant'}
          </ProfCell>
          <ProfCell label="SECTOR" empty={!lead.activity}>{lead.activity || 'Not set'}</ProfCell>
          <ProfCell label="TIMING" empty={!lead.timing}>{lead.timing || 'Not set'}</ProfCell>
          <ProfCell label="INTRODUCED" empty={!lead.intro} mono>{lead.intro ? fmtDate(lead.intro) : '—'}</ProfCell>
          <ProfCell label="LAST PROPOSAL" empty={!lead.lastProposal} mono>{lead.lastProposal ? fmtDate(lead.lastProposal) : '—'}</ProfCell>
          <ProfCell label="AGREED" empty={!lead.proposalAgreed} mono>{lead.proposalAgreed ? fmtDate(lead.proposalAgreed) : '—'}</ProfCell>
        </div>
      </div>

      <div className="card card--clip">
        <div className="card-head">
          <span className="card-title">Activity log</span>
          <span className="count-chip">{events.length === 1 ? '1 entry' : `${events.length} entries`} · {visits} {visits === 1 ? 'visit' : 'visits'}</span>
        </div>
        <div className="add-ev">
          <Select
            value={typeValue}
            onChange={(e) => setEvForm((f) => ({ ...f, type: e.target.value }))}
            options={eventTypes}
            style={{ width: 140, flex: 'none' }}
          />
          <input
            className="field"
            type="date"
            style={{ width: 150, flex: 'none' }}
            value={evForm.date}
            onChange={(e) => setEvForm((f) => ({ ...f, date: e.target.value }))}
          />
          <input
            className="field field--note"
            placeholder={
              dict.state === 'listening' ? 'Listening… speak now'
              : dict.state === 'transcribing' ? 'Transcribing…'
              : 'Note (optional) — e.g. toured Building B, liked the light'
            }
            value={evForm.note}
            onChange={(e) => setEvForm((f) => ({ ...f, note: e.target.value }))}
            onKeyDown={(e) => { if (e.key === 'Enter') submitEvent() }}
          />
          {dict.supported && (
            <button
              className={`btn-mic${dict.state === 'listening' ? ' btn-mic--on' : ''}`}
              style={{ flex: 'none' }}
              disabled={dict.state === 'transcribing'}
              title={dict.state === 'listening' ? 'Stop dictation' : 'Dictate the note'}
              onClick={dict.toggle}
            >
              <span className="mic-dot" />
              {dict.state === 'listening' ? 'Stop' : dict.state === 'transcribing' ? 'Transcribing…' : 'Dictate'}
            </button>
          )}
          <button className="btn-primary" style={{ flex: 'none' }} disabled={!canLog} onClick={submitEvent}>Log</button>
        </div>
        {events.map((e) => (
          <div key={e.id} className="ev-row">
            <span className={`ev-chip${e.type === 'visit' ? ' ev-chip--visit' : ''}`}>
              {eventTypeLabel(e.type, eventTypes).toUpperCase()}
            </span>
            <span className="ev-note">{e.note || <span style={{ color: 'var(--faint)' }}>{e.legacy ? 'Imported visit' : '—'}</span>}</span>
            <span className="ev-date">{fmtDate(e.date)}</span>
            <button className="ev-del" title="Remove entry" onClick={() => onRemoveEvent(e.id)}>✕</button>
          </div>
        ))}
        {events.length === 0 && (
          <div style={{ padding: '14px 16px', fontSize: 12, color: 'var(--faint)', borderTop: '1px solid var(--bd-row)' }}>
            Nothing logged yet — record the first call, email or visit above.
          </div>
        )}
      </div>
    </div>
  )
}

function ProfCell({ label, empty, mono, children }) {
  return (
    <div className="prof-cell">
      <span className="mlabel mlabel--sm">{label}</span>
      <span
        style={{
          fontSize: 12.5,
          color: empty ? 'var(--faint)' : 'var(--ink-2)',
          ...(mono && !empty ? { fontFamily: 'var(--mono)', fontSize: 11.5 } : {}),
        }}
      >
        {children}
      </span>
    </div>
  )
}
