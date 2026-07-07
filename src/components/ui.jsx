export function Select({ value, onChange, options, groups, disabled, faded, bar, style }) {
  return (
    <div className={`selwrap${disabled && faded ? ' faded' : ''}`} style={style}>
      <select
        className={`select${bar ? ' select--bar' : ''}`}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={bar ? { maxWidth: style?.maxWidth } : { width: '100%' }}
      >
        {options?.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
        {groups?.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.options.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <span className="selarrow">▼</span>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <div>
      <div className="flabel">{label}</div>
      {children}
    </div>
  )
}

export function KpiCard({ label, value, unit, note }) {
  return (
    <div className="kpi">
      <div className="mlabel">{label}</div>
      <div className="kpi-row">
        <span className="kpi-value">{value}</span>
        {unit ? <span className="kpi-unit">{unit}</span> : null}
      </div>
      <div className="kpi-note">{note}</div>
    </div>
  )
}

export function Modal({ title, sub, width, onClose, children, footer }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ width }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="modal-title">{title}</div>
            <div className="modal-sub">{sub}</div>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        {children}
        <div className="modal-foot">{footer}</div>
      </div>
    </div>
  )
}

export function Avatar({ children, size = 22, fontSize = 9 }) {
  return (
    <span className="avatar-sm" style={{ width: size, height: size, fontSize }}>
      {children}
    </span>
  )
}
