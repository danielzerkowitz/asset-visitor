import { useState } from 'react'
import { area } from '../units.js'
import { EVENT_TYPES, eventTypeLabel, findContact, fmtDate, fmtDateTime, leadEvents, whereLabel } from '../lib.js'
import { Select } from './ui.jsx'

export default function LeadDetail({
  lead, assets, brokers, stages,
  goLeads, openAsset, onEdit, moveLead,
  onAddEvent, onRemoveEvent, onAddComment, onRemoveComment,
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [evForm, setEvForm] = useState({ type: 'call', date: today, note: '' })
  const [comment, setComment] = useState('')

  const contact = findContact(brokers, lead.brokerContact)
  const events = leadEvents(lead).slice().reverse()
  const comments = (lead.commentLog || []).slice().reverse()
  const visits = events.filter((e) => e.type === 'visit').length

  const canLog = !!evForm.date
  const submitEvent = () => {
    if (!canLog) return
    onAddEvent(evForm)
    setEvForm((f) => ({ ...f, note: '' }))
  }
  const canComment = !!comment.trim()
  const submitComment = () => {
    if (!canComment) return
    onAddComment(comment)
    setComment('')
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, alignItems: 'start' }}>
        <div className="card card--clip">
          <div className="card-head">
            <span className="card-title">Activity log</span>
            <span className="count-chip">{events.length === 1 ? '1 entry' : `${events.length} entries`} · {visits} {visits === 1 ? 'visit' : 'visits'}</span>
          </div>
          <div className="add-ev">
            <Select
              value={evForm.type}
              onChange={(e) => setEvForm((f) => ({ ...f, type: e.target.value }))}
              options={EVENT_TYPES}
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
              className="field"
              placeholder="Note (optional) — e.g. toured Building B, liked the light"
              value={evForm.note}
              onChange={(e) => setEvForm((f) => ({ ...f, note: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') submitEvent() }}
            />
            <button className="btn-primary" style={{ flex: 'none' }} disabled={!canLog} onClick={submitEvent}>Log</button>
          </div>
          {events.map((e) => (
            <div key={e.id} className="ev-row">
              <span className={`ev-chip${e.type === 'visit' ? ' ev-chip--visit' : ''}`}>
                {eventTypeLabel(e.type).toUpperCase()}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="card card--clip">
          <div className="card-head">
            <span className="card-title">Deal profile</span>
            <button className="btn-secondary btn-secondary--sm" onClick={onEdit}>Edit</button>
          </div>
          <div className="prof">
            <ProfRow label="TENANT">
              {lead.tenantKind === 'current'
                ? `Current tenant${lead.dealType ? ` · ${lead.dealType}` : ''}`
                : 'New tenant'}
            </ProfRow>
            <ProfRow label="SECTOR" empty={!lead.activity}>{lead.activity || 'Not set'}</ProfRow>
            <ProfRow label="TIMING" empty={!lead.timing}>{lead.timing || 'Not set'}</ProfRow>
            <ProfRow label="INTRODUCED" empty={!lead.intro} mono>{lead.intro ? fmtDate(lead.intro) : '—'}</ProfRow>
            <ProfRow label="LAST PROPOSAL" empty={!lead.lastProposal} mono>{lead.lastProposal ? fmtDate(lead.lastProposal) : '—'}</ProfRow>
            <ProfRow label="AGREED" empty={!lead.proposalAgreed} mono>{lead.proposalAgreed ? fmtDate(lead.proposalAgreed) : '—'}</ProfRow>
          </div>
        </div>

        <div className="card card--clip">
          <div className="card-head">
            <span className="card-title">Comments</span>
            <span className="count-chip">{comments.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 16px', borderTop: '1px solid var(--bd-row)', background: '#FBFAF6' }}>
            <textarea
              className="field field--area"
              placeholder="Add a comment…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="btn-primary" style={{ alignSelf: 'flex-end' }} disabled={!canComment} onClick={submitComment}>
              Add comment
            </button>
          </div>
          {comments.map((c) => (
            <div key={c.id} className="cm-row">
              <div className="cm-text">{c.text}</div>
              <div className="cm-meta">
                <span className="ev-date">{fmtDateTime(c.at)}</span>
                <button className="ev-del" title="Remove comment" onClick={() => onRemoveComment(c.id)}>✕</button>
              </div>
            </div>
          ))}
          {lead.comments && (
            <div className="cm-row">
              <div className="cm-text" style={{ color: 'var(--ink-3)' }}>{lead.comments}</div>
              <div className="cm-meta">
                <span className="mlabel mlabel--sm">IMPORTED NOTE</span>
              </div>
            </div>
          )}
          {comments.length === 0 && !lead.comments && (
            <div style={{ padding: '14px 16px', fontSize: 12, color: 'var(--faint)', borderTop: '1px solid var(--bd-row)' }}>
              No comments yet.
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}

function ProfRow({ label, empty, mono, children }) {
  return (
    <div className="prof-row">
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
