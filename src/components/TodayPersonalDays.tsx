import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTranslation } from '../i18n/useAppTranslation';
import { useFontScale } from '../hooks/useFontScale';
import {
  calendarLabelForOccurrence,
  displayKindForOccurrence,
  type PersonalDayDisplayKind,
  type PersonalDayOccurrence,
} from '../lib/personalDays';
import { colors } from '../theme/tokens';

function personalIcon(kind: PersonalDayDisplayKind): keyof typeof Feather.glyphMap {
  if (kind === 'parish_feast') return 'home';
  if (kind === 'nameday') return 'user';
  if (kind === 'birthday') return 'gift';
  if (kind === 'repose') return 'sunset';
  if (kind === 'repose_fortieth') return 'bookmark';
  return 'star';
}

function personalColor(kind: PersonalDayDisplayKind, isDark: boolean): string {
  if (kind === 'repose') return isDark ? colors.personalReposeDark : colors.personalRepose;
  if (kind === 'repose_fortieth') {
    return isDark ? colors.personalFortiethDark : colors.personalFortieth;
  }
  if (kind === 'custom_event') return isDark ? colors.personalEventDark : colors.personalEvent;
  if (kind === 'birthday') return isDark ? colors.personalBirthdayDark : colors.personalBirthday;
  return isDark ? colors.feastTextSoftDark : colors.accentWine;
}

type Props = {
  occurrences: readonly PersonalDayOccurrence[];
  isDark: boolean;
  textColor: string;
};

/** Compact chips under the hero when the selected day has personal entries. */
export function TodayPersonalDays({ occurrences, isDark, textColor }: Props) {
  const { t, lang } = useAppTranslation();
  const { text } = useFontScale();
  const labelType = text(12, 16);
  const chipType = text(13, 17);

  if (occurrences.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, labelType, { color: isDark ? '#a39e98' : colors.muted }]}>
        {t('today.personalOnDay')}
      </Text>
      <View style={styles.chips}>
        {occurrences.map((occurrence) => {
          const kind = displayKindForOccurrence(occurrence);
          const tint = personalColor(kind, isDark);
          const label = calendarLabelForOccurrence(occurrence, lang);
          return (
            <View
              key={`${occurrence.day.id}-${occurrence.variant}`}
              style={[
                styles.chip,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(43,38,35,0.05)',
                  borderColor: tint,
                },
              ]}
            >
              <Feather name={personalIcon(kind)} size={13} color={tint} />
              <Text style={[styles.chipLabel, chipType, { color: textColor }]} numberOfLines={1}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
    marginBottom: 10,
    gap: 6,
  },
  heading: {
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: '100%',
  },
  chipLabel: {
    fontWeight: '600',
    flexShrink: 1,
  },
});
