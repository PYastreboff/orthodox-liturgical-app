/**
 * Build aligned Divine Liturgy JSON from GOARCH Hieratikon skeleton sources.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ChrysostomSectionId } from '../../src/lib/liturgy/chrysostomLiturgy.ts';
import { sanitizeLiturgyLines } from '../../src/lib/liturgy/liturgySanitize.ts';
import { alignLiturgySection } from './alignLiturgySection.ts';
import { buildBasilGreekParagraphs } from './buildBasilGreek.ts';
import { normalizeLiturgyParagraphs } from './normalizeLiturgyLang.ts';
import { parseLiturgyBlock, splitCreedParagraphs } from './parseLiturgySource.ts';

export const DIVINE_LITURGY_SECTION_IDS = [
  'opening',
  'great_litany',
  'antiphons',
  'readings',
  'cherubic',
  'creed',
  'anaphora',
  'communion',
  'dismissal',
] as const;

export type DivineLiturgySectionId = (typeof DIVINE_LITURGY_SECTION_IDS)[number];
type Lang = 'en' | 'ru' | 'el';

type SectionMarker = { id: DivineLiturgySectionId; pattern: RegExp };

export type DivineLiturgySourceConfig = {
  sourcesDir: string;
  enFile: string;
  ruFile: string;
  elFile: string;
  enMarkers: SectionMarker[];
  ruMarkers: SectionMarker[];
  elMarkers: SectionMarker[];
};

function findSectionStarts(lines: string[], markers: SectionMarker[]): Map<DivineLiturgySectionId, number> {
  const starts = new Map<DivineLiturgySectionId, number>();

  for (const marker of markers) {
    let found = -1;
    for (let i = 0; i < lines.length; i++) {
      if (marker.pattern.test(lines[i]!.trim())) {
        found = i;
        break;
      }
    }
    if (found < 0) {
      throw new Error(`Missing marker ${marker.id}: ${marker.pattern}`);
    }
    starts.set(marker.id, found);
  }

  return starts;
}

function buildLanguageSections(
  sourcesDir: string,
  file: string,
  lang: Lang,
  markers: SectionMarker[],
): Map<DivineLiturgySectionId, string[]> {
  const text = readFileSync(join(sourcesDir, file), 'utf8');
  const rawLines = text.split(/\r?\n/);
  const starts = findSectionStarts(rawLines, markers);

  const sections = new Map<DivineLiturgySectionId, string[]>();
  for (let i = 0; i < DIVINE_LITURGY_SECTION_IDS.length; i++) {
    const id = DIVINE_LITURGY_SECTION_IDS[i]!;
    const start = starts.get(id)!;
    const end =
      i + 1 < DIVINE_LITURGY_SECTION_IDS.length
        ? starts.get(DIVINE_LITURGY_SECTION_IDS[i + 1]!)!
        : rawLines.length;
    const slice = rawLines.slice(start, end).join('\n');
    let paragraphs = parseLiturgyBlock(slice, lang);
    if (id === 'creed') {
      paragraphs = splitCreedParagraphs(paragraphs);
    }
    paragraphs = normalizeLiturgyParagraphs(paragraphs, lang, id as ChrysostomSectionId);
    if (paragraphs.length === 0) {
      throw new Error(`[${lang}] Section "${id}" produced no paragraphs`);
    }
    sections.set(id, paragraphs);
  }

  return sections;
}

export function buildGoarchDivineLiturgy(config: DivineLiturgySourceConfig) {
  const enSections = buildLanguageSections(config.sourcesDir, config.enFile, 'en', config.enMarkers);
  const ruSections = buildLanguageSections(config.sourcesDir, config.ruFile, 'ru', config.ruMarkers);
  const elSections = buildLanguageSections(config.sourcesDir, config.elFile, 'el', config.elMarkers);

  return assembleLiturgySections(enSections, ruSections, elSections);
}

export function assembleLiturgySections(
  enSections: Map<DivineLiturgySectionId, string[]>,
  ruSections: Map<DivineLiturgySectionId, string[]>,
  elSections: Map<DivineLiturgySectionId, string[]>,
  options?: { preserveElLength?: boolean },
) {
  const sections = DIVINE_LITURGY_SECTION_IDS.map((id) => {
    const en = sanitizeLiturgyLines(enSections.get(id)!, 'en', id);
    const ru = sanitizeLiturgyLines(ruSections.get(id)!, 'ru', id);
    const el = sanitizeLiturgyLines(elSections.get(id)!, 'el', id, {
      preserveLength: options?.preserveElLength,
    });
    const units = alignLiturgySection(en, ru, el);

    return {
      id,
      units,
      paragraphs: { en, ru, el },
    };
  });

  return sections;
}

export function buildBasilGoarchDivineLiturgy(
  config: DivineLiturgySourceConfig,
  args: {
    chrysostomConfig: DivineLiturgySourceConfig;
    grEnFile: string;
    grEnMarkers: SectionMarker[];
    overridesFile?: string;
    sharedEnFromChrysostom?: DivineLiturgySectionId[];
  },
) {
  const sourcesDir = config.sourcesDir;
  const chrysostomSections = buildGoarchDivineLiturgy({ ...args.chrysostomConfig, sourcesDir });
  const chrysParagraphs = new Map(
    chrysostomSections.map((section) => [section.id, section.paragraphs]),
  );

  const enSections = buildLanguageSections(sourcesDir, config.enFile, 'en', config.enMarkers);
  const ruSections = buildLanguageSections(sourcesDir, config.ruFile, 'ru', config.ruMarkers);

  const chrysEnSections = new Map<DivineLiturgySectionId, string[]>();
  const chrysElSections = new Map<DivineLiturgySectionId, string[]>();
  for (const id of DIVINE_LITURGY_SECTION_IDS) {
    const paragraphs = chrysParagraphs.get(id)!;
    chrysEnSections.set(id, paragraphs.en);
    chrysElSections.set(id, paragraphs.el);
  }

  for (const id of args.sharedEnFromChrysostom ?? ['great_litany']) {
    const paragraphs = chrysParagraphs.get(id)!;
    enSections.set(id, paragraphs.en);
  }

  const elSections = buildBasilGreekParagraphs({
    sourcesDir,
    enBySection: enSections,
    chrysostomEnBySection: chrysEnSections,
    chrysostomElBySection: chrysElSections,
    grEnFile: args.grEnFile,
    grEnMarkers: args.grEnMarkers,
    overridesFile: args.overridesFile,
  });

  for (const id of args.sharedEnFromChrysostom ?? ['great_litany']) {
    elSections.set(id, chrysParagraphs.get(id)!.el);
  }

  return assembleLiturgySections(enSections, ruSections, elSections);
}

export const CHRYSOSTOM_GOARCH_CONFIG: DivineLiturgySourceConfig = {
  sourcesDir: '',
  enFile: 'chrysostom-en-goarch.txt',
  ruFile: 'chrysostom-ru.txt',
  elFile: 'chrysostom-gr-en-goarch.txt',
  enMarkers: [
    { id: 'opening', pattern: /ENARXIS, PEACE LITANY/i },
    { id: 'great_litany', pattern: /In peace let us pray to the Lord/i },
    { id: 'antiphons', pattern: /^THE ENTRANCE$/i },
    { id: 'readings', pattern: /Epistle Reading/i },
    { id: 'cherubic', pattern: /ENTRANCE OF THE HOLY GIFTS/i },
    { id: 'creed', pattern: /KISS OF PEACE AND CREED|The Creed I believe/i },
    { id: 'anaphora', pattern: /HOLY ANAPHORA/i },
    { id: 'communion', pattern: /ELEVATION – FRACTION/i },
    { id: 'dismissal', pattern: /^THANKSGIVING$/i },
  ],
  ruMarkers: [
    { id: 'opening', pattern: /^Диакон:/im },
    { id: 'great_litany', pattern: /Миром.*Господу помолимся/i },
    { id: 'antiphons', pattern: /малый вход.*евангели/i },
    { id: 'readings', pattern: /^апостол$/i },
    { id: 'cherubic', pattern: /херувимская песнь и великий вход/i },
    { id: 'creed', pattern: /символ веры/i },
    { id: 'anaphora', pattern: /евхаристическая молитва.*анафора/i },
    { id: 'communion', pattern: /^причащение$/i },
    { id: 'dismissal', pattern: /заключительное благословение и отпуст/i },
  ],
  elMarkers: [
    { id: 'opening', pattern: /^ΔΙΑΚΟΝΟΣ(?:\s|$)/ },
    { id: 'great_litany', pattern: /Ἐν εἰρήνῃ τοῦ Κυρίου δεηθῶμεν/ },
    { id: 'antiphons', pattern: /^Η ΕΙΣΟΔΟΣ$/ },
    { id: 'readings', pattern: /ΕΥΧΗ ΤΟΥ ΕΥΑΓΓΕΛΙΟΥ|Τὸ Εὐαγγέλιον/ },
    { id: 'cherubic', pattern: /Η ΕΙΣΟΔΟΣ ΤΩΝ ΤΙΜΙΩΝ ΔΩΡΩΝ/ },
    { id: 'creed', pattern: /Σύμβολον τῆς Πίστεως/ },
    { id: 'anaphora', pattern: /Η ΑΓΙΑ ΑΝΑΦΟΡΑ/ },
    { id: 'communion', pattern: /ΥΨΩΣΙΣ – ΜΕΛΙΣΜΟΣ/ },
    { id: 'dismissal', pattern: /^ΕΥΧΑΡΙΣΤΙΑ$/ },
  ],
};

export const BASIL_GOARCH_CONFIG: DivineLiturgySourceConfig = {
  sourcesDir: '',
  enFile: 'basil-en-goarch.txt',
  ruFile: 'chrysostom-ru.txt',
  elFile: 'basil-gr-en-goarch.txt',
  enMarkers: [
    { id: 'opening', pattern: /ENARXIS, PEACE LITANY/i },
    { id: 'great_litany', pattern: /In peace let us pray to the Lord/i },
    { id: 'antiphons', pattern: /^THE ENTRANCE$/i },
    { id: 'readings', pattern: /Epistle Reading/i },
    { id: 'cherubic', pattern: /ENTRANCE OF THE HOLY GIFTS/i },
    { id: 'creed', pattern: /Let us love one another|The Creed/i },
    { id: 'anaphora', pattern: /HOLY ANAPHORA/i },
    { id: 'communion', pattern: /ELEVATION – FRACTION/i },
    { id: 'dismissal', pattern: /^THANKSGIVING$/i },
  ],
  ruMarkers: CHRYSOSTOM_GOARCH_CONFIG.ruMarkers,
  elMarkers: [
    { id: 'opening', pattern: /^ΔΙΑΚΟΝΟΣ(?:\s|$)/ },
    { id: 'great_litany', pattern: /Ἐν εἰρήνῃ τοῦ Κυρίου δεηθῶμεν/ },
    { id: 'antiphons', pattern: /Η ΕΙΣΟΔΟΣ THE ENTRANCE/ },
    { id: 'readings', pattern: /ΕΥΧΗ ΤΟΥ ΕΥΑΓΓΕΛΙΟΥ|Τὸ Εὐαγγέλιον/ },
    { id: 'cherubic', pattern: /Η ΕΙΣΟΔΟΣ ΤΩΝ ΤΙΜΙΩΝ ΔΩΡΩΝ/ },
    { id: 'creed', pattern: /Σύμβολον τῆς Πίστεως/ },
    { id: 'anaphora', pattern: /Η ΑΓΙΑ ΑΝΑΦΟΡΑ/ },
    { id: 'communion', pattern: /ΥΨΩΣΙΣ – ΜΕΛΙΣΜΟΣ/ },
    { id: 'dismissal', pattern: /ΕΥΧΑΡΙΣΤΙΑ THANKSGIVING/ },
  ],
};
