'use strict';

/* ─── Constants ─────────────────────────────────────────────── */
const DISTANCE_OK_THRESHOLD_M = 150;
const PROOF_ELIGIBLE_PLANS = ['team', 'business'];

/* ─── Mock scenarios ─────────────────────────────────────────── */
const MOCK_SCENARIOS = [
  // 01 — Happy: done, GPS ok, photos
  {
    scenarioId: '01_happy',
    scenarioLabel: '01 · Happy — 35 m, photos',
    account: { fsmActive: true, planTier: 'team', planLabel: 'Team' },
    job: { title: 'Weekly pool cleaning', id: 'job-101' },
    visit: { id: 'visit-501', dateLabel: 'Thu, May 22, 2025 · 10:00 AM', workerName: 'Mike Torres', status: 'done', statusLabel: 'Done' },
    property: { clientName: 'Sarah Smith', addressLine: '123 Oak Street, Austin, TX 78701' },
    address: { verification: 'verified', lat: 30.2672, lng: -97.7431 },
    proof: { activeSnapshot: true, startedAtLabel: '10:24 AM', workedDurationLabel: '26 min', gps: { available: true, lat: 30.26745, lng: -97.74335 }, distance_m: 35, quality: 'ok' },
    photos: { count: 3, items: [{ id: 'p1', label: 'Pool', color: '#94a3b8' }, { id: 'p2', label: 'Gate', color: '#64748b' }, { id: 'p3', label: 'Equipment', color: '#475569' }] },
    activity: [
      { time: '10:50 AM', text: 'Mike completed visit' },
      { time: '10:24 AM', text: 'Mike started visit · Location captured', mapLink: { lat: 30.26745, lng: -97.74335, label: 'View on map ↗' } },
    ],
    teamNotes: [{ author: 'You', time: 'May 21, 9:15 AM', text: 'Dog in backyard — use side gate.' }],
  },

  // 02 — Far: done, GPS 2.1 km ⚠
  {
    scenarioId: '02_far',
    scenarioLabel: '02 · Far — 2.1 km ⚠ (cinema)',
    account: { fsmActive: true, planTier: 'business', planLabel: 'Business' },
    job: { title: 'Weekly pool cleaning', id: 'job-101' },
    visit: { id: 'visit-502', dateLabel: 'Thu, May 22, 2025 · 2:00 PM', workerName: 'Jake Rivera', status: 'done', statusLabel: 'Done' },
    property: { clientName: 'Sarah Smith', addressLine: '123 Oak Street, Austin, TX 78701' },
    address: { verification: 'verified', lat: 30.2672, lng: -97.7431 },
    proof: { activeSnapshot: true, startedAtLabel: '2:08 PM', workedDurationLabel: '2 h 15 min', gps: { available: true, lat: 30.2505, lng: -97.7492 }, distance_m: 2100, quality: 'far' },
    photos: { count: 1, items: [{ id: 'p1', label: '?', color: '#f59e0b' }] },
    activity: [
      { time: '2:55 PM', text: 'Jake completed visit' },
      { time: '2:08 PM', text: 'Jake started visit · Location captured', mapLink: { lat: 30.2505, lng: -97.7492, label: 'View on map ↗' } },
    ],
    teamNotes: [],
  },

  // 03 — GPS unavailable: in_progress, activeSnapshot true, no coords
  {
    scenarioId: '03_no_gps',
    scenarioLabel: '03 · GPS unavailable',
    account: { fsmActive: true, planTier: 'team', planLabel: 'Team' },
    job: { title: 'Lawn mowing', id: 'job-102' },
    visit: { id: 'visit-503', dateLabel: 'Thu, May 22, 2025 · 8:00 AM', workerName: 'Mike Torres', status: 'in_progress', statusLabel: 'In progress' },
    property: { clientName: 'Tom Garcia', addressLine: '456 Elm Avenue, Austin, TX 78702' },
    address: { verification: 'verified', lat: 30.2620, lng: -97.7200 },
    proof: { activeSnapshot: true, startedAtLabel: '8:02 AM', workedDurationLabel: '', gps: { available: false, lat: null, lng: null }, distance_m: null, quality: 'unavailable' },
    photos: { count: 0, items: [] },
    activity: [{ time: '8:02 AM', text: 'Mike started visit · Location unavailable' }],
    teamNotes: [{ author: 'You', time: 'May 20', text: 'Corner lot — park on Elm.' }],
  },

  // 04 — Address not on map
  {
    scenarioId: '04_no_address',
    scenarioLabel: '04 · Address not on map',
    account: { fsmActive: true, planTier: 'team', planLabel: 'Team' },
    job: { title: 'Deep clean', id: 'job-103' },
    visit: { id: 'visit-504', dateLabel: 'Thu, May 22, 2025 · 11:30 AM', workerName: 'Ana Lopez', status: 'done', statusLabel: 'Done' },
    property: { clientName: 'New Build LLC', addressLine: 'Lot 7, Phase 2, Unlisted Rd' },
    address: { verification: 'failed', lat: null, lng: null },
    proof: { activeSnapshot: true, startedAtLabel: '11:35 AM', workedDurationLabel: '45 min', gps: { available: true, lat: 30.2850, lng: -97.7100 }, distance_m: null, quality: 'ok' },
    photos: { count: 2, items: [{ id: 'p1', label: 'Site', color: '#94a3b8' }, { id: 'p2', label: 'Truck', color: '#64748b' }] },
    activity: [
      { time: '12:10 PM', text: 'Ana completed visit' },
      { time: '11:35 AM', text: 'Ana started visit · Location captured', mapLink: { lat: 30.2850, lng: -97.7100, label: 'View on map ↗' } },
    ],
    teamNotes: [],
  },

  // 05 — No photos
  {
    scenarioId: '05_no_photos',
    scenarioLabel: '05 · No photos',
    account: { fsmActive: true, planTier: 'team', planLabel: 'Team' },
    job: { title: 'Pool skim', id: 'job-104' },
    visit: { id: 'visit-505', dateLabel: 'Thu, May 22, 2025 · 3:00 PM', workerName: 'Mike Torres', status: 'done', statusLabel: 'Done' },
    property: { clientName: 'Sarah Smith', addressLine: '123 Oak Street, Austin, TX 78701' },
    address: { verification: 'verified', lat: 30.2672, lng: -97.7431 },
    proof: { activeSnapshot: true, startedAtLabel: '3:05 PM', workedDurationLabel: '32 min', gps: { available: true, lat: 30.2675, lng: -97.7430 }, distance_m: 42, quality: 'ok' },
    photos: { count: 0, items: [] },
    activity: [
      { time: '3:48 PM', text: 'Mike completed visit' },
      { time: '3:05 PM', text: 'Mike started visit · Location captured', mapLink: { lat: 30.2675, lng: -97.7430, label: 'View on map ↗' } },
    ],
    teamNotes: [],
  },

  // 06 — Locked: Solo plan, activeSnapshot true but canViewProof false
  {
    scenarioId: '06_locked_team',
    scenarioLabel: '06 · Locked — Upgrade to Team (Solo)',
    account: { fsmActive: true, planTier: 'solo', planLabel: 'Solo' },
    job: { title: 'Weekly pool cleaning', id: 'job-101' },
    visit: { id: 'visit-506', dateLabel: 'Thu, May 22, 2025 · 10:00 AM', workerName: 'Mike Torres', status: 'done', statusLabel: 'Done' },
    property: { clientName: 'Sarah Smith', addressLine: '123 Oak Street, Austin, TX 78701' },
    address: { verification: 'verified', lat: 30.2672, lng: -97.7431 },
    proof: { activeSnapshot: true, startedAtLabel: '10:24 AM', workedDurationLabel: '26 min', gps: { available: true, lat: 30.26745, lng: -97.74335 }, distance_m: 35, quality: 'ok' },
    photos: { count: 2, items: [{ id: 'p1', label: 'Pool', color: '#94a3b8' }, { id: 'p2', label: 'Gate', color: '#64748b' }] },
    activity: [],
    teamNotes: [{ author: 'You', time: 'May 21', text: 'Side gate code: 4521.' }],
  },

  // 07 — In progress, worker started (Where worker STARTED)
  {
    scenarioId: '07_in_progress',
    scenarioLabel: '07 · In progress — Where worker started',
    account: { fsmActive: true, planTier: 'team', planLabel: 'Team' },
    job: { title: 'Weekly pool cleaning', id: 'job-101' },
    visit: { id: 'visit-507', dateLabel: 'Thu, May 22, 2025 · 10:00 AM', workerName: 'Mike Torres', status: 'in_progress', statusLabel: 'In progress' },
    property: { clientName: 'Sarah Smith', addressLine: '123 Oak Street, Austin, TX 78701' },
    address: { verification: 'verified', lat: 30.2672, lng: -97.7431 },
    proof: { activeSnapshot: true, startedAtLabel: '10:24 AM', workedDurationLabel: '', gps: { available: true, lat: 30.26745, lng: -97.74335 }, distance_m: 35, quality: 'ok' },
    photos: { count: 1, items: [{ id: 'p1', label: 'Gate', color: '#94a3b8' }] },
    activity: [{ time: '10:24 AM', text: 'Mike started visit · Location captured', mapLink: { lat: 30.26745, lng: -97.74335, label: 'View on map ↗' } }],
    teamNotes: [],
  },

  // 08 — Voided: worker returned to scheduled → NO proof
  {
    scenarioId: '08_void_worker',
    scenarioLabel: '08 · Scheduled void — worker returned (no proof)',
    account: { fsmActive: true, planTier: 'team', planLabel: 'Team' },
    job: { title: 'AC repair', id: 'job-105' },
    visit: { id: 'visit-508', dateLabel: 'Thu, May 22, 2025 · 2:00 PM', workerName: 'Jake Rivera', status: 'scheduled', statusLabel: 'Scheduled' },
    property: { clientName: 'Tom Garcia', addressLine: '456 Elm Avenue, Austin, TX 78702' },
    address: { verification: 'verified', lat: 30.2620, lng: -97.7200 },
    proof: { activeSnapshot: false, startedAtLabel: '2:08 PM', gps: { available: false, lat: null, lng: null }, distance_m: null, quality: 'ok' },
    photos: { count: 0, items: [] },
    activity: [
      { time: '2:15 PM', text: 'Jake returned visit to scheduled' },
      { time: '2:08 PM', text: 'Jake started visit · Location captured', mapLink: { lat: 30.2621, lng: -97.7202, label: 'View on map ↗' } },
      { time: '10:15 AM', text: 'You scheduled a visit for Jake on May 22 at 2:00 PM' },
    ],
    teamNotes: [],
  },

  // 09 — Manager set In progress, no worker Start → NO proof
  {
    scenarioId: '09_manager_no_worker',
    scenarioLabel: '09 · In progress — manager only (no proof)',
    account: { fsmActive: true, planTier: 'team', planLabel: 'Team' },
    job: { title: 'Gate repair', id: 'job-106' },
    visit: { id: 'visit-509', dateLabel: 'Thu, May 22, 2025 · 9:00 AM', workerName: 'Mike Torres', status: 'in_progress', statusLabel: 'In progress' },
    property: { clientName: 'Sarah Smith', addressLine: '123 Oak Street, Austin, TX 78701' },
    address: { verification: 'verified', lat: 30.2672, lng: -97.7431 },
    proof: { activeSnapshot: false, startedAtLabel: '', gps: { available: false, lat: null, lng: null }, distance_m: null, quality: 'unavailable' },
    photos: { count: 0, items: [] },
    activity: [
      { time: '9:05 AM', text: 'You marked visit in progress' },
      { time: 'May 21', text: 'You scheduled a visit for Mike on May 22 at 9:00 AM' },
    ],
    teamNotes: [],
  },

  // 10 — Manager reset done → scheduled → NO proof
  {
    scenarioId: '10_manager_void_done',
    scenarioLabel: '10 · Scheduled — manager reset from done (no proof)',
    account: { fsmActive: true, planTier: 'team', planLabel: 'Team' },
    job: { title: 'Pool cleaning', id: 'job-101' },
    visit: { id: 'visit-510', dateLabel: 'Thu, May 22, 2025 · 10:00 AM', workerName: 'Mike Torres', status: 'scheduled', statusLabel: 'Scheduled' },
    property: { clientName: 'Sarah Smith', addressLine: '123 Oak Street, Austin, TX 78701' },
    address: { verification: 'verified', lat: 30.2672, lng: -97.7431 },
    proof: { activeSnapshot: false, startedAtLabel: '10:24 AM', gps: { available: false, lat: null, lng: null }, distance_m: null, quality: 'ok' },
    photos: { count: 0, items: [] },
    activity: [
      { time: '11:00 AM', text: 'You returned visit to scheduled' },
      { time: '10:45 AM', text: 'Mike completed visit' },
      { time: '10:24 AM', text: 'Mike started visit · Location captured', mapLink: { lat: 30.26745, lng: -97.74335, label: 'View on map ↗' } },
    ],
    teamNotes: [],
  },
];

