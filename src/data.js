export const assetsSeed = [
  { id: 'meridian', name: 'Meridian Business Park', short: 'Meridian', type: 'Office', loc: 'Zaventem, BE', manager: 'LV', subs: [
    { id: 'a', name: 'Building A', short: 'Bldg A', sqm: 4200, occ: 0.92, units: 12, vacant: 1, rent: 165 },
    { id: 'b', name: 'Building B', short: 'Bldg B', sqm: 3800, occ: 0.74, units: 10, vacant: 3, rent: 158 },
    { id: 'c', name: 'Building C', short: 'Bldg C', sqm: 5100, occ: 0.88, units: 14, vacant: 2, rent: 172 },
    { id: 'd', name: 'Building D', short: 'Bldg D', sqm: 2600, occ: 0.55, units: 8, vacant: 4, rent: 149 } ] },
  { id: 'northgate', name: 'Northgate Logistics Hub', short: 'Northgate', type: 'Industrial', loc: 'Antwerp, BE', manager: 'PV', tenantRep: 'quadrant', subs: [
    { id: 'w1', name: 'Warehouse 1', short: 'W1', sqm: 9200, occ: 1, units: 4, vacant: 0, rent: 62 },
    { id: 'w2', name: 'Warehouse 2', short: 'W2', sqm: 7400, occ: 0.81, units: 6, vacant: 1, rent: 58 },
    { id: 'w3', name: 'Warehouse 3', short: 'W3', sqm: 11800, occ: 0.68, units: 8, vacant: 3, rent: 55 } ] },
  { id: 'cortenberg', name: 'Cortenberg 12', short: 'Cortenberg 12', type: 'Office', loc: 'Brussels, BE', manager: 'LV', subs: [
    { id: 'main', name: 'Cortenberg 12 (whole building)', short: '', single: true, sqm: 3100, occ: 0.79, units: 9, vacant: 2, rent: 210 } ] },
  { id: 'arcade', name: 'Arcade Retail Court', short: 'Arcade', type: 'Retail', loc: 'Ghent, BE', manager: 'PV', tenantRep: 'halewijn', subs: [
    { id: 'n', name: 'North Block', short: 'North', sqm: 2400, occ: 0.9, units: 10, vacant: 1, rent: 310 },
    { id: 's', name: 'South Block', short: 'South', sqm: 1900, occ: 0.62, units: 8, vacant: 3, rent: 285 } ] },
  { id: 'solvay', name: 'Solvay Campus', short: 'Solvay', type: 'Office', loc: 'Brussels, BE', manager: 'LV', subs: [
    { id: 'one', name: 'Campus One', short: 'One', sqm: 6200, occ: 0.97, units: 16, vacant: 1, rent: 195 },
    { id: 'two', name: 'Campus Two', short: 'Two', sqm: 5400, occ: 0.84, units: 15, vacant: 2, rent: 188 },
    { id: 'three', name: 'Campus Three', short: 'Three', sqm: 4800, occ: 0.71, units: 12, vacant: 4, rent: 182 } ] },
]

export const stages = [
  { id: 'new', label: 'New', dot: '#948A7B' },
  { id: 'contacted', label: 'Contacted', dot: '#B08327' },
  { id: 'visit', label: 'Visit scheduled', dot: '#C05F2E' },
  { id: 'visited', label: 'Visit done', dot: '#9D4A26' },
  { id: 'nego', label: 'Negotiation', dot: '#74803B' },
  { id: 'rented', label: 'Rented', dot: '#4C8355' },
]

// Brokers are external brokerage companies; contacts are the actual people
// we talk to there. Leads are assigned to a specific broker contact.
export const brokersSeed = [
  { id: 'quadrant', name: 'Quadrant Partners', contacts: [
    { id: 'MD', name: 'Maarten Dupont', init: 'MD' },
    { id: 'EM', name: 'Elke Martens', init: 'EM' } ] },
  { id: 'vermeer', name: 'Vermeer & Co', contacts: [
    { id: 'JR', name: 'Júlia Ríos', init: 'JR' } ] },
  { id: 'halewijn', name: 'Halewijn Brokerage', contacts: [
    { id: 'SH', name: 'Stijn Haers', init: 'SH' } ] },
]

