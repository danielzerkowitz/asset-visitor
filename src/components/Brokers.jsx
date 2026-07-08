import { Avatar } from './ui.jsx'
import { isActive, visitCount } from '../lib.js'

export default function Brokers({ brokers, assets, leads, onAddBroker, onAddContact, onEditBroker, onEditContact }) {
  const statsFor = (contactId) => {
    const mine = leads.filter((l) => l.brokerContact === contactId)
    return {
      active: mine.filter(isActive).length,
      visits: mine.reduce((n, l) => n + visitCount(l), 0),
      signed: mine.filter((l) => l.stage === 'signed').length,
    }
  }

  return (
    <div className="page page--narrow">
      <div className="page-head">
        <div>
          <h1 className="page-title">Brokers</h1>
          <div className="page-sub">External brokerages your asset managers mandate to lease space</div>
        </div>
        <button className="btn-primary" onClick={onAddBroker}>
          <span className="plus">+</span>Add broker
        </button>
      </div>

      {brokers.map((b) => {
        const active = b.contacts.reduce((n, c) => n + statsFor(c.id).active, 0)
        const repped = assets.filter((a) => a.tenantRep === b.id)
        return (
          <div key={b.id} className="card card--clip">
            <div className="card-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="card-title">{b.name}</span>
                <span className="count-chip">{active} active {active === 1 ? 'lead' : 'leads'}</span>
                {repped.length > 0 && (
                  <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                    Tenant rep for {repped.map((a) => a.name).join(', ')}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-secondary btn-secondary--sm" onClick={() => onEditBroker(b.id)}>
                  Edit
                </button>
                <button className="btn-secondary btn-secondary--sm" onClick={() => onAddContact(b.id)}>
                  <span className="plus">+</span>Add contact
                </button>
              </div>
            </div>
            <div className="grid-row agent-cols thead-row">
              <span className="mlabel">CONTACT</span>
              <span className="mlabel" style={{ textAlign: 'right' }}>ACTIVE LEADS</span>
              <span className="mlabel" style={{ textAlign: 'right' }}>VISITS DONE</span>
              <span className="mlabel" style={{ textAlign: 'right' }}>SIGNED</span>
            </div>
            {b.contacts.map((c) => {
              const s = statsFor(c.id)
              return (
                <div
                  key={c.id}
                  className="grid-row agent-cols people-row people-row--click"
                  title="Click to edit"
                  onClick={() => onEditContact(c.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <Avatar size={30} fontSize={10}>{c.init}</Avatar>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, fontWeight: 600, textAlign: 'right' }}>
                    {s.active}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--ink-3)', textAlign: 'right' }}>
                    {s.visits}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: '#4C8355', textAlign: 'right' }}>
                    {s.signed}
                  </span>
                </div>
              )
            })}
            {b.contacts.length === 0 && (
              <div style={{ padding: '14px 16px', fontSize: 12, color: 'var(--faint)' }}>
                No contacts yet — add the person you talk to at {b.name}.
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
