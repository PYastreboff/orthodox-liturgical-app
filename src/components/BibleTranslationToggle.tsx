import { useAppTranslation } from '../i18n/useAppTranslation';
import type { BibleTextLang } from '../lib/bible/bibleTranslation';
import { SegmentedControl } from './SegmentedControl';

type Props = {
  value: BibleTextLang;
  onChange: (value: BibleTextLang) => void;
  isDark: boolean;
  fullWidth?: boolean;
};

export function BibleTranslationToggle({ value, onChange, isDark, fullWidth = false }: Props) {
  const { t } = useAppTranslation();

  return (
    <SegmentedControl<BibleTextLang>
      value={value}
      onChange={onChange}
      isDark={isDark}
      fullWidth={fullWidth}
      segments={[
        { value: 'en', label: 'EN', accessibilityLabel: t('bible.langEnglish') },
        { value: 'el', label: 'ΕΛ', accessibilityLabel: t('bible.langGreek') },
        { value: 'chu', label: 'ЧС', accessibilityLabel: t('bible.langSlavonic') },
      ]}
    />
  );
}
