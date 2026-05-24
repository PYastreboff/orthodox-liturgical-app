/**
 * Fetches Mount-Skete typikon-feasts-ru XML and builds a compact Julian-date index.
 * Run: node scripts/build-typikon-index.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE =
  'https://raw.githubusercontent.com/Mount-Skete/orthodox-typikon-feasts-xml/main/typikon-feasts-ru';
const MONTH_FILES = Array.from({ length: 12 }, (_, i) => `feasts_${String(i + 1).padStart(2, '0')}.xml`);
const MOVABLE_FILE = 'feasts_movable.xml';

function normalizeText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function extractTag(block, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = block.match(re);
  return match ? normalizeText(match[1]) : '';
}

function extractHymns(block) {
  const hymns = [];
  const hymnBlocks = block.match(/<hymn[\s\S]*?<\/hymn>/gi) ?? [];
  for (const hymnBlock of hymnBlocks) {
    const typeMatch = hymnBlock.match(/<hymn[^>]*type="([^"]+)"/i);
    const echoMatch = hymnBlock.match(/<hymn[^>]*echo="([^"]+)"/i);
    const contentBlock = hymnBlock.match(/<content[\s\S]*?<\/content>/i)?.[0] ?? '';
    const content =
      (contentBlock ? extractTag(contentBlock, 'ru') : '') ||
      extractTag(hymnBlock, 'content');
    if (!typeMatch || !content) continue;
    hymns.push({
      type: typeMatch[1],
      echo: echoMatch ? Number(echoMatch[1]) : null,
      titleRu: extractTag(hymnBlock, 'title') || null,
      textRu: content,
    });
  }
  return hymns;
}

function parseFeastBlock(block) {
  const titleRu = extractTag(block, 'title') || extractTag(block, 'ru');
  if (!titleRu) return null;

  const rankMatch = block.match(/<feast[^>]*rank="([^"]+)"/i);
  const typeMatch = block.match(/<feast[^>]*type="([^"]+)"/i);
  const julian = extractTag(block, 'julian');
  const easterMatch = block.match(/<easter[^>]*days="([^"]+)"/i);

  const hymns = extractHymns(block);
  if (!hymns.length && !julian && !easterMatch) return null;

  return {
    titleRu,
    rank: rankMatch?.[1] ?? null,
    feastType: typeMatch?.[1] ?? null,
    julian: julian || null,
    easterDays: easterMatch ? Number(easterMatch[1]) : null,
    hymns,
  };
}

function parseFeastsXml(xml) {
  const feasts = [];
  const parts = xml.split(/<feast\s/i);
  for (let i = 1; i < parts.length; i += 1) {
    const block = `<feast ${parts[i]}`;
    const end = block.indexOf('</feast>');
    const feastXml = end >= 0 ? block.slice(0, end + '</feast>'.length) : block;
    const parsed = parseFeastBlock(feastXml);
    if (parsed) feasts.push(parsed);
  }
  return feasts;
}

async function fetchXml(path) {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`Failed ${path}: ${res.status}`);
  return res.text();
}

const byJulian = {};
const movable = [];

for (const file of MONTH_FILES) {
  const xml = await fetchXml(file);
  for (const feast of parseFeastsXml(xml)) {
    if (feast.julian) {
      if (!byJulian[feast.julian]) byJulian[feast.julian] = [];
      byJulian[feast.julian].push(feast);
    }
  }
  console.log(`Parsed ${file}`);
}

const movableXml = await fetchXml(MOVABLE_FILE);
for (const feast of parseFeastsXml(movableXml)) {
  if (feast.easterDays !== null) movable.push(feast);
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), '../src/lib/liturgical/menaion/data');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'typikonByJulianDate.json');
writeFileSync(outPath, JSON.stringify({ byJulian, movable }, null, 0));
console.log(`Wrote ${outPath} (${Object.keys(byJulian).length} dates, ${movable.length} movable)`);
