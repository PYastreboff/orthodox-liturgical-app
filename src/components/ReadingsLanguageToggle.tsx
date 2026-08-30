import { Feather } from '@expo/vector-icons';

import { useAppTranslation } from '../i18n/useAppTranslation';
import type { TextLanguage } from '../lib/readings/textLanguage';
import { segmentedControlTheme } from '../lib/ui/segmentedControlTheme';
import { SegmentedControl } from './SegmentedControl';

type Props = {
  value: TextLanguage;
  onChange: (value: TextLanguage) => void;
  isDark: boolean;
  fullWidth?: boolean;
};

export function ReadingsLanguageToggle({ value, onChange, isDark, fullWidth }: Props) {
  const { t } = useAppTranslation();
  const theme = segmentedControlTheme(isDark);

  return (
    <SegmentedControl<TextLanguage>
      value={value}
      onChange={onChange}
      isDark={isDark}
      fullWidth={fullWidth}
      segments={[
        { value: 'en', label: 'EN', accessibilityLabel: t('readings.langEnglish') },
        { value: 'chu', label: 'ЧС', accessibilityLabel: t('readings.langSlavonic') },
        { value: 'el', label: 'ΕΛ', accessibilityLabel: t('readings.langGreek') },
        {
          value: 'compare',
          accessibilityLabel: t('readings.langSideBySide'),
          icon: (active) => (
            <Feather
              name="columns"
              size={14}
              color={active ? theme.chipSelectedFg : theme.chipIdleFg}
            />
          ),
        },
      ]}
    />
  );
}
