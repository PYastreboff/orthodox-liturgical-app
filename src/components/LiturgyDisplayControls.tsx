import { StyleSheet, Text, View } from 'react-native';

import { CompareSidePicker } from './CompareSidePicker';
import { LiturgyLanguageToggle } from './LiturgyLanguageToggle';
import { WorshipServiceToggle } from './WorshipServiceToggle';
import { useAppTranslation } from '../i18n/useAppTranslation';
import type { WorshipServiceId } from '../lib/liturgical/worshipNavigation';
import type { LiturgyDisplayMode, LiturgyTextLang } from '../lib/liturgy/liturgyViewMode';

type Props = {
  service: WorshipServiceId;
  onServiceChange?: (service: WorshipServiceId) => void;
  showServiceToggle: boolean;
  mode: LiturgyDisplayMode;
  onChange: (mode: LiturgyDisplayMode) => void;
  isDark: boolean;
  hintType: { fontSize: number; lineHeight: number };
  mutedColor: string;
};

/** Scrollable worship controls: service toggle, language, compare pickers. */
export function LiturgyDisplayControls({
  service,
  onServiceChange,
  showServiceToggle,
  mode,
  onChange,
  isDark,
  hintType,
  mutedColor,
}: Props) {
  const { t } = useAppTranslation();

  return (
    <View style={styles.stack}>
      {showServiceToggle && onServiceChange ? (
        <WorshipServiceToggle
          value={service}
          onChange={onServiceChange}
          isDark={isDark}
          fullWidth
        />
      ) : null}
      <LiturgyLanguageToggle mode={mode} onChange={onChange} isDark={isDark} fullWidth />
      {mode.kind === 'compare' ? (
        <>
          <CompareSidePicker<LiturgyTextLang>
            left={mode.left}
            right={mode.right}
            onChangeLeft={(left) => onChange({ kind: 'compare', left, right: mode.right })}
            onChangeRight={(right) => onChange({ kind: 'compare', left: mode.left, right })}
            options={[
              { value: 'en', label: 'EN' },
              { value: 'el', label: 'ΕΛ' },
              { value: 'ru', label: 'ЧС' },
            ]}
            leftLabel={t('readings.compareColumnLeft')}
            rightLabel={t('readings.compareColumnRight')}
            isDark={isDark}
          />
          <Text style={[hintType, styles.compareHint, { color: mutedColor }]}>
            {t('liturgy.chrysostom.compareHint')}
          </Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 10,
  },
  compareHint: {
    lineHeight: 18,
    opacity: 0.9,
  },
});
