import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useAppTranslation } from '../i18n/useAppTranslation';
import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { todayTileGroups } from '../lib/today/todayTileGroups';
import { todaySectionTitleKey, type TodaySectionId } from '../lib/today/todaySections';
import type { ClergyRole } from '../types/liturgical';
import { useLiturgicalVestmentAccent } from '../state/VestmentAccentContext';
import { surfaceCard } from '../theme/cards';
import { radii, typography } from '../theme/tokens';
import { SectionIcon } from './SectionIcon';

type Props = {
  servingRole: ClergyRole;
  textColor: string;
  borderColor: string;
  isDark: boolean;
};

const GUIDE_TILE_IDS = new Set<TodaySectionId>([
  'choirGuide',
  'altarRoles',
  'readerGuide',
  'deaconGuide',
  'priestGuide',
]);

function tileLabel(
  tileId: TodaySectionId,
  titleKey: string,
  servingRole: ClergyRole,
  t: (key: string) => string,
): string {
  if (GUIDE_TILE_IDS.has(tileId)) {
    return t(todaySectionTitleKey(tileId, servingRole));
  }
  return t(titleKey);
}

export function TodaySectionTiles({
  servingRole,
  textColor,
  borderColor,
  isDark,
}: Props) {
  const { t } = useAppTranslation();
  const router = useRouter();
  const vestmentAccent = useLiturgicalVestmentAccent();
  const groups = todayTileGroups(servingRole);
  const iconColor = vestmentAccent.accent;
  const sectionMuted = isDark ? '#8a8480' : '#7a746e';
  const rowDivider = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(43,38,35,0.06)';

  return (
    <View style={styles.root}>
      {groups.map(({ group, tiles }) => (
        <View key={group.id} style={styles.group}>
          <Text style={[styles.groupTitle, typography.eyebrow, { color: sectionMuted }]}>
            {t(group.titleKey)}
          </Text>
          <View style={[styles.groupCard, surfaceCard(isDark, { radius: radii.lg })]}>
            {tiles.map((tile, index) => {
              const title = tileLabel(tile.id, tile.titleKey, servingRole, t);
              const isLast = index === tiles.length - 1;
              return (
                <Pressable
                  key={tile.id}
                  onPress={() => router.push(tile.href as Href)}
                  style={({ pressed }) => [
                    styles.row,
                    !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: rowDivider },
                    { opacity: pressed ? 0.72 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={title}
                  {...hoverAccessibilityProps(title, { role: 'button' })}
                >
                  <SectionIcon name={tile.icon} color={iconColor} size={18} />
                  <Text style={[styles.rowLabel, { color: textColor }]} numberOfLines={2}>
                    {title}
                  </Text>
                  <Feather name="chevron-right" size={16} color={sectionMuted} />
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 20,
    marginTop: 8,
    marginBottom: 10,
  },
  group: {
    gap: 8,
  },
  groupTitle: {
    paddingHorizontal: 2,
    opacity: 0.9,
  },
  groupCard: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.05,
    lineHeight: 20,
  },
});
