import { useState } from 'react'
import { leadEvents } from '../lib.js'
import { Field, Modal } from './ui.jsx'

// Configuration screen — portfolio-wide settings. For now: the activity
// types (categories) offered when logging on a lead.
export default function Config({ eventTypes, leads, onAddType, onRenameType, onRemoveType }) {
  const [addOpen, setAddOpen] = useState(false)
  const [editId, setEditId] = useState(null)

  // How many log entries use each type — shown per row and blocks deletion.
  const usage = {}
  for (const l of leads) for (const e of leadEvents(l)) usage[e.type] = (usage[e.type] || 0) + 1

  const editType = editId ? eventTypes.find((t) => t.id === editId) : null

  return (
    <div className="page page--narrow">
      <div className="page-head">
        <div>
          <h1 className="page-title">Configuration</h1>
          <div className="page-sub">Portfolio-wide settings</div>
        </div>
      </div>

      <div className="card card--clip">
        <div className="card-head">
          <span className="card-title">Activity types</span>
          <button className="btn-secondary btn-secondary--sm" onClick={() => setAddOpen(true)}>
            <span className="plus">+</span>Add type
          </button>
        </div>
        <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--ink-3)', borderTop: '1px solid var(--bd-row)' }}>
          The categories offered when logging activity on a lead. A type that is
          used by log entries can't be deleted until those entries are removed.
        </div>
        {eventTypes.map((t) => {
          const n = usage[t.id] || 0
          return (
            <div key={t.id} className="cfg-row">
              <span className="ev-chip">{t.label.toUpperCase()}</span>
              <span className="cfg-name">{n ? `${n} log ${n === 1 ? 'entry' : 'entries'}` : 'Not used yet'}</span>
              <button className="btn-secondary btn-secondary--sm" onClick={() => setEditId(t.id)}>Edit</button>
            </div>
          )
        })}
      </div>

      {addOpen && (
        <TypeModal
          title="Add activity type"
          sub="A new category for the lead activity log"
          submitLabel="Add type"
          onClose={() => setAddOpen(false)}
          onSubmit={(label) => { onAddType(label); setAddOpen(false) }}
        />
      )}
      {editType && (
        <TypeModal
          title="Edit activity type"
          sub={
            usage[editType.id]
              ? `${usage[editType.id]} log ${usage[editType.id] === 1 ? 'entry uses' : 'entries use'} this type`
              : 'Not used by any log entry'
          }
          initial={editType.label}
          submitLabel="Save"
          onClose={() => setEditId(null)}
          onSubmit={(label) => { onRenameType(editType.id, label); setEditId(null) }}
          onDelete={
            usage[editType.id] || eventTypes.length === 1
              ? null
              : () => { onRemoveType(editType.id); setEditId(null) }
          }
          deleteHint={
            usage[editType.id]
              ? 'Remove its log entries first'
              : eventTypes.length === 1
                ? 'The log needs at least one type'
                : null
          }
        />
      )}
    </div>
  )
}

function TypeModal({ title, sub, initial = '', submitLabel, onClose, onSubmit, onDelete, deleteHint }) {
  const [label, setLabel] = useState(initial)
  const canSave = !!label.trim()
  const submit = () => canSave && onSubmit(label.trim())

  return (
    <Modal
      title={title}
      sub={sub}
      width={400}
      onClose={onClose}
      footer={
        <>
          {onDelete !== undefined && (
            <button
              className="btn-danger"
              style={{ marginRight: 'auto' }}
              disabled={!onDelete}
              title={deleteHint || undefined}
              onClick={() => onDelete?.()}
            >
              Delete
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSave} onClick={submit}>{submitLabel}</button>
        </>
      }
    >
      <Field label="NAME *">
        <input
          className="field"
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
          placeholder="e.g. Site inspection"
        />
      </Field>
    </Modal>
  )
}
