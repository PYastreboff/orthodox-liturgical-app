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
  /** Larger list rows for the day section page. */
  variant?: 'chips' | 'list';
  emptyMessage?: string;
  hintMessage?: string;
};

/** Personal-day markers for the selected civil date. */
export function TodayPersonalDays({
  occurrences,
  isDark,
  textColor,
  variant = 'chips',
  emptyMessage,
  hintMessage,
}: Props) {
  const { t, lang } = useAppTranslation();
  const { text } = useFontScale();
  const labelType = text(12, 16);
  const chipType = text(13, 17);
  const bodyType = text(15, 20);
  const hintType = text(13, 18);
  const muted = isDark ? '#a39e98' : colors.muted;

  if (occurrences.length === 0) {
    if (variant !== 'list') return null;
    return (
      <View style={styles.emptyWrap}>
        <Text style={[styles.emptyBody, bodyType, { color: textColor }]}>
          {emptyMessage ?? t('today.noPersonalOnDay')}
        </Text>
        {hintMessage ? (
          <Text style={[styles.emptyHint, hintType, { color: muted }]}>{hintMessage}</Text>
        ) : null}
      </View>
    );
  }

  if (variant === 'list') {
    return (
      <View style={styles.list}>
        {occurrences.map((occurrence) => {
          const kind = displayKindForOccurrence(occurrence);
          const tint = personalColor(kind, isDark);
          const label = calendarLabelForOccurrence(occurrence, lang);
          return (
            <View
              key={`${occurrence.day.id}-${occurrence.variant}`}
              style={[
                styles.listRow,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(43,38,35,0.05)',
                  borderColor: tint,
                },
              ]}
            >
              <View
                style={[
                  styles.listIcon,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(107,45,60,0.1)' },
                ]}
              >
                <Feather name={personalIcon(kind)} size={18} color={tint} />
              </View>
              <Text style={[styles.listLabel, bodyType, { color: textColor }]}>{label}</Text>
            </View>
          );
        })}
        {hintMessage ? (
          <Text style={[styles.emptyHint, hintType, { color: muted }]}>{hintMessage}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, labelType, { color: muted }]}>
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
  list: {
    gap: 10,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listLabel: {
    flex: 1,
    minWidth: 0,
    fontWeight: '600',
  },
  emptyWrap: {
    gap: 8,
  },
  emptyBody: {
    fontWeight: '500',
  },
  emptyHint: {
    marginTop: 4,
  },
});
