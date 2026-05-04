// ════════════════════════════════════════════════════════════════
//  WHERE DO YOU STAND — application logic
// ════════════════════════════════════════════════════════════════

// ─── statistical helpers ────────────────────────────────────────

function erf(x) {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1) * t * Math.exp(-x*x);
  return sign * y;
}

function normalCDF(x) { return 0.5 * (1 + erf(x / Math.SQRT2)); }

// Complementary normal CDF (1 - Φ(z)). Numerically stable far into the tail.
// For z > ~6, the direct (1 - normalCDF(z)) loses precision; here we use
// the asymptotic Mills-ratio expansion: Q(z) ≈ φ(z)/z · (1 − 1/z² + 3/z⁴ − ...).
function normalQ(z) {
  if (z <= 6) return 1 - normalCDF(z);
  const phi = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
  const z2 = 1 / (z * z);
  return (phi / z) * (1 - z2 * (1 - z2 * (3 - z2 * (15 - z2 * 105))));
}

// Acklam's inverse normal CDF
function normalInv(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pL = 0.02425, pH = 1 - pL;
  let q, r;
  if (p < pL) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
  if (p <= pH) {
    q = p - 0.5; r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
           (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
          ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
}

// Log-normal parameters from mean and Gini (Gini is 0–100)
function logNormalParams(mean, gini) {
  const g = Math.max(0.01, Math.min(0.95, gini / 100));
  const sigma = Math.SQRT2 * normalInv((1 + g) / 2);
  const mu = Math.log(mean) - sigma * sigma / 2;
  return { mu, sigma };
}

// Survival function (= 1 − CDF) for a country at income x.
// Computed directly to keep precision deep in the upper tail
// (where 1 − cdfCountry would suffer cancellation).
//
// Above the highest known percentile point, we use a Pareto tail fitted to
// the slope between the top two known percentiles — this matches reality
// much better than a log-normal upper tail (real income tails are Pareto).
// For pure log-normal countries (no WID percentile data), we keep the
// log-normal tail computed via Mills ratio for numerical accuracy.
function survivalCountry(country, x) {
  if (x <= 0) return 1;
  if (country.percentiles) {
    const ps = Object.keys(country.percentiles).map(Number).sort((a, b) => a - b);
    const points = ps.map(p => ({ p, v: country.percentiles[p] }));
    const first = points[0];
    const last = points[points.length - 1];

    if (x >= last.v) {
      // Pareto extrapolation from the top two known points
      const prev = points.length >= 2 ? points[points.length - 2] : null;
      if (prev && prev.v < last.v && prev.p < last.p) {
        const sPrev = 1 - prev.p / 100;
        const sLast = 1 - last.p / 100;
        const alphaRaw = -Math.log(sLast / sPrev) / Math.log(last.v / prev.v);
        const alpha = Math.max(0.7, Math.min(3.5, alphaRaw));
        return sLast * Math.pow(x / last.v, -alpha);
      }
      // Fallback: scaled log-normal tail
      const { mu, sigma } = logNormalParams(country.meanIncome, country.gini);
      const qLast = normalQ((Math.log(last.v) - mu) / sigma);
      const qX = normalQ((Math.log(x) - mu) / sigma);
      if (qLast <= 0) return 0;
      return (1 - last.p / 100) * (qX / qLast);
    }

    if (x < first.v) {
      // Scale log-normal lower tail to meet first point (CDF perspective)
      const firstP = first.p / 100;
      const { mu, sigma } = logNormalParams(country.meanIncome, country.gini);
      const modelFirst = normalCDF((Math.log(first.v) - mu) / sigma);
      const modelX = normalCDF((Math.log(x) - mu) / sigma);
      if (modelFirst <= 1e-9) return 1;
      const cdf = firstP * (modelX / modelFirst);
      return Math.max(0, 1 - cdf);
    }

    // Between known thresholds: piecewise log-linear interpolation in CDF
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i], b = points[i + 1];
      if (x >= a.v && x <= b.v) {
        const frac = (Math.log(x) - Math.log(a.v)) / (Math.log(b.v) - Math.log(a.v));
        const cdf = (a.p + frac * (b.p - a.p)) / 100;
        return 1 - cdf;
      }
    }
    return 0;
  }
  // Pure log-normal — Mills-ratio-accurate tail
  const { mu, sigma } = logNormalParams(country.meanIncome, country.gini);
  return normalQ((Math.log(x) - mu) / sigma);
}