/* ─── Logic helpers ──────────────────────────────────────────── */

function mapsUrl(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function formatDistance(distance_m) {
  if (distance_m >= 1000) return `${(distance_m / 1000).toFixed(1)} km from address`;
  return `${distance_m} m from address`;
}

function canViewProof(account) {
  return account.fsmActive === true && PROOF_ELIGIBLE_PLANS.includes(account.planTier);
}

// GPS capture ONLY from Worker App Start, not manager actions
function showProofSection(visit, proof) {
  if (!proof.activeSnapshot) return false;
  return visit.status === 'in_progress' || visit.status === 'done';
}

// Status-aware CTA label
function getPrimaryCtaLabel(visit) {
  if (visit.status === 'in_progress') return 'Where worker started';
  return 'Where worker was';
}

// Hint text below proof block
function getProofHint(visit) {
  if (visit.status === 'in_progress') return 'Location captured when worker tapped Start — not live tracking';
  return 'Distance is a hint. Open the map for proof.';
}

/* ─── DOM helpers ────────────────────────────────────────────── */
function el(tag, props = {}) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  });
  return node;
}

function append(parent, ...children) {
  children.forEach(c => {
    if (c == null) return;
    if (typeof c === 'string') parent.appendChild(document.createTextNode(c));
    else parent.appendChild(c);
  });
  return parent;
}

