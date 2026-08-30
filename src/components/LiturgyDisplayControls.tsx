import { StyleSheet, View } from 'react-native';

import { LiturgyLanguageToggle } from './LiturgyLanguageToggle';
import { WorshipServiceToggle } from './WorshipServiceToggle';
import type { WorshipServiceId } from '../lib/liturgical/worshipNavigation';
import type { LiturgyDisplayMode } from '../lib/liturgy/liturgyViewMode';

type Props = {
  service: WorshipServiceId;
  onServiceChange?: (service: WorshipServiceId) => void;
  showServiceToggle: boolean;
  mode: LiturgyDisplayMode;
  onChange: (mode: LiturgyDisplayMode) => void;
  isDark: boolean;
};

/** Scrollable worship controls: service toggle and language mode. */
export function LiturgyDisplayControls({
  service,
  onServiceChange,
  showServiceToggle,
  mode,
  onChange,
  isDark,
}: Props) {
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
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
});
