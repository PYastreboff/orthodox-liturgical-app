import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PrayerRopeIcon } from './svg/PrayerRopeIcon';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { useFontScale } from '../hooks/useFontScale';
import { surfaceCard } from '../theme/cards';
import { radii } from '../theme/tokens';

type Props = {
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isDark: boolean;
};

export function JesusPrayerRopeLink({
  textColor,
  mutedColor,
  borderColor,
  isDark,
}: Props) {
  const { t } = useAppTranslation();
  const { text } = useFontScale();
  const router = useRouter();
  const title = t('prayers.ropeLinkTitle');

  return (
    <Pressable
      onPress={() => router.push('/day/jesusPrayer' as Href)}
      style={({ pressed }) => [
        styles.row,
        surfaceCard(isDark, { radius: radii.lg }),
        {
          borderColor,
          opacity: pressed ? 0.86 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      {...hoverAccessibilityProps(title, { role: 'button' })}
    >
      <PrayerRopeIcon size={28} color={mutedColor} />
      <Text style={[text(14, 18), styles.title, { color: textColor }]}>{title}</Text>
      <Feather name="chevron-right" size={16} color={mutedColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  title: {
    flex: 1,
    fontWeight: '600',
  },
});
