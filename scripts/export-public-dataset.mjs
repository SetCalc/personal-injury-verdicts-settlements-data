// Regenerates the public dataset files in ../data from the live SetCalc API.
//
// Usage: node scripts/export-public-dataset.mjs
// Requires Node 18+ (built-in fetch). No dependencies, no API key.
//
// The script reads only the public, read-only endpoint at
// https://setcalc.com/api/verdicts and writes:
//   data/verdicts-settlements.csv
//   data/verdicts-settlements.json
//   data/summary-stats.json

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const API = 'https://setcalc.com/api/verdicts';
const PAGE_SIZE = 50;
const DELAY_MS = 120;

// Public fields only. Submitter contact details and internal enrichment
// fields are intentionally excluded from the open release.
const FIELDS = [
  'caseTitle',
  'state',
  'county',
  'year',
  'practiceArea',
  'injuryType',
  'resultType',
  'amount',
  'description',
  'source',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(page, attempt = 1) {
  try {
    // Sort on _id: unique and immutable, so pagination is stable. The default
    // amount sort has heavy ties and drops records across page boundaries.
    const res = await fetch(`${API}?limit=${PAGE_SIZE}&page=${page}&sort=_id&order=asc`, {
      headers: { 'User-Agent': 'setcalc-dataset-exporter' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (attempt >= 3) throw err;
    console.warn(`page ${page} failed (${err.message}), retrying...`);
    await sleep(1000 * attempt);
    return fetchPage(page, attempt + 1);
  }
}

function toRecord(v) {
  const rec = {};
  for (const f of FIELDS) {
    let val = v[f];
    if (val === undefined || val === null) val = '';
    if (typeof val === 'string') val = val.replace(/\r/g, '').trim();
    rec[f] = val;
  }
  return rec;
}

function csvCell(val) {
  const s = String(val);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function median(sortedNums) {
  const n = sortedNums.length;
  if (n === 0) return null;
  const mid = Math.floor(n / 2);
  return n % 2 ? sortedNums[mid] : (sortedNums[mid - 1] + sortedNums[mid]) / 2;
}

async function main() {
  const first = await fetchPage(1);
  const total = first.total;
  const totalPages = first.totalPages;
  console.log(`live records: ${total} across ${totalPages} pages`);

  const byId = new Map();
  const ingest = (list) => {
    for (const v of list) {
      const id = v._id || JSON.stringify([v.caseTitle, v.state, v.year, v.amount]);
      if (!byId.has(id)) byId.set(id, toRecord(v));
    }
  };

  ingest(first.verdicts);
  for (let page = 2; page <= totalPages; page++) {
    await sleep(DELAY_MS);
    const data = await fetchPage(page);
    ingest(data.verdicts);
    if (page % 10 === 0) console.log(`  page ${page}/${totalPages}, ${byId.size} unique so far`);
  }

  const records = [...byId.values()].sort(
    (a, b) =>
      b.year - a.year ||
      b.amount - a.amount ||
      String(a.caseTitle).localeCompare(String(b.caseTitle)),
  );
  if (records.length < total) {
    console.warn(`warning: collected ${records.length} unique of ${total} reported; pagination drift`);
  }

  // Summary stats over the exported records
  const amounts = records.map((r) => r.amount).filter((a) => typeof a === 'number').sort((x, y) => x - y);
  const years = records.map((r) => r.year).filter(Boolean);
  const states = new Set(records.map((r) => r.state).filter(Boolean));
  const group = (key) => {
    const m = {};
    for (const r of records) {
      const k = r[key] || 'Unknown';
      (m[k] ||= []).push(r.amount);
    }
    return Object.fromEntries(
      Object.entries(m)
        .sort((a, b) => b[1].length - a[1].length)
        .map(([k, arr]) => {
          arr.sort((x, y) => x - y);
          return [k, { count: arr.length, medianAmount: median(arr) }];
        }),
    );
  };

  const summary = {
    dataset: 'SetCalc Personal Injury Verdicts and Settlements Dataset',
    homepage: 'https://setcalc.com/personal-injury-verdicts-and-settlements',
    license: 'CC-BY-4.0',
    asOf: new Date().toISOString().slice(0, 10),
    recordCount: records.length,
    yearMin: Math.min(...years),
    yearMax: Math.max(...years),
    stateCount: states.size,
    medianAmount: median(amounts),
    byPracticeArea: group('practiceArea'),
    byResultType: group('resultType'),
    bySource: group('source'),
  };

  const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
  mkdirSync(outDir, { recursive: true });

  const csv = [
    FIELDS.join(','),
    ...records.map((r) => FIELDS.map((f) => csvCell(r[f])).join(',')),
  ].join('\n');
  writeFileSync(join(outDir, 'verdicts-settlements.csv'), csv + '\n');
  writeFileSync(join(outDir, 'verdicts-settlements.json'), JSON.stringify(records, null, 1) + '\n');
  writeFileSync(join(outDir, 'summary-stats.json'), JSON.stringify(summary, null, 2) + '\n');

  console.log(JSON.stringify({ ...summary, byPracticeArea: undefined, bySource: undefined, byResultType: undefined }, null, 2));
  console.log('practice areas:', Object.entries(summary.byPracticeArea).map(([k, v]) => `${k}:${v.count}`).join(' '));
  console.log('sources:', Object.entries(summary.bySource).map(([k, v]) => `${k}:${v.count}`).join(' '));
  console.log('result types:', Object.entries(summary.byResultType).map(([k, v]) => `${k}:${v.count}`).join(' '));
}

main().catch((err) => {
  console.error('export failed:', err);
  process.exit(1);
});