/* ─── SVG icons ──────────────────────────────────────────────── */
const ICO = {
  externalLink: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  mapPin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>`,
  lock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  image: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  chevronDown: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`,
  check: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
};

/* ─── Render: status chip ─────────────────────────────────────── */
function renderStatusChip(status, statusLabel) {
  const chipClass =
    status === 'in_progress' ? 'chip-status chip-status--in-progress'
    : status === 'scheduled' ? 'chip-status chip-status--scheduled'
    : 'chip-status chip-status--done';
  const chip = el('div', { class: chipClass, role: 'status' });
  chip.innerHTML = `${statusLabel} ${ICO.chevronDown}`;
  return chip;
}

/* ─── Render: Visit proof (full) ─────────────────────────────── */
function renderFullProof(proof, address, visit) {
  const frag = document.createDocumentFragment();

  // Title
  append(frag, el('h3', { class: 'visit-proof__title', id: 'visit-proof-title', text: 'Visit proof' }));

  // Time rows (mock duration — §2.6 TZ)
  const timeWrap = el('div', { class: 'visit-proof__time' });
  const started = el('p', { class: 'visit-proof__started' });
  started.innerHTML = `Started: <strong>${proof.startedAtLabel}</strong>`;
  append(timeWrap, started);

  if (visit.status === 'done' && proof.workedDurationLabel) {
    const dur = el('p', { class: 'visit-proof__duration' });
    dur.innerHTML = `Worked: <strong>${proof.workedDurationLabel}</strong>`;
    append(timeWrap, dur);
    append(timeWrap, el('p', { class: 'visit-proof__completed', text: 'Completed ✓' }));
  }
  append(frag, timeWrap);

  const hasVerifiedAddress = address.verification === 'verified' && address.lat != null && address.lng != null;
  const hasUnverifiedAddress = ['unverified', 'failed', 'missing'].includes(address.verification);

  // Primary CTA
  if (proof.gps.available) {
    const ctaLabel = getPrimaryCtaLabel(visit);
    const cta = el('a', {
      class: 'btn-primary',
      href: mapsUrl(proof.gps.lat, proof.gps.lng),
      target: '_blank',
      rel: 'noopener noreferrer',
      'aria-label': `${ctaLabel} — open in Google Maps (new tab)`,
    });
    cta.innerHTML = `${ICO.mapPin} ${ctaLabel} ${ICO.externalLink}`;
    append(frag, cta);
  } else {
    append(frag, el('p', { class: 'visit-proof__muted', text: 'Location not captured at Start' }));
  }

  // Secondary: Job address
  if (hasVerifiedAddress) {
    const link = el('a', {
      class: 'visit-proof__link-secondary',
      href: mapsUrl(address.lat, address.lng),
      target: '_blank',
      rel: 'noopener noreferrer',
      'aria-label': 'Job address — open in Google Maps (new tab)',
    });
    link.innerHTML = `Job address ${ICO.externalLink}`;
    append(frag, link);
  }

  // Address hint
  if (hasUnverifiedAddress) {
    append(frag, el('p', { class: 'visit-proof__muted', text: 'Address not on map — distance unavailable' }));
  }

  // Distance — only if GPS + verified + distance_m present
  const showDistance = proof.gps.available && hasVerifiedAddress && proof.distance_m != null;
  if (showDistance) {
    const isFar = proof.quality === 'far';
    const cls = isFar ? 'visit-proof__distance visit-proof__distance--far' : 'visit-proof__distance visit-proof__distance--ok';
    const txt = isFar ? `${formatDistance(proof.distance_m)} · ⚠` : formatDistance(proof.distance_m);
    append(frag, el('p', { class: cls, text: txt }));
  }

  // Hint
  append(frag, el('p', { class: 'visit-proof__hint', text: getProofHint(visit) }));

  return frag;
}