export const managersSeed = [
  { id: 'LV', name: 'Lena Vos', init: 'LV' },
  { id: 'PV', name: 'Pieter Vandenberghe', init: 'PV' },
]

export const leadsSeed = [
  { id: 'l1', company: 'Vectis Group', contact: 'Anna Maes', type: 'Office', sqm: 450, assetId: 'meridian', subId: 'b', stage: 'visit', brokerContact: 'SH', next: 'Visit · Tue 10:30', when: 'Tue 10:30' },
  { id: 'l2', company: 'Brontide Analytics', contact: 'Tom Peeters', type: 'Office', sqm: 1200, assetId: 'solvay', subId: 'three', stage: 'nego', brokerContact: 'MD', next: 'Send counter-proposal' },
  { id: 'l3', company: 'Cargolux BeNe', contact: 'Ines Willems', type: 'Industrial', sqm: 5500, assetId: 'northgate', subId: 'w3', stage: 'visited', brokerContact: 'SH', next: 'Follow-up call Fri' },
  { id: 'l4', company: 'Aldera Retail', contact: 'Sofie Claes', type: 'Retail', sqm: 320, assetId: 'arcade', subId: 's', stage: 'contacted', brokerContact: 'JR', next: 'Awaiting floor plans' },
  { id: 'l5', company: 'Nimbus Legal', contact: 'Karel Joos', type: 'Office', sqm: 280, assetId: 'cortenberg', subId: 'main', stage: 'new', brokerContact: 'MD', next: 'Qualify requirements' },
  { id: 'l6', company: 'Ostara Foods', contact: 'Griet Lambert', type: 'Industrial', sqm: 3200, assetId: 'northgate', subId: 'w2', stage: 'visit', brokerContact: 'JR', next: 'Visit · Thu 14:00', when: 'Thu 14:00' },
  { id: 'l7', company: 'Helix BioWorks', contact: 'David Nys', type: 'Office', sqm: 900, assetId: 'meridian', subId: 'd', stage: 'nego', brokerContact: 'SH', next: 'Legal review of terms' },
  { id: 'l8', company: 'Trellis & Co', contact: 'Emma Verlinden', type: 'Office', sqm: 600, assetId: 'solvay', subId: 'two', stage: 'visit', brokerContact: 'MD', next: 'Visit · Wed 09:00', when: 'Wed 09:00' },
  { id: 'l9', company: 'Kordo Logistics', contact: 'Bram Ceulemans', type: 'Industrial', sqm: 8000, assetId: 'northgate', subId: 'w3', stage: 'contacted', brokerContact: 'SH', next: 'Qualify budget' },
  { id: 'l10', company: 'Maru Coffee', contact: 'Lisa Van Damme', type: 'Retail', sqm: 140, assetId: 'arcade', subId: 'n', stage: 'rented', brokerContact: 'JR', next: 'Signed 12 Jun' },
  { id: 'l11', company: 'Quill Publishing', contact: 'Peter Smet', type: 'Office', sqm: 380, assetId: 'meridian', subId: 'b', stage: 'new', brokerContact: 'JR', next: 'First call to book' },
  { id: 'l12', company: 'Novum Fit', contact: 'Hanne De Wit', type: 'Retail', sqm: 450, assetId: 'arcade', subId: 's', stage: 'visited', brokerContact: 'MD', next: 'Proposal draft' },
  { id: 'l13', company: 'Atrix Consulting', contact: 'Wouter Blomme', type: 'Office', sqm: 520, assetId: 'solvay', subId: 'two', stage: 'rented', brokerContact: 'SH', next: 'Signed 28 May' },
  { id: 'l14', company: 'Ferro Tools', contact: 'Jan Mertens', type: 'Industrial', sqm: 2600, assetId: 'northgate', subId: 'w2', stage: 'new', brokerContact: 'MD', next: 'Qualify requirements' },
]
