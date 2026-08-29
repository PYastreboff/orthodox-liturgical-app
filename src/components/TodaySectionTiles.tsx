import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTranslation } from '../i18n/useAppTranslation';
import { usePhoneLayout } from '../hooks/usePhoneLayout';
import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { todayTileGroups } from '../lib/today/todayTileGroups';
import { todaySectionTitleKey, type TodaySectionId } from '../lib/today/todaySections';
import type { ClergyRole } from '../types/liturgical';
import { cardElevation } from '../theme/cards';
import { colors } from '../theme/tokens';
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
  const phone = usePhoneLayout();
  const groups = todayTileGroups(servingRole);
  const iconColor = isDark ? colors.tabActiveDark : colors.accentWine;
  const tileBg = isDark ? colors.darkSurface : colors.card;
  const iconBg = isDark ? 'rgba(232,201,122,0.12)' : 'rgba(107,45,60,0.09)';
  const sectionMuted = isDark ? '#8f8982' : '#8a8278';

  return (
    <View style={styles.root}>
      {groups.map(({ group, tiles }) => (
        <View key={group.id} style={styles.group}>
          <Text style={[styles.groupTitle, { color: sectionMuted }]}>
            {t(group.titleKey)}
          </Text>
          <View style={[styles.grid, phone ? styles.gridPhone : styles.gridWide]}>
            {tiles.map((tile) => {
              const title = tileLabel(tile.id, tile.titleKey, servingRole, t);
              return (
                <Pressable
                  key={tile.id}
                  onPress={() => router.push(tile.href as Href)}
                  style={({ pressed }) => [
                    styles.tileShell,
                    cardElevation(isDark),
                    phone ? styles.tilePhone : styles.tileWide,
                    {
                      opacity: pressed ? 0.94 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={title}
                  {...hoverAccessibilityProps(title, { role: 'button' })}
                >
                  <View
                    style={[
                      styles.tile,
                      {
                        backgroundColor: tileBg,
                        borderColor: isDark ? colors.darkBorder : borderColor,
                      },
                    ]}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
                      <SectionIcon name={tile.icon} color={iconColor} size={20} />
                    </View>
                    <Text
                      style={[styles.tileLabel, { color: textColor }]}
                      numberOfLines={2}
                    >
                      {title}
                    </Text>
                  </View>
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
    marginBottom: 8,
  },
  group: {
    gap: 10,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    paddingHorizontal: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  gridPhone: {},
  gridWide: {
    gap: 12,
  },
  tileShell: {},
  tile: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16,
    paddingHorizontal: 14,
    minHeight: 96,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tilePhone: {
    width: '47.8%',
    flexGrow: 1,
  },
  tileWide: {
    width: '31%',
    minWidth: 160,
    flexGrow: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    width: '100%',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.05,
    lineHeight: 19,
    textAlign: 'center',
  },
});
