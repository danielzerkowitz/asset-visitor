// Display units for areas and rents. Internal data is always stored in m²;
// switch UNITS to 'sq ft' to convert everywhere (labels, inputs, KPIs).
export const UNITS = 'm²'

const FT_PER_M2 = 10.7639

export const isFt = () => UNITS === 'sq ft'
export const unit = () => (isFt() ? 'sq ft' : 'm²')

// m² → display units
export const cv = (n) => (isFt() ? n * FT_PER_M2 : n)
// display units → m² (for form inputs)
export const fromIn = (n) => (isFt() ? n / FT_PER_M2 : n)
// rent entered per display unit → per m²
export const rentIn = (n) => (isFt() ? n * FT_PER_M2 : n)

export const fmt = (n) => Math.round(n).toLocaleString('en-US')
export const area = (n) => `${fmt(cv(n))} ${unit()}`
export const rentFmt = (r) => (isFt() ? `€${(r / FT_PER_M2).toFixed(1)} /sq ft·yr` : `€${r} /m²·yr`)

export const sizeLabel = () => `SIZE (${unit().toUpperCase()})`
export const areaLabel = () => `AREA (${unit().toUpperCase()})`
export const rentLabel = () => (isFt() ? 'RENT (€/SQ FT·YR)' : 'RENT (€/M²·YR)')