/* ─── Render: Visit proof (locked) ──────────────────────────── */
function renderLockedProof() {
  const frag = document.createDocumentFragment();
  append(frag, el('h3', { class: 'visit-proof__title', id: 'visit-proof-title', text: 'Visit proof' }));

  const body = el('div', { class: 'visit-proof__locked-body-wrap' });
  const lockIcon = el('span', { class: 'visit-proof__lock-icon', 'aria-hidden': 'true' });
  lockIcon.innerHTML = ICO.lock;

  const cta = el('button', {
    class: 'btn-primary',
    type: 'button',
    'data-action': 'open-paywall',
    'aria-haspopup': 'dialog',
    text: 'Upgrade to Team',
  });

  append(body,
    lockIcon,
    el('p', { class: 'visit-proof__locked-headline', text: 'See where your worker was on site' }),
    el('p', { class: 'visit-proof__locked-desc', text: 'Map location when a visit starts is available on Team and Business plans.' }),
    cta,
  );
  append(frag, body);
  return frag;
}

/* ─── Render: Activity ───────────────────────────────────────── */
function renderActivity(activityEvents) {
  if (!activityEvents || activityEvents.length === 0) return null;

  const section = el('section', { class: 'activity', 'aria-labelledby': 'activity-title' });
  append(section, el('h3', { class: 'activity__title', id: 'activity-title', text: 'Activity' }));

  const list = el('ul', { class: 'activity__list', role: 'list' });

  activityEvents.forEach(event => {
    const item = el('li', { class: 'activity__item' });
    const iconWrap = el('span', { class: 'activity__icon', 'aria-hidden': 'true' });
    iconWrap.innerHTML = ICO.check;

    const bodyDiv = el('div', { class: 'activity__body' });
    append(bodyDiv, el('span', { class: 'activity__time', text: event.time }));

    // Text + optional map link
    const textSpan = el('span', { class: 'activity__text' });
    textSpan.textContent = event.text;

    if (event.mapLink) {
      const link = el('a', {
        class: 'activity__map-link',
        href: mapsUrl(event.mapLink.lat, event.mapLink.lng),
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': `${event.mapLink.label || 'View on map'} — opens Google Maps (new tab)`,
      });
      link.innerHTML = ` ${event.mapLink.label || 'View on map ↗'} ${ICO.externalLink}`;
      append(textSpan, link);
      item.classList.add('activity__item--has-map');
    }

    append(bodyDiv, textSpan);
    append(item, iconWrap, bodyDiv);
    append(list, item);
  });

  append(section, list);
  return section;
}