function cdfCountry(country, x) { return 1 - survivalCountry(country, x); }

function adultPop(c) { return c.population * (c.adultShare || 0.72); }

function expandGroupMembers(group) {
  if (group.members === 'all') return Object.keys(COUNTRIES);
  return group.members.filter(code => COUNTRIES[code]);
}

// Aggregate survival across countries weighted by adult population
function survivalGroup(memberCodes, x) {
  let totalPop = 0, totalAbove = 0;
  for (const code of memberCodes) {
    const c = COUNTRIES[code];
    if (!c) continue;
    const pop = adultPop(c);
    totalPop += pop;
    totalAbove += pop * survivalCountry(c, x);
  }
  return totalPop > 0 ? totalAbove / totalPop : 0;
}

function cdfGroup(memberCodes, x) { return 1 - survivalGroup(memberCodes, x); }

function bisect(f, lo, hi, iter = 64) {
  let fLo = f(lo), fHi = f(hi);
  if (fLo * fHi > 0) return f(lo) < 0 ? hi : lo;
  for (let i = 0; i < iter; i++) {
    const mid = (lo + hi) / 2;
    const fMid = f(mid);
    if (Math.abs(fMid) < 1e-7) return mid;
    if (fLo * fMid < 0) { hi = mid; fHi = fMid; }
    else { lo = mid; fLo = fMid; }
  }
  return (lo + hi) / 2;
}

// Quantile (income at percentile p, p∈[0,1])
function quantileEntity(entity, p) {
  if (entity.type === 'country') {
    const c = entity.country;
    if (c.percentiles) {
      const ps = Object.keys(c.percentiles).map(Number).sort((a, b) => a - b);
      const points = ps.map(pp => ({ p: pp, v: c.percentiles[pp] }));
      const target = p * 100;
      const first = points[0], last = points[points.length - 1];
      const { mu, sigma } = logNormalParams(c.meanIncome, c.gini);

      // Above last known: invert Pareto tail
      if (target > last.p) {
        const prev = points.length >= 2 ? points[points.length - 2] : null;
        if (prev && prev.v < last.v && prev.p < last.p) {
          const sPrev = 1 - prev.p / 100;
          const sLast = 1 - last.p / 100;
          const alphaRaw = -Math.log(sLast / sPrev) / Math.log(last.v / prev.v);
          const alpha = Math.max(0.7, Math.min(3.5, alphaRaw));
          const s = Math.max(1e-15, 1 - p);
          return last.v * Math.pow(sLast / s, 1 / alpha);
        }
        return Math.exp(mu + sigma * normalInv(p));
      }
      // Below first known: scaled log-normal lower tail
      if (target < first.p) {
        const firstP = first.p / 100;
        const modelFirst = normalCDF((Math.log(first.v) - mu) / sigma);
        const modelP = p * modelFirst / firstP;
        if (modelP <= 0) return 0;
        return Math.exp(mu + sigma * normalInv(modelP));
      }
      // Between
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i], b = points[i + 1];
        if (target >= a.p && target <= b.p) {
          const frac = (target - a.p) / (b.p - a.p);
          return Math.exp(Math.log(a.v) + frac * (Math.log(b.v) - Math.log(a.v)));
        }
      }
    }
    const { mu, sigma } = logNormalParams(c.meanIncome, c.gini);
    return Math.exp(mu + sigma * normalInv(p));
  }
  return bisect(x => cdfGroup(entity.members, x) - p, 0.01, 1e12);
}

