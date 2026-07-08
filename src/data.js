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

// Milestone-derived stages: a lead sits on the furthest milestone reached
// (intro date → Introduced, any visit → Visited, proposal sent → Proposal, …).
export const stages = [
  { id: 'new', label: 'New', dot: '#948A7B' },
  { id: 'intro', label: 'Introduced', dot: '#B08327' },
  { id: 'visited', label: 'Visited', dot: '#C05F2E' },
  { id: 'proposal', label: 'Proposal', dot: '#9D4A26' },
  { id: 'agreed', label: 'Agreed', dot: '#74803B' },
  { id: 'signed', label: 'Signed', dot: '#4C8355' },
  { id: 'out', label: 'Out', dot: '#8A8578' },
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

// Events are the lead's activity log ({id, type, date, note}); visits among
// them feed the dashboard's per-timespan visit counts.
export const leadsSeed = [
  { id: 'l1', company: 'Vectis Group', contact: 'Anna Maes', type: 'Office', sqm: 450, assetId: 'meridian', subId: 'b', stage: 'visited', broker: 'halewijn', brokerContact: 'SH', next: 'Visit · Tue 10:30', when: 'Tue 10:30',
    events: [
      { id: 'e-l1-1', type: 'call', date: '2026-06-12', note: 'Intro call — needs to move by Q4' },
      { id: 'e-l1-2', type: 'visit', date: '2026-06-24', note: 'Toured Building B, liked the light' },
      { id: 'e-l1-3', type: 'email', date: '2026-07-01', note: 'Sent floor plans and parking options' },
    ],
    commentLog: [{ id: 'cm-l1-1', text: 'Decision maker is the CFO, not Anna — loop him in before any proposal.', at: '2026-07-01T09:40:00.000Z' }] },
  { id: 'l2', company: 'Brontide Analytics', contact: 'Tom Peeters', type: 'Office', sqm: 1200, assetId: 'solvay', subId: 'three', stage: 'proposal', broker: 'quadrant', brokerContact: 'MD', next: 'Send counter-proposal',
    activity: 'Data analytics', timing: 'Q1 2027', intro: '2026-06-05', lastProposal: '2026-06-27',
    events: [
      { id: 'e-l2-1', type: 'visit', date: '2026-06-16', note: 'Full campus tour' },
      { id: 'e-l2-2', type: 'proposal', date: '2026-06-27', note: 'Proposal v1 sent — 6y term' },
    ] },
  { id: 'l3', company: 'Cargolux BeNe', contact: 'Ines Willems', type: 'Industrial', sqm: 5500, assetId: 'northgate', subId: 'w3', stage: 'visited', broker: 'halewijn', brokerContact: 'SH', next: 'Follow-up call Fri',
    events: [
      { id: 'e-l3-1', type: 'visit', date: '2026-06-18', note: 'Inspected docks at Warehouse 3' },
      { id: 'e-l3-2', type: 'call', date: '2026-07-03', note: 'Discussed ramp capacity' },
    ] },
  { id: 'l4', company: 'Aldera Retail', contact: 'Sofie Claes', type: 'Retail', sqm: 320, assetId: 'arcade', subId: 's', stage: 'intro', broker: 'vermeer', brokerContact: 'JR', next: 'Awaiting floor plans' },
  { id: 'l5', company: 'Nimbus Legal', contact: 'Karel Joos', type: 'Office', sqm: 280, assetId: 'cortenberg', subId: 'main', stage: 'new', broker: 'quadrant', brokerContact: 'MD', next: 'Qualify requirements' },
  { id: 'l6', company: 'Ostara Foods', contact: 'Griet Lambert', type: 'Industrial', sqm: 3200, assetId: 'northgate', subId: 'w2', stage: 'visited', broker: 'vermeer', brokerContact: 'JR', next: 'Visit · Thu 14:00', when: 'Thu 14:00',
    tenantKind: 'current', dealType: 'Extension', activity: 'Food production', timing: 'Q4 2026', intro: '2026-06-20',
    events: [{ id: 'e-l6-1', type: 'visit', date: '2026-06-30', note: 'Cold-storage walkthrough' }] },
  { id: 'l7', company: 'Helix BioWorks', contact: 'David Nys', type: 'Office', sqm: 900, assetId: 'meridian', subId: 'd', stage: 'proposal', broker: 'halewijn', brokerContact: 'SH', next: 'Legal review of terms',
    activity: 'Biotech research', timing: 'Q2 2027', intro: '2026-06-02', lastProposal: '2026-06-20',
    events: [
      { id: 'e-l7-1', type: 'visit', date: '2026-06-10', note: 'Lab-fit feasibility visit' },
      { id: 'e-l7-2', type: 'proposal', date: '2026-06-20', note: '' },
    ] },
  { id: 'l8', company: 'Trellis & Co', contact: 'Emma Verlinden', type: 'Office', sqm: 600, assetId: 'solvay', subId: 'two', stage: 'visited', broker: 'quadrant', brokerContact: 'MD', next: 'Visit · Wed 09:00', when: 'Wed 09:00',
    events: [
      { id: 'e-l8-1', type: 'visit', date: '2026-06-26', note: 'First tour of Campus Two' },
      { id: 'e-l8-2', type: 'meeting', date: '2026-07-02', note: 'Fit-out workshop with their architect' },
    ] },
  { id: 'l9', company: 'Kordo Logistics', contact: 'Bram Ceulemans', type: 'Industrial', sqm: 8000, assetId: 'northgate', subId: 'w3', stage: 'intro', broker: 'halewijn', brokerContact: 'SH', next: 'Qualify budget' },
  { id: 'l10', company: 'Maru Coffee', contact: 'Lisa Van Damme', type: 'Retail', sqm: 140, assetId: 'arcade', subId: 'n', stage: 'signed', broker: 'vermeer', brokerContact: 'JR', next: 'Signed 12 Jun',
    activity: 'Specialty coffee', intro: '2026-05-12', lastProposal: '2026-05-28', proposalAgreed: '2026-06-05',
    events: [{ id: 'e-l10-1', type: 'visit', date: '2026-05-20', note: 'Unit N4 viewing' }] },
  { id: 'l11', company: 'Quill Publishing', contact: 'Peter Smet', type: 'Office', sqm: 380, assetId: 'meridian', subId: 'b', stage: 'new', broker: 'vermeer', brokerContact: 'JR', next: 'First call to book' },
  { id: 'l12', company: 'Novum Fit', contact: 'Hanne De Wit', type: 'Retail', sqm: 450, assetId: 'arcade', subId: 's', stage: 'visited', broker: 'quadrant', brokerContact: 'MD', next: 'Proposal draft',
    events: [{ id: 'e-l12-1', type: 'visit', date: '2026-07-01', note: 'South Block corner unit' }] },
  { id: 'l13', company: 'Atrix Consulting', contact: 'Wouter Blomme', type: 'Office', sqm: 520, assetId: 'solvay', subId: 'two', stage: 'signed', broker: 'halewijn', brokerContact: 'SH', next: 'Signed 28 May' },
  { id: 'l14', company: 'Ferro Tools', contact: 'Jan Mertens', type: 'Industrial', sqm: 2600, assetId: 'northgate', subId: 'w2', stage: 'new', broker: 'quadrant', brokerContact: 'MD', next: 'Qualify requirements' },
]