/* ─── Render: Photos ─────────────────────────────────────────── */
function renderPhotos(photos) {
  const container = document.getElementById('photos-container');
  container.innerHTML = '';

  if (photos.count === 0 || photos.items.length === 0) {
    const empty = el('div', { class: 'photos-empty', role: 'status' });
    empty.innerHTML = ICO.image;
    append(empty, el('span', { text: 'No photos yet' }));
    const btn = el('button', { class: 'btn-outline', type: 'button' });
    append(btn, el('span', { class: 'btn-label', text: 'Upload photo' }));
    append(empty, btn);
    append(container, empty);
    return;
  }

  const grid = el('div', { class: 'photo-grid', role: 'list' });
  photos.items.forEach(item => {
    const thumb = el('div', {
      class: 'photo-thumb',
      role: 'listitem',
      'aria-label': `Photo: ${item.label}`,
      title: item.label,
      style: `background-color:${item.color}`,
      text: item.label,
    });
    append(grid, thumb);
  });
  append(container, grid);
}

/* ─── Render: Team notes ─────────────────────────────────────── */
function renderNotes(teamNotes) {
  const container = document.getElementById('notes-container');
  container.innerHTML = '';

  if (!teamNotes || teamNotes.length === 0) {
    append(container, el('p', { class: 'notes-empty', role: 'status', text: 'No team notes for this visit.' }));
    return;
  }

  const list = el('div', { class: 'notes-list', role: 'list' });
  teamNotes.forEach(note => {
    const item = el('div', { class: 'note-item', role: 'listitem' });
    const body = el('p', { class: 'note-body' });
    body.innerHTML = `<strong>${note.author}:</strong> ${note.text}`;
    const meta = el('div', { class: 'note-meta' });
    meta.textContent = note.time;
    append(item, body, meta);
    append(list, item);
  });
  append(container, list);
}

