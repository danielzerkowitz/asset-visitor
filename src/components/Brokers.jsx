import { Avatar } from './ui.jsx'

export default function Brokers({ brokers, leads, onAddBroker, onAddContact }) {
  const statsFor = (contactId) => {
    const mine = leads.filter((l) => l.brokerContact === contactId)
    return {
      active: mine.filter((l) => l.stage !== 'rented').length,
      visits: mine.filter((l) => l.stage === 'visit').length,
      rented: mine.filter((l) => l.stage === 'rented').length,
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
        return (
          <div key={b.id} className="card card--clip">
            <div className="card-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="card-title">{b.name}</span>
                <span className="count-chip">{active} active {active === 1 ? 'lead' : 'leads'}</span>
              </div>
              <button className="btn-secondary btn-secondary--sm" onClick={() => onAddContact(b.id)}>
                <span className="plus">+</span>Add contact
              </button>
            </div>
            <div className="grid-row agent-cols thead-row">
              <span className="mlabel">CONTACT</span>
              <span className="mlabel" style={{ textAlign: 'right' }}>ACTIVE LEADS</span>
              <span className="mlabel" style={{ textAlign: 'right' }}>VISITS SCHEDULED</span>
              <span className="mlabel" style={{ textAlign: 'right' }}>RENTED</span>
            </div>
            {b.contacts.map((c) => {
              const s = statsFor(c.id)
              return (
                <div key={c.id} className="grid-row agent-cols people-row">
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
                    {s.rented}
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