// Convenience wrappers
function totalAdults(entity) {
  if (entity.type === 'country') return adultPop(entity.country);
  return entity.members.reduce((s, code) => COUNTRIES[code] ? s + adultPop(COUNTRIES[code]) : s, 0);
}

function survivalEntity(entity, x) {
  if (entity.type === 'country') return survivalCountry(entity.country, x);
  return survivalGroup(entity.members, x);
}

function cdfEntity(entity, x) {
  if (entity.type === 'country') return cdfCountry(entity.country, x);
  return cdfGroup(entity.members, x);
}

// ─── state ──────────────────────────────────────────────────────

const state = {
  income: 50000,
  period: 'year',
  selected: ['g:WORLD'],
  worldReady: false,
};

const PERIOD = {
  year:  { label: 'в год',    factor: 1 },
  month: { label: 'в месяц',  factor: 12 },
  week:  { label: 'в неделю', factor: 52 },
  day:   { label: 'в день',   factor: 260 },
  hour:  { label: 'в час',    factor: 2080 },
};

function annualIncome() { return state.income * PERIOD[state.period].factor; }

// ─── parsing & formatting ──────────────────────────────────────

function parseSalary(s) {
  if (!s) return 0;
  s = String(s).trim().toLowerCase();
  let mult = 1;
  if (/[km]$/.test(s)) {
    if (s.endsWith('k')) mult = 1e3;
    else if (s.endsWith('m')) mult = 1e6;
    s = s.slice(0, -1);
  } else if (s.endsWith('к')) { mult = 1e3; s = s.slice(0, -1); }
    else if (s.endsWith('м')) { mult = 1e6; s = s.slice(0, -1); }
  s = s.replace(/[^\d.,]/g, '');
  if (s.includes('.') && s.includes(',')) {
    s = s.replace(/,/g, '');
  } else if (s.includes(',')) {
    const parts = s.split(',');
    if (parts.length === 2 && parts[1].length === 3) s = s.replace(',', '');
    else s = s.replace(',', '.');
  }
  const n = parseFloat(s);
  return isFinite(n) && n >= 0 ? n * mult : 0;
}

const usdFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function fmtUSDCompact(n) {
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M';
  if (n >= 1e4) return '$' + Math.round(n / 1000) + 'K';
  if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
  return '$' + Math.round(n);
}

function fmtSalary(n) {
  return localeNumFmt().format(Math.round(n));
}

function fmtPercentage(p) {
  if (p >= 99.95) return '> 99.9';
  if (p < 0.05) return '< 0.1';
  if (p < 1) return p.toFixed(2);
  if (p < 10) return p.toFixed(2);
  return p.toFixed(1);
}

// High-precision percentage for tiny values
function fmtPctTiny(p) {
  if (p === 0) return '0';
  if (p >= 1) return p.toFixed(2);
  if (p >= 0.1) return p.toFixed(2);
  if (p >= 0.01) return p.toFixed(3);
  if (p >= 0.001) return p.toFixed(4);
  if (p >= 0.0001) return p.toFixed(5);
  if (p >= 0.00001) return p.toFixed(6);
  if (p >= 1e-7) return p.toFixed(8);
  return p.toExponential(1).replace('e-', '·10⁻');
}

// People count, locale-aware
function fmtPeople(n) {
  n = Math.max(0, Math.round(n));
  const fmt = localeNumFmt();
  if (n < 1e6) return fmt.format(n);
  if (n < 1e9) {
    const m = n / 1e6;
    const s = m < 10 ? m.toFixed(1) : String(Math.round(m));
    return LANG === 'ru'
      ? s.replace('.', ',') + ' млн'
      : s + 'M';
  }
  const b = (n / 1e9).toFixed(1);
  return LANG === 'ru'
    ? b.replace('.', ',') + ' млрд'
    : b + 'B';
}

