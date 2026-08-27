import { useRouter, type Href } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTranslation } from '../i18n/useAppTranslation';
import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { todayHomeTiles } from '../lib/today/todaySections';
import type { ClergyRole } from '../types/liturgical';
import { colors } from '../theme/tokens';
import { SectionIcon } from './SectionIcon';

type Props = {
  servingRole: ClergyRole;
  textColor: string;
  borderColor: string;
  isDark: boolean;
};

export function TodaySectionTiles({
  servingRole,
  textColor,
  borderColor,
  isDark,
}: Props) {
  const { t } = useAppTranslation();
  const router = useRouter();
  const tiles = todayHomeTiles(servingRole);
  const iconColor = isDark ? colors.tabActiveDark : colors.accentWine;
  const tileBg = isDark ? colors.darkSurface : colors.card;
  const muted = isDark ? '#a39e98' : colors.muted;

  return (
    <View style={styles.rowList}>
      {tiles.map((tile) => {
        const title = t(tile.titleKey);
        return (
          <Pressable
            key={tile.id}
            onPress={() => router.push(tile.href as Href)}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: tileBg,
                borderColor,
                opacity: pressed ? 0.92 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={title}
            {...hoverAccessibilityProps(title, { role: 'button' })}
          >
            <SectionIcon name={tile.icon} color={iconColor} size={24} />
            <Text style={[styles.rowLabel, { color: textColor }]} numberOfLines={1}>
              {title}
            </Text>
            <Feather name="chevron-right" size={18} color={muted} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rowList: {
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 56,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
