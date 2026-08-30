import { Feather } from '@expo/vector-icons';

import { useAppTranslation } from '../i18n/useAppTranslation';
import type { LiturgyDisplayMode, LiturgyTextLang } from '../lib/liturgy/liturgyViewMode';
import { segmentedControlTheme } from '../lib/ui/segmentedControlTheme';
import { SegmentedControl } from './SegmentedControl';

type Props = {
  mode: LiturgyDisplayMode;
  onChange: (mode: LiturgyDisplayMode) => void;
  isDark: boolean;
  fullWidth?: boolean;
};

type SegmentValue = LiturgyTextLang | 'compare';

function modeToSegment(mode: LiturgyDisplayMode): SegmentValue {
  if (mode.kind === 'compare') return 'compare';
  return mode.lang;
}

function segmentToMode(value: SegmentValue): LiturgyDisplayMode {
  if (value === 'compare') return { kind: 'compare', left: null, right: null };
  return { kind: 'single', lang: value };
}

export function LiturgyLanguageToggle({ mode, onChange, isDark, fullWidth = false }: Props) {
  const { t } = useAppTranslation();
  const theme = segmentedControlTheme(isDark);

  return (
    <SegmentedControl<SegmentValue>
      value={modeToSegment(mode)}
      onChange={(value) => onChange(segmentToMode(value))}
      isDark={isDark}
      fullWidth={fullWidth}
      segments={[
        { value: 'en', label: 'EN', accessibilityLabel: t('liturgy.chrysostom.langEnglish') },
        { value: 'el', label: 'ΕΛ', accessibilityLabel: t('liturgy.chrysostom.langGreek') },
        { value: 'ru', label: 'ЧС', accessibilityLabel: t('liturgy.chrysostom.langSlavonic') },
        {
          value: 'compare',
          accessibilityLabel: t('liturgy.chrysostom.langCompare'),
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