// "$X B" / "$X млрд" for Forbes net worth display
function fmtBillions(b) {
  return '$' + b + (LANG === 'ru' ? ' млрд' : 'B');
}

// ─── entity resolution ─────────────────────────────────────────

function resolveEntity(id) {
  if (id.startsWith('c:')) {
    const code = id.slice(2);
    const c = COUNTRIES[code];
    if (!c) return null;
    return { id, type: 'country', code, get name() { return nameFor(c); }, country: c };
  }
  if (id.startsWith('g:')) {
    const key = id.slice(2);
    const g = GROUPS[key];
    if (!g) return null;
    return { id, type: 'group', key, get name() { return nameFor(g); }, group: g, members: expandGroupMembers(g) };
  }
  return null;
}

// ─── DOM refs ──────────────────────────────────────────────────

const $ = id => document.getElementById(id);
const els = {
  salary: $('salary'),
  period: $('period'),
  search: $('search'),
  searchResults: $('search-results'),
  groups: $('groups'),
  map: $('world-map'),
  mapLoading: $('map-loading'),
  mapTooltip: $('map-tooltip'),
  selected: $('selected'),
  results: $('results'),
};

// ─── group buttons ─────────────────────────────────────────────

function renderGroups() {
  els.groups.innerHTML = '';
  const span = document.createElement('span');
  span.className = 'label';
  span.style.cssText = 'font-size:13px;color:var(--text-dim);margin-right:4px;align-self:center;';
  span.textContent = t('quickGroups');
  els.groups.appendChild(span);
  for (const [key, g] of Object.entries(GROUPS)) {
    const btn = document.createElement('button');
    btn.className = 'group-chip';
    btn.dataset.id = 'g:' + key;
    btn.textContent = nameFor(g);
    btn.title = descFor(g);
    if (state.selected.includes('g:' + key)) btn.classList.add('active');
    btn.addEventListener('click', () => toggleSelected('g:' + key));
    els.groups.appendChild(btn);
  }
}

// ─── search ────────────────────────────────────────────────────

function buildSearchIndex() {
  const items = [];
  for (const [code, c] of Object.entries(COUNTRIES)) {
    if (!c) continue;
    items.push({
      id: 'c:' + code,
      kind: 'country',
      ref: c,
      keywords: [c.name, c.nameEn, code].join(' ').toLowerCase(),
      meta: c.predicted ? 'AI predicted' : (c.modeled ? 'log-normal' : 'WID/WB'),
    });
  }
  for (const [key, g] of Object.entries(GROUPS)) {
    items.push({
      id: 'g:' + key,
      kind: 'group',
      ref: g,
      keywords: [g.name, g.nameEn, key].join(' ').toLowerCase(),
      metaKey: 'metaUnion',
    });
  }
  return items;
}

const SEARCH_INDEX = buildSearchIndex();