/* ─── Render: full page ──────────────────────────────────────── */
function renderPage(scenario) {
  // Header
  document.getElementById('bc-job').textContent = `${scenario.job.title} — ${scenario.property.clientName.split(' ').pop()}`;
  document.getElementById('page-title').textContent = scenario.visit.dateLabel.split('·')[0].trim().replace(/^[A-Za-z]+,\s*/, '');
  document.getElementById('page-subtitle').textContent = `Visit · ${scenario.visit.id}`;

  // Status chip
  const chipContainer = document.getElementById('status-chip-container');
  chipContainer.innerHTML = '';
  append(chipContainer, renderStatusChip(scenario.visit.status, scenario.visit.statusLabel));

  // Worker
  document.getElementById('worker-name').textContent = scenario.visit.workerName;

  // Visit meta
  document.getElementById('visit-date').textContent = scenario.visit.dateLabel;
  document.getElementById('visit-worker').textContent = scenario.visit.workerName;

  // ── Visit proof section ──
  const proofSection = document.getElementById('proof-section');
  proofSection.innerHTML = '';
  // Reset classes to baseline
  proofSection.className = 'visit-proof';

  const shouldShow = showProofSection(scenario.visit, scenario.proof);

  if (!shouldShow) {
    // Absent from DOM visually — hide wrapper + its divider
    proofSection.style.display = 'none';
    document.getElementById('proof-divider').style.display = 'none';
  } else {
    proofSection.style.display = '';
    document.getElementById('proof-divider').style.display = '';

    if (!canViewProof(scenario.account)) {
      // Locked card
      proofSection.classList.add('visit-proof--locked');
      append(proofSection, renderLockedProof());
      proofSection.querySelector('[data-action="open-paywall"]')
        ?.addEventListener('click', openPaywall);
    } else {
      append(proofSection, renderFullProof(scenario.proof, scenario.address, scenario.visit));
    }
  }

  // Photos
  renderPhotos(scenario.photos);

  // ── Activity section ──
  const activityContainer = document.getElementById('activity-container');
  activityContainer.innerHTML = '';
  const activityDivider = document.getElementById('activity-divider');

  const activityNode = renderActivity(scenario.activity);
  if (activityNode) {
    activityDivider.style.display = '';
    append(activityContainer, activityNode);
  } else {
    activityDivider.style.display = 'none';
  }

  // Team notes
  renderNotes(scenario.teamNotes);
}

