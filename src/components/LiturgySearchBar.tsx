import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useAppTranslation } from '../i18n/useAppTranslation';
import type { UiLanguage } from '../i18n/types';
import { radii } from '../theme/tokens';

function searchNoMatchesLabel(language: UiLanguage): string {
  if (language === 'el') return 'Δεν βρέθηκαν αντιστοιχίες';
  if (language === 'ru') return 'Нет совпадений';
  return 'No matches';
}

type Props = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  isDark: boolean;
  hintType: { fontSize: number; lineHeight: number };
  mutedColor: string;
  textColor: string;
  searchMatchCount: number | null;
  activeMatchIndex: number | null;
  onPreviousMatch: () => void;
  onNextMatch: () => void;
  compact?: boolean;
};

/** Compact pinned search row: input, match position, prev/next. */
export function LiturgySearchBar({
  searchQuery,
  onSearchQueryChange,
  isDark,
  hintType,
  mutedColor,
  textColor,
  searchMatchCount,
  activeMatchIndex,
  onPreviousMatch,
  onNextMatch,
  compact = false,
}: Props) {
  const { t, language } = useAppTranslation();
  const navDisabled = !searchMatchCount;
  const showMatchPosition =
    searchMatchCount !== null && searchMatchCount > 0 && activeMatchIndex !== null;

  return (
    <View style={[styles.searchRow, compact && styles.searchRowCompact]}>
      <View style={[styles.searchWrap, compact && styles.searchWrapCompact]}>
        <Feather name="search" size={compact ? 14 : 16} color={mutedColor} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          placeholder={t('liturgy.worship.searchPlaceholder')}
          placeholderTextColor={mutedColor}
          style={[styles.searchInput, compact && styles.searchInputCompact, hintType, { color: textColor }]}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          accessibilityLabel={t('liturgy.worship.searchPlaceholder')}
          {...(Platform.OS === 'web'
            ? {
                onKeyDown: (event: { shiftKey?: boolean; key?: string; preventDefault?: () => void }) => {
                  if (event.key === 'Enter') {
                    event.preventDefault?.();
                    if (event.shiftKey) onPreviousMatch();
                    else onNextMatch();
                  }
                },
              }
            : null)}
        />
        {searchQuery ? (
          <Pressable
            onPress={() => onSearchQueryChange('')}
            accessibilityRole="button"
            accessibilityLabel={t('liturgy.worship.searchClear')}
            hitSlop={8}
          >
            <Feather name="x" size={compact ? 15 : 16} color={mutedColor} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.searchNav}>
        {showMatchPosition ? (
          <Text style={[hintType, styles.searchPosition, { color: mutedColor }]}>
            {t('liturgy.worship.searchMatchPosition', {
              current: activeMatchIndex + 1,
              total: searchMatchCount,
            })}
          </Text>
        ) : searchQuery.trim() ? (
          <Text style={[hintType, styles.searchPosition, { color: mutedColor }]}>
            {searchNoMatchesLabel(language)}
          </Text>
        ) : null}
        <Pressable
          onPress={onPreviousMatch}
          disabled={navDisabled}
          accessibilityRole="button"
          accessibilityLabel={t('liturgy.worship.searchPrevious')}
          style={[styles.searchNavButton, navDisabled && styles.searchNavButtonDisabled]}
          hitSlop={6}
        >
          <Feather name="chevron-up" size={16} color={navDisabled ? mutedColor : textColor} />
        </Pressable>
        <Pressable
          onPress={onNextMatch}
          disabled={navDisabled}
          accessibilityRole="button"
          accessibilityLabel={t('liturgy.worship.searchNext')}
          style={[styles.searchNavButton, navDisabled && styles.searchNavButtonDisabled]}
          hitSlop={6}
        >
          <Feather name="chevron-down" size={16} color={navDisabled ? mutedColor : textColor} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchRowCompact: {
    gap: 6,
  },
  searchWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchWrapCompact: {
    gap: 6,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as 'solid' } : null),
  },
  searchInputCompact: {
    paddingVertical: 0,
  },
  searchNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  searchPosition: {
    minWidth: 44,
    textAlign: 'right',
    lineHeight: 15,
    fontSize: 11,
    opacity: 0.9,
  },
  searchNavButton: {
    padding: 2,
    borderRadius: radii.sm,
    opacity: 0.95,
  },
  searchNavButtonDisabled: {
    opacity: 0.35,
  },
});