function filterSearch(q) {
  if (!q) return [];
  q = q.toLowerCase().trim();
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored = [];
  for (const item of SEARCH_INDEX) {
    const k = item.keywords;
    let score = 0;
    let allMatch = true;
    for (const tok of tokens) {
      if (!k.includes(tok)) { allMatch = false; break; }
      if (k.startsWith(tok)) score += 10;
      else score += 1;
    }
    if (allMatch) {
      if (item.kind === 'group') score += 5;
      scored.push({ item, score });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 12).map(x => x.item);
}

function renderSearchResults(items) {
  els.searchResults.innerHTML = '';
  if (!els.search.value.trim()) {
    els.searchResults.classList.remove('open');
    return;
  }
  if (items.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = t('nothingFound');
    els.searchResults.appendChild(li);
    els.searchResults.classList.add('open');
    return;
  }
  for (const item of items) {
    const li = document.createElement('li');
    const left = document.createElement('span');
    const primary = nameFor(item.ref);
    const secondary = LANG === 'ru' ? item.ref.nameEn : item.ref.name;
    left.textContent = primary + (secondary && secondary !== primary ? ` · ${secondary}` : '');
    const right = document.createElement('span');
    right.className = 'meta';
    right.textContent = item.metaKey ? t(item.metaKey) : item.meta;
    if (state.selected.includes(item.id)) {
      left.textContent = '✓ ' + left.textContent;
      li.style.opacity = '0.5';
    }
    li.append(left, right);
    li.addEventListener('mousedown', e => {
      e.preventDefault();
      toggleSelected(item.id);
      els.search.value = '';
      els.searchResults.classList.remove('open');
    });
    els.searchResults.appendChild(li);
  }
  els.searchResults.classList.add('open');
}

// ─── selected chips ────────────────────────────────────────────

function toggleSelected(id) {
  const i = state.selected.indexOf(id);
  if (i >= 0) state.selected.splice(i, 1);
  else state.selected.push(id);
  refresh();
}

function clearSelected() {
  state.selected = [];
  refresh();
}

function renderSelected() {
  els.selected.innerHTML = '';
  if (state.selected.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'selected-empty';
    empty.textContent = t('selectedEmpty');
    els.selected.appendChild(empty);
    return;
  }
  for (const id of state.selected) {
    const e = resolveEntity(id);
    if (!e) continue;
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = e.name;
    const close = document.createElement('button');
    close.className = 'close';
    close.textContent = '×';
    close.title = t('chipRemove');
    close.addEventListener('click', () => toggleSelected(id));
    chip.appendChild(close);
    els.selected.appendChild(chip);
  }
  if (state.selected.length > 1) {
    const clear = document.createElement('button');
    clear.className = 'chip-clear';
    clear.textContent = t('clearAll');
    clear.addEventListener('click', clearSelected);
    els.selected.appendChild(clear);
  }
}

// ─── results ───────────────────────────────────────────────────

function sourceLine(country) {
  if (country.predicted) {
    return { label: 'AI predicted', tag: 'predicted', url: '' };
  }
  let label = country.source;
  if (country.modeled) label += ' · log-normal model';
  else label += ' · piecewise interpolation';
  if (country.year) label += ` · ${country.year}`;
  return { label, tag: country.modeled ? 'modeled' : 'direct', url: country.sourceUrl || '' };
}

function groupSourceSummary(members) {
  const counts = { direct: 0, modeled: 0, predicted: 0 };
  for (const code of members) {
    const c = COUNTRIES[code];
    if (!c) continue;
    if (c.predicted) counts.predicted++;
    else if (c.modeled) counts.modeled++;
    else counts.direct++;
  }
  const total = counts.direct + counts.modeled + counts.predicted;
  const parts = [];
  if (counts.direct)    parts.push(t('groupSrcDirect',    { n: counts.direct }));
  if (counts.modeled)   parts.push(t('groupSrcModeled',   { n: counts.modeled }));
  if (counts.predicted) parts.push(t('groupSrcPredicted', { n: counts.predicted }));
  return {
    label: t('groupSrcCountries', { n: total, parts: parts.join(', ') }),
    tag: counts.predicted > 0 ? 'predicted' : (counts.modeled > total / 2 ? 'modeled' : 'direct'),
  };
}

function renderResults() {
  const x = annualIncome();
  els.results.innerHTML = '';

  if (state.selected.length === 0 || x <= 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    const h3 = document.createElement('h3');
    h3.textContent = x <= 0 ? t('emptyEnter') : t('emptyPick');
    const p = document.createElement('p');
    p.textContent = x <= 0 ? t('emptyEnterSub') : t('emptyPickSub');
    empty.append(h3, p);
    els.results.appendChild(empty);
    return;
  }

  const featuredId = state.selected[0];
  for (const id of state.selected) {
    const entity = resolveEntity(id);
    if (!entity) continue;

    const survival = survivalEntity(entity, x);
    const cdf = 1 - survival;
    const total = totalAdults(entity);
    const numAbove = total * survival;
    const percentile = cdf * 100;
    const top = survival * 100;

    const card = document.createElement('div');
    card.className = 'result-card' + (id === featuredId ? ' featured' : '');

    const header = document.createElement('div');
    header.className = 'result-header';
    const nameEl = document.createElement('div');
    nameEl.className = 'result-name';
    nameEl.textContent = entity.name;
    if (entity.type === 'group') {
      nameEl.textContent += ` · ${t('countriesCount', { n: entity.members.length })}`;
    }
    header.appendChild(nameEl);

    const tag = document.createElement('span');
    tag.className = 'result-tag';
    if (entity.type === 'country' && entity.country.predicted) {
      tag.className += ' predicted';
      tag.textContent = t('tagAiPredicted');
    } else if (id === featuredId) {
      tag.className += ' featured-tag';
      tag.textContent = t('tagMain');
    } else {
      tag.textContent = entity.type === 'country' ? t('tagCountry') : t('tagGroup');
    }
    header.appendChild(tag);
    card.appendChild(header);

    // Switch to absolute-rank display for very high earners (top < 0.5%
    // OR fewer than ~1M people above). For those below median, keep %.
    const useAbsolute = top < 0.5 && numAbove < 1.5e6 && top < 50;
    const isTop = top <= 50;

    const row = document.createElement('div');
    row.className = 'percentile-row';
    if (useAbsolute) {
      const rank = Math.max(1, Math.round(numAbove) + 1);
      row.innerHTML = `
        <span class="top-label">${t('top')}</span>
        <span class="top-value">${fmtPeople(rank)}</span>
        <span class="top-suffix">${t('outOf', { n: fmtPeople(total) })}</span>
      `;
    } else {
      row.innerHTML = `
        <span class="top-label">${isTop ? t('top') : t('bottom')}</span>
        <span class="top-value${isTop ? '' : ' bottom'}">${fmtPercentage(isTop ? top : percentile)}<span class="top-suffix">%</span></span>
      `;
    }
    card.appendChild(row);

    const sub = document.createElement('div');
    sub.className = 'subtext';
    if (useAbsolute) {
      const aboveCount = Math.max(0, Math.round(numAbove));
      const where = entity.type === 'country' ? t('inCountry') : t('inGroup');
      const pStr = fmtPctTiny(top);
      if (aboveCount === 0) {
        sub.innerHTML = t('nooneAbove', { where, p: pStr });
      } else if (aboveCount === 1) {
        sub.innerHTML = t('onlyOneAbove', { where, p: pStr });
      } else {
        sub.innerHTML = t('fewAbove', { n: fmtPeople(aboveCount), where, p: pStr });
      }
    } else if (isTop) {
      sub.innerHTML = t('earnMore', { p: fmtPercentage(percentile) });
    } else {
      sub.innerHTML = t('earnMoreOnly', { p: fmtPercentage(percentile) });
    }
    card.appendChild(sub);

    const bar = document.createElement('div');
    bar.className = 'bar-wrap';
    bar.innerHTML = `<div class="bar-fill" style="width:${Math.min(100, percentile).toFixed(4)}%"></div>`;
    card.appendChild(bar);

    const thresholds = document.createElement('div');
    thresholds.className = 'thresholds';
    const cuts = [
      { p: 0.50,  label: t('threshMedian') },
      { p: 0.90,  label: t('thresh10') },
      { p: 0.99,  label: t('thresh1') },
      { p: 0.999, label: t('thresh01') },
    ];
    for (const { p, label } of cuts) {
      const v = quantileEntity(entity, p);
      const cell = document.createElement('div');
      cell.className = 'threshold';
      cell.innerHTML = `<div class="pct">${label}</div><div class="val">${fmtUSDCompact(v)}</div>`;
      thresholds.appendChild(cell);
    }
    card.appendChild(thresholds);

    // ── Named billionaires above the user ──
    // Only when in absolute-rank mode (very high earner). Compares
    // person's NET WORTH (Forbes) vs. user's annualized salary — clearly
    // labelled in the UI as "общий капитал, не годовой доход".
    if (useAbsolute) {
      const memberCodes = entity.type === 'country' ? [entity.code] : entity.members;
      const memberSet = new Set(memberCodes);
      const above = PEOPLE
        .filter(p => memberSet.has(p.country) && p.netWorth * 1e9 > x)
        .sort((a, b) => b.netWorth - a.netWorth);
      if (above.length > 0) {
        const peopleEl = document.createElement('div');
        peopleEl.className = 'people-list';
        const head = document.createElement('div');
        head.className = 'people-header';
        head.innerHTML =
          t('peopleHeader', { url: PEOPLE_SOURCE_URL }) +
          ' <em>' + t('peopleCaveat') + '</em>';
        peopleEl.appendChild(head);
        const list = document.createElement('ol');
        list.className = 'people-items';
        const limit = Math.min(above.length, 10);
        for (let i = 0; i < limit; i++) {
          const p = above[i];
          const li = document.createElement('li');
          const left = document.createElement('span');
          left.className = 'p-name';
          left.textContent = nameForPerson(p);
          const place = document.createElement('span');
          place.className = 'p-place';
          place.textContent = COUNTRIES[p.country] ? nameFor(COUNTRIES[p.country]) : p.country;
          left.appendChild(place);
          const right = document.createElement('span');
          right.className = 'p-nw';
          right.textContent = fmtBillions(p.netWorth);
          li.append(left, right);
          list.appendChild(li);
        }
        peopleEl.appendChild(list);
        if (above.length > limit) {
          const more = document.createElement('div');
          more.className = 'people-more';
          more.textContent = t('peopleMore', { n: above.length - limit });
          peopleEl.appendChild(more);
        }
        card.appendChild(peopleEl);
      }
    }

    const sourceEl = document.createElement('div');
    sourceEl.className = 'source-line';
    if (entity.type === 'country') {
      const s = sourceLine(entity.country);
      const left = document.createElement('span');
      left.textContent = t('source');
      const right = document.createElement('span');
      if (s.url) {
        const a = document.createElement('a');
        a.href = s.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = s.label;
        right.appendChild(a);
      } else {
        right.textContent = s.label;
      }
      sourceEl.append(left, right);
    } else {
      const s = groupSourceSummary(entity.members);
      const left = document.createElement('span');
      left.textContent = t('source');
      const right = document.createElement('span');
      right.textContent = s.label;
      sourceEl.append(left, right);
    }
    card.appendChild(sourceEl);

    els.results.appendChild(card);
  }
}

// ─── world map ─────────────────────────────────────────────────

const ATLAS_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

async function loadMap() {
  let world;
  try {
    const r = await fetch(ATLAS_URL);
    world = await r.json();
  } catch (e) {
    els.mapLoading.textContent = t('mapLoadFailed');
    return;
  }

  const countries = topojson.feature(world, world.objects.countries);
  const projection = d3.geoEqualEarth().fitSize([960, 500], countries);
  const path = d3.geoPath(projection);

  const svg = d3.select(els.map);
  svg.selectAll('*').remove();

  const g = svg.append('g');

  g.selectAll('path.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', d => {
      const a3 = ISO_NUMERIC_TO_ALPHA3[+d.id];
      return 'country' + (a3 ? '' : ' no-data');
    })
    .attr('d', path)
    .attr('data-iso', d => ISO_NUMERIC_TO_ALPHA3[+d.id] || '')
    .attr('data-name', d => d.properties && d.properties.name)
    .on('mouseenter', function(ev, d) {
      const a3 = ISO_NUMERIC_TO_ALPHA3[+d.id];
      const name = a3 && COUNTRIES[a3] ? nameFor(COUNTRIES[a3]) : (d.properties && d.properties.name) || '?';
      const status = a3 ? '' : ' (' + t('noData') + ')';
      els.mapTooltip.textContent = name + status;
      els.mapTooltip.style.display = 'block';
    })
    .on('mousemove', function(ev) {
      const wrap = els.map.parentElement.getBoundingClientRect();
      els.mapTooltip.style.left = (ev.clientX - wrap.left + 12) + 'px';
      els.mapTooltip.style.top  = (ev.clientY - wrap.top + 12) + 'px';
    })
    .on('mouseleave', () => { els.mapTooltip.style.display = 'none'; })
    .on('click', function(ev, d) {
      const a3 = ISO_NUMERIC_TO_ALPHA3[+d.id];
      if (!a3) return;
      toggleSelected('c:' + a3);
    });

  state.worldReady = true;
  els.mapLoading.style.display = 'none';
  paintMap();
}

function paintMap() {
  if (!state.worldReady) return;
  const selectedCountries = new Set();
  const groupCountries = new Set();
  for (const id of state.selected) {
    if (id.startsWith('c:')) selectedCountries.add(id.slice(2));
    else if (id.startsWith('g:')) {
      const g = GROUPS[id.slice(2)];
      if (!g) continue;
      for (const code of expandGroupMembers(g)) groupCountries.add(code);
    }
  }
  d3.select(els.map).selectAll('path.country').each(function() {
    const iso = this.getAttribute('data-iso');
    this.classList.toggle('selected', selectedCountries.has(iso));
    this.classList.toggle('in-group', !selectedCountries.has(iso) && groupCountries.has(iso));
  });
}

// ─── master refresh ────────────────────────────────────────────

function refresh() {
  // sync group buttons
  for (const btn of els.groups.querySelectorAll('button.group-chip')) {
    btn.classList.toggle('active', state.selected.includes(btn.dataset.id));
  }
  renderSelected();
  renderResults();
  paintMap();
}

// ─── input wiring ──────────────────────────────────────────────

let salaryDebounce = null;
els.salary.addEventListener('input', e => {
  state.income = parseSalary(e.target.value);
  clearTimeout(salaryDebounce);
  salaryDebounce = setTimeout(() => renderResults(), 80);
});

els.salary.addEventListener('blur', e => {
  if (state.income > 0) {
    e.target.value = fmtSalary(state.income);
  }
});

els.salary.addEventListener('focus', e => {
  e.target.value = state.income > 0 ? String(state.income) : '';
});

els.period.addEventListener('change', e => {
  state.period = e.target.value;
  renderResults();
});

els.search.addEventListener('input', e => {
  renderSearchResults(filterSearch(e.target.value));
});
els.search.addEventListener('focus', e => {
  if (e.target.value) renderSearchResults(filterSearch(e.target.value));
});
els.search.addEventListener('blur', () => {
  setTimeout(() => els.searchResults.classList.remove('open'), 120);
});
els.search.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    e.target.value = '';
    els.searchResults.classList.remove('open');
  } else if (e.key === 'Enter') {
    const first = els.searchResults.querySelector('li:not(.empty)');
    if (first) first.dispatchEvent(new Event('mousedown'));
  }
});

// ─── language switching ────────────────────────────────────────

function onLangChange() {
  renderGroups();
  renderSelected();
  renderResults();
  // refresh search results in current dropdown if open
  if (els.search.value) renderSearchResults(filterSearch(els.search.value));
  // re-format displayed salary if it was formatted (not focused)
  if (document.activeElement !== els.salary && state.income > 0) {
    els.salary.value = fmtSalary(state.income);
  }
}

for (const btn of document.querySelectorAll('.lang-btn')) {
  btn.classList.toggle('active', btn.dataset.lang === LANG);
  btn.addEventListener('click', () => setLang(btn.dataset.lang));
}

// ─── boot ──────────────────────────────────────────────────────

applyI18n();
state.income = parseSalary(els.salary.value);
if (state.income > 0) els.salary.value = fmtSalary(state.income);
renderGroups();
renderSelected();
renderResults();
loadMap();
