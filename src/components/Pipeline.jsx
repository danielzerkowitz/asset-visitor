import { useRef, useState } from 'react'
import { area } from '../units.js'
import { contactInit, isActive, whereLabel } from '../lib.js'
import { Avatar, Select } from './ui.jsx'

export default function Pipeline({ assets, leads, brokers, stages, pAsset, setPAsset, openAsset, moveLead, onEditLead, onAddStage, onRenameStage, onRemoveStage }) {
  const [hoverCol, setHoverCol] = useState(null)
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editLabel, setEditLabel] = useState('')
  const dragId = useRef(null)

  const commitAdd = () => {
    const label = newLabel.trim()
    if (label) onAddStage(label)
    setAdding(false)
    setNewLabel('')
  }

  const commitRename = () => {
    const label = editLabel.trim()
    if (label && editingId) onRenameStage(editingId, label)
    setEditingId(null)
    setEditLabel('')
  }

  const assetOptions = [{ id: 'all', label: 'All assets' }, ...assets.map((a) => ({ id: a.id, label: a.name }))]
  const pLeads = leads.filter((l) => pAsset === 'all' || l.assetId === pAsset)
  const pActive = pLeads.filter(isActive).length

  const drop = (stageId) => (e) => {
    e.preventDefault()
    const id = dragId.current || e.dataTransfer.getData('text/plain')
    dragId.current = null
    setHoverCol(null)
    if (id) moveLead(id, stageId)
  }

  return (
    <div className="page page--pipeline">
      <div className="page-head">
        <div>
          <h1 className="page-title">Pipeline</h1>
          <div className="page-sub">{pActive} active leads · drag a card to change stage</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="mlabel">ASSET</span>
          <Select
            bar
            value={pAsset}
            onChange={(e) => setPAsset(e.target.value)}
            options={assetOptions}
            style={{ maxWidth: 220 }}
          />
        </div>
      </div>

      <div className="board">
        {stages.map((stg) => {
          const cards = pLeads.filter((l) => l.stage === stg.id)
          return (
            <div
              key={stg.id}
              className={`col${hoverCol === stg.id ? ' hot' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                if (hoverCol !== stg.id) setHoverCol(stg.id)
              }}
              onDragLeave={() => { if (hoverCol === stg.id) setHoverCol(null) }}
              onDrop={drop(stg.id)}
            >
              <div className="col-head">
                <span className="col-dot" style={{ background: stg.dot }} />
                {editingId === stg.id ? (
                  <input
                    className="col-rename"
                    autoFocus
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename()
                      if (e.key === 'Escape') { setEditingId(null); setEditLabel('') }
                    }}
                    onBlur={commitRename}
                  />
                ) : (
                  <button
                    className="col-label"
                    title="Click to rename"
                    onClick={() => { setEditingId(stg.id); setEditLabel(stg.label) }}
                  >
                    {stg.label}
                  </button>
                )}
                <span className="col-count">{cards.length}</span>
                <button
                  className="col-remove"
                  title={`Remove “${stg.label}”`}
                  onClick={() => onRemoveStage(stg.id)}
                >
                  ✕
                </button>
              </div>
              {cards.map((l) => (
                <div
                  key={l.id}
                  className="pcard"
                  title="Drag to move · click to edit"
                  draggable
                  onClick={() => onEditLead(l.id)}
                  onDragStart={(e) => {
                    dragId.current = l.id
                    e.dataTransfer.effectAllowed = 'move'
                    try { e.dataTransfer.setData('text/plain', l.id) } catch { /* older browsers */ }
                  }}
                  onDragEnd={() => setHoverCol(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>{l.company}</span>
                    <Avatar size={20} fontSize={8.5}>{contactInit(brokers, l.brokerContact)}</Avatar>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: -4 }}>{l.contact}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    <span className="pcard-need">{l.type} · {l.sqm ? area(l.sqm) : '— m²'}</span>
                  </div>
                  <button className="pcard-where" onClick={(e) => { e.stopPropagation(); openAsset(l.assetId) }}>
                    {whereLabel(assets, l)}
                  </button>
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: 8, paddingTop: 7, borderTop: '1px solid var(--bd-row)',
                    }}
                  >
                    <span className="pcard-next">{l.next}</span>
                  </div>
                </div>
              ))}
              {cards.length === 0 && <div className="drop-hint">Drop leads here</div>}
            </div>
          )
        })}
        {adding ? (
          <div className="col col--new">
            <input
              className="field"
              autoFocus
              value={newLabel}
              placeholder="Stage name"
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitAdd()
                if (e.key === 'Escape') { setAdding(false); setNewLabel('') }
              }}
              onBlur={commitAdd}
            />
            <div className="add-col-hint">Enter to add · Esc to cancel</div>
          </div>
        ) : (
          <button className="add-col" onClick={() => setAdding(true)}>
            <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> Add stage
          </button>
        )}
      </div>
    </div>
  )
}
