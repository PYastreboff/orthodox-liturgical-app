import type { OrthocalVerse } from '../api/orthocal';
import type { LiturgicalTextSection } from '../liturgical/liturgicalTexts';
import { applyScriptureTranslationToSections, scriptureParagraphsForCitation } from './scriptureTranslation';

const GREEK_TRANSLATIONS = ['moderngreek'] as const;
const GREEK_DETAIL = 'Modern Greek (getBible)';

export async function applyGreekToSections(
  sections: LiturgicalTextSection[],
  englishPassageByCitation: Map<string, OrthocalVerse[] | undefined>,
): Promise<LiturgicalTextSection[]> {
  return applyScriptureTranslationToSections(
    sections,
    englishPassageByCitation,
    GREEK_TRANSLATIONS,
    GREEK_DETAIL,
    'Greek unavailable — English (KJV)',
  );
}

export async function greekParagraphsForCitation(
  citation: string,
  englishTemplate?: OrthocalVerse[] | null,
) {
  return scriptureParagraphsForCitation(GREEK_TRANSLATIONS, citation, englishTemplate);
}
