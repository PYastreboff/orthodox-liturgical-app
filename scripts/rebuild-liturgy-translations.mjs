#!/usr/bin/env node
/**
 * Rebuild liturgy-translations.json from the English spine only.
 * Greek: GOARCH gr-en pairs + COMMON lines. Russian: pending hand translations.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcesDir = join(root, 'scripts/liturgy-sources');

// Dynamic import for TS modules
const { buildGoarchDivineLiturgy, CHRYSOSTOM_GOARCH_CONFIG, buildBasilGoarchDivineLiturgy, BASIL_GOARCH_CONFIG } =
  await import('../scripts/lib/buildGoarchDivineLiturgy.ts');

const pendingPath = join(sourcesDir, 'liturgy-translations-pending.json');
const pending = JSON.parse(readFileSync(pendingPath, 'utf8'));

// Build fresh chrysostom/basil with pipeline but WITHOUT global map
// Use only greek builder + pending ru
const chrysSections = buildGoarchDivineLiturgy({ ...CHRYSOSTOM_GOARCH_CONFIG, sourcesDir });
const basilSections = buildBasilGoarchDivineLiturgy(
  { ...BASIL_GOARCH_CONFIG, sourcesDir },
  {
    chrysostomConfig: { ...CHRYSOSTOM_GOARCH_CONFIG, sourcesDir },
    grEnFile: 'basil-gr-en-goarch.txt',
    grEnMarkers: BASIL_GOARCH_CONFIG.elMarkers,
    overridesFile: 'basil-el-overrides.json',
    sharedEnFromChrysostom: ['great_litany'],
  },
);

const el = { ...pending.el };
const ru = { ...pending.ru };

for (const sections of [chrysSections, basilSections]) {
  for (const section of sections) {
    section.units.forEach((unit, i) => {
      const en = unit.en?.trim();
      if (!en) return;
      const greek = section.paragraphs.el[i]?.trim();
      const russian = section.paragraphs.ru[i]?.trim();
      if (greek && !el[en]) el[en] = greek;
      // Only use aligned ru if pending doesn't have it
      if (russian && !ru[en]) ru[en] = russian;
    });
  }
}

// Force-correct common responses (override any bad aligned values)
const CORRECT = {
  el: {
    'CHOIR: Amen.': 'ΧΟΡΟΣ: Ἀμήν.',
    'CHOIR: To You, O Lord.': 'ΧΟΡΟΣ: Σοὶ Κύριε.',
    'CHOIR (after each petition): Lord, have mercy.': 'ΧΟΡΟΣ (μετὰ ἕκαστον αἴτημα): Κύριε, ἐλέησον.',
    'CHOIR: Lord, have mercy.': 'ΧΟΡΟΣ: Κύριε, ἐλέησον.',
    'CHOIR: And with your spirit.': 'ΧΟΡΟΣ: Καὶ μετὰ τοῦ πνεύματός σου.',
    'PRIEST: Peace be with all.': 'ΙΕΡΕΥΣ: Ἡ εἰρήνη πᾶσι.',
    'DEACON: Master, give the blessing.': 'ΔΙΑΚΟΝΟΣ: Εὐλόγησον, Δέσποτα.',
    'In peace let us pray to the Lord.': 'ΔΙΑΚΟΝΟΣ: Ἐν εἰρήνῃ τοῦ Κυρίου δεηθῶμεν.',
  },
  ru: {
    'CHOIR: Amen.': 'Хор: Аминь.',
    'CHOIR: To You, O Lord.': 'Хор: Тебе, Господи.',
    'CHOIR (after each petition): Lord, have mercy.': 'Хор: Господи, помилуй (после каждого прошения).',
    'CHOIR: Lord, have mercy.': 'Хор: Господи, помилуй.',
    'CHOIR: And with your spirit.': 'Хор: И со духом Твоим.',
    'PRIEST: Peace be with all.': 'Священник: Мир всем.',
    'DEACON: Master, give the blessing.': 'Диакон: Благослови, владыко.',
    'In peace let us pray to the Lord.': 'Диакон: Миром Господу помолимся.',
    'DEACON: Again and again in peace let us pray to the Lord.': 'Диакон: Паки и паки миром Господу помолимся.',
    'DEACON: Help us, save us, have mercy on us, and protect us, O God, by Your grace.':
      'Диакон: Заступи, спаси, помилуй и сохрани нас, Боже, Твоею благодатию.',
  },
};

Object.assign(el, CORRECT.el);
Object.assign(ru, CORRECT.ru);

writeFileSync(join(sourcesDir, 'liturgy-translations.json'), `${JSON.stringify({ el, ru }, null, 2)}\n`);
console.log(`Wrote ${Object.keys(el).length} el, ${Object.keys(ru).length} ru translations`);
