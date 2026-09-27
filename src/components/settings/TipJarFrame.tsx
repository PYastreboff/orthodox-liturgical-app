import { Feather } from '@expo/vector-icons';
import { useTheme } from 'expo-router/react-navigation';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTranslation } from '../../i18n/useAppTranslation';
import { useVestmentAccent } from '../../state/VestmentAccentContext';
import { iconBadgeSurface } from '../../theme/cards';
import { colors } from '../../theme/tokens';
import { useResolvedColorScheme } from '../../theme/useResolvedColorScheme';
import { settingsListCard } from './SettingsLinkRow';

/** Card chrome shared by the PayPal (Android/web) and StoreKit (iOS) tip jars. */
export function TipJarFrame({ body, children }: { body: string; children: ReactNode }) {
  const theme = useTheme();
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const vestmentAccent = useVestmentAccent();
  const muted = isDark ? '#a39e98' : colors.muted;

  return (
    <View
      style={[
        settingsListCard(isDark),
        styles.card,
        {
          backgroundColor: vestmentAccent.accentMuted,
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107, 45, 60, 0.08)',
        },
      ]}
    >
      <View style={styles.inner}>
        <View style={iconBadgeSurface(vestmentAccent.accentSoft)}>
          <Feather name="coffee" size={18} color={vestmentAccent.accent} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('settings.tipJarTitle')}</Text>
        <Text style={[styles.body, { color: muted }]}>{body}</Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
  },
  inner: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
