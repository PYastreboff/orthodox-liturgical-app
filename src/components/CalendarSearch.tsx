import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { CalendarSearchFilter, CalendarSearchResult } from '../lib/liturgical/calendarSearch';
import { intlLocaleForLanguage } from '../i18n/locale';
import { localizeOrthocalText } from '../i18n/orthocalContent';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useCalendarSearch } from '../hooks/useCalendarSearch';
import { usePhoneLayout } from '../hooks/usePhoneLayout';
import type { PrimaryCalendar } from '../lib/calendar/dateDisplay';
import { SECTION_CARD_PADDING, SECTION_CARD_PADDING_PHONE } from '../theme/layout';
import { CommemorationListMarker } from './CommemorationListMarker';
import { colors } from '../theme/tokens';

type Props = {
  calendar: PrimaryCalendar;
  year: number;
  textColor: string;
  mutedColor: string;
  cardBg: string;
  borderColor: string;
  isDark: boolean;
  onSelectDate: (date: Date) => void;
};

const FILTERS: CalendarSearchFilter[] = ['all', 'saint', 'feast'];

function filterLabel(t: (path: string) => string, filter: CalendarSearchFilter): string {
  switch (filter) {
    case 'saint':
      return t('calendar.searchFilterSaints');
    case 'feast':
      return t('calendar.searchFilterFeasts');
    default:
      return t('calendar.searchFilterAll');
  }
}

function kindLabel(t: (path: string) => string, kind: CalendarSearchResult['kind']): string {
  return kind === 'saint' ? t('calendar.searchResultSaint') : t('calendar.searchResultFeast');
}

function formatResultDate(date: Date, intlLocale: string): string {
  return new Intl.DateTimeFormat(intlLocale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function SearchResultRow({
  result,
  intlLocale,
  textColor,
  mutedColor,
  cardBg,
  borderColor,
  onPress,
}: {
  result: CalendarSearchResult;
  intlLocale: string;
  textColor: string;
  mutedColor: string;
  cardBg: string;
  borderColor: string;
  onPress: () => void;
}) {
  const { t, lang } = useAppTranslation();
  const displayName = localizeOrthocalText(result.name, lang);
  const displayDayTitle = localizeOrthocalText(result.dayTitle, lang);
  const lineColor =
    result.kind === 'feast' && result.isGreatFeast
      ? colors.feastBorder
      : result.kind === 'saint'
        ? mutedColor
        : textColor;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.resultRow,
        { backgroundColor: cardBg, borderColor, opacity: pressed ? 0.88 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${formatResultDate(result.date, intlLocale)} — ${displayName}`}
    >
      <View style={styles.resultDateCol}>
        <Text style={[styles.resultDate, { color: textColor }]}>
          {formatResultDate(result.date, intlLocale)}
        </Text>
        <Text style={[styles.resultKind, { color: mutedColor }]}>{kindLabel(t, result.kind)}</Text>
      </View>
      <View style={styles.resultBody}>
        <View style={styles.resultNameRow}>
          <CommemorationListMarker kind={result.kind} color={lineColor} size={13} lineHeight={18} />
          <Text style={[styles.resultName, { color: lineColor }]} numberOfLines={2}>
            {displayName}
          </Text>
        </View>
        {displayName !== displayDayTitle ? (
          <Text style={[styles.resultDayTitle, { color: mutedColor }]} numberOfLines={1}>
            {displayDayTitle}
          </Text>
        ) : null}
      </View>
      <Feather name="chevron-right" size={18} color={mutedColor} />
    </Pressable>
  );
}

export function CalendarSearch({
  calendar,
  year,
  textColor,
  mutedColor,
  cardBg,
  borderColor,
  isDark,
  onSelectDate,
}: Props) {
  const { t, lang } = useAppTranslation();
  const intlLocale = intlLocaleForLanguage(lang);
  const {
    query,
    setQuery,
    filter,
    setFilter,
    results,
    loadingYear,
    showMinCharsHint,
    showNoResults,
    clear,
  } = useCalendarSearch(calendar, year);

  const phoneLayout = usePhoneLayout();
  const wrapPaddingX = phoneLayout ? SECTION_CARD_PADDING_PHONE : SECTION_CARD_PADDING;

  const inputBg = isDark ? colors.darkSurface : colors.card;
  const placeholderColor = mutedColor;

  return (
    <View style={[styles.wrap, { paddingHorizontal: wrapPaddingX }]}>
      <Text style={[styles.label, { color: textColor }]}>{t('calendar.searchTitle')}</Text>
      <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor }]}>
        <Feather name="search" size={18} color={mutedColor} style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('calendar.searchPlaceholder')}
          placeholderTextColor={placeholderColor}
          style={[styles.input, { color: textColor }]}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
          returnKeyType="search"
          accessibilityLabel={t('calendar.searchPlaceholder')}
        />
        {query.length > 0 && Platform.OS !== 'ios' ? (
          <Pressable
            onPress={clear}
            style={styles.clearBtn}
            {...hoverAccessibilityProps(t('calendar.searchClear'), { role: 'button' })}
          >
            <Feather name="x" size={18} color={mutedColor} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((item) => {
          const active = filter === item;
          return (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={[
                styles.filterChip,
                {
                  borderColor: active ? colors.accentWine : borderColor,
                  backgroundColor: active ? colors.accentWine : 'transparent',
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: active ? '#fff' : textColor },
                ]}
              >
                {filterLabel(t, item)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {showMinCharsHint ? (
        <Text style={[styles.hint, { color: mutedColor }]}>{t('calendar.searchMinChars')}</Text>
      ) : null}

      {loadingYear && query.trim().length >= 2 ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.accentWine} />
          <Text style={[styles.hint, { color: mutedColor }]}>{t('calendar.searchLoading')}</Text>
        </View>
      ) : null}

      {showNoResults ? (
        <Text style={[styles.hint, { color: mutedColor }]}>{t('calendar.searchNoResults')}</Text>
      ) : null}

      {results.length > 0 ? (
        <View style={styles.results}>
          {results.map((result) => (
            <SearchResultRow
              key={`${result.iso}-${result.kind}-${result.name}`}
              result={result}
              intlLocale={intlLocale}
              textColor={textColor}
              mutedColor={mutedColor}
              cardBg={cardBg}
              borderColor={borderColor}
              onPress={() => onSelectDate(result.date)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === 'web' ? 10 : 8,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as 'solid' } : null),
  },
  clearBtn: {
    padding: 4,
    marginLeft: 4,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  results: {
    gap: 8,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  resultDateCol: {
    width: 92,
    flexShrink: 0,
  },
  resultDate: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  resultKind: {
    fontSize: 11,
    marginTop: 2,
  },
  resultBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  resultNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  resultName: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  resultDayTitle: {
    fontSize: 12,
    lineHeight: 16,
    paddingLeft: 19,
  },
});
