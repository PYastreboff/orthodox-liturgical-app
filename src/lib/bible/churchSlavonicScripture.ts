import type { OrthocalVerse } from '../api/orthocal';
import type { LiturgicalTextSection } from '../liturgical/liturgicalTexts';
import { applyScriptureTranslationToSections, scriptureParagraphsForCitation } from './scriptureTranslation';

const SLAVONIC_TRANSLATIONS = ['csielizabeth'] as const;
const SLAVONIC_DETAIL = 'Church Slavonic (Elizabeth Bible, 1757)';

export async function slavonicParagraphsForCitation(
  citation: string,
  englishTemplate?: OrthocalVerse[] | null,
) {
  return scriptureParagraphsForCitation(SLAVONIC_TRANSLATIONS, citation, englishTemplate);
}

export async function applyChurchSlavonicToSections(
  sections: LiturgicalTextSection[],
  englishPassageByCitation: Map<string, OrthocalVerse[] | undefined>,
): Promise<LiturgicalTextSection[]> {
  return applyScriptureTranslationToSections(
    sections,
    englishPassageByCitation,
    SLAVONIC_TRANSLATIONS,
    SLAVONIC_DETAIL,
    'Slavonic unavailable — English (KJV)',
  );
}