/* ─── Paywall modal ──────────────────────────────────────────── */
function openPaywall() {
  document.getElementById('paywall-modal').classList.add('open');
}

function closePaywall() {
  document.getElementById('paywall-modal').classList.remove('open');
}

/* ─── Bootstrap ──────────────────────────────────────────────── */
function init() {
  const select = document.getElementById('scenario-select');

  MOCK_SCENARIOS.forEach((s, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = s.scenarioLabel;
    select.appendChild(opt);
  });

  // Deep-link
  const params = new URLSearchParams(window.location.search);
  const stateParam = params.get('state');
  let idx = 0;
  if (stateParam) {
    const found = MOCK_SCENARIOS.findIndex(s => s.scenarioId === stateParam);
    if (found !== -1) idx = found;
  }
  select.value = idx;
  renderPage(MOCK_SCENARIOS[idx]);

  select.addEventListener('change', () => {
    const scenario = MOCK_SCENARIOS[parseInt(select.value, 10)];
    renderPage(scenario);
    const url = new URL(window.location);
    url.searchParams.set('state', scenario.scenarioId);
    history.replaceState(null, '', url);
  });

  // Modal
  document.getElementById('modal-close').addEventListener('click', closePaywall);
  document.getElementById('paywall-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closePaywall();
  });
  document.getElementById('modal-upgrade-btn').addEventListener('click', () => {
    closePaywall();
    alert('Prototype: would open Stripe checkout for Team plan.');
  });

  // Billing toggle
  const prices = { monthly: { team: '$49', biz: '$99' }, yearly: { team: '$39', biz: '$79' } };
  document.getElementById('toggle-monthly').addEventListener('click', function () {
    this.classList.add('active');
    document.getElementById('toggle-yearly').classList.remove('active');
    document.getElementById('plan-team-price').innerHTML = `${prices.monthly.team}<span>/mo</span>`;
    document.getElementById('plan-biz-price').innerHTML  = `${prices.monthly.biz}<span>/mo</span>`;
  });
  document.getElementById('toggle-yearly').addEventListener('click', function () {
    this.classList.add('active');
    document.getElementById('toggle-monthly').classList.remove('active');
    document.getElementById('plan-team-price').innerHTML = `${prices.yearly.team}<span>/mo</span>`;
    document.getElementById('plan-biz-price').innerHTML  = `${prices.yearly.biz}<span>/mo</span>`;
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePaywall(); });
}

document.addEventListener('DOMContentLoaded', init);
