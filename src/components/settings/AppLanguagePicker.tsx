import type { UiLanguage } from '../../i18n/types';
import { useAppTranslation } from '../../i18n/useAppTranslation';

import { AnimatedSegmentIcon } from './AnimatedSegmentIcon';
import { LANGUAGE_GLYPH_ICON_SIZE, LanguageGlyphIcon } from './LanguageGlyphIcon';
import { SegmentedPicker, type SegmentedOption } from './SegmentedPicker';

type Props = {
  value: UiLanguage;
  onChange: (value: UiLanguage) => void;
  isDark: boolean;
};

const LANGUAGE_A11Y: Record<UiLanguage, string> = {
  en: 'English',
  ru: 'Русский',
  el: 'Ελληνικά',
};

export function AppLanguagePicker({ value, onChange, isDark }: Props) {
  const { t } = useAppTranslation();
  const options: SegmentedOption<UiLanguage>[] = [
    { id: 'en', label: t('settings.languageEnglish') },
    { id: 'ru', label: t('settings.languageRussian') },
    { id: 'el', label: t('settings.languageGreek') },
  ];

  return (
    <SegmentedPicker
      options={options}
      value={value}
      onChange={onChange}
      isDark={isDark}
      optionStyle="row"
      renderLeading={(option, { inactiveColor, index, progress }) => (
        <AnimatedSegmentIcon
          index={index}
          progress={progress}
          inactiveColor={inactiveColor}
          size={LANGUAGE_GLYPH_ICON_SIZE}
          accessibilityLabel={LANGUAGE_A11Y[option.id]}
          renderIcon={(color) => <LanguageGlyphIcon lang={option.id} color={color} />}
        />
      )}
    />
  );
}
