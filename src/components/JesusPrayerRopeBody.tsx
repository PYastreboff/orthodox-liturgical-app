import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, Vibration } from 'react-native';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { useFontScale } from '../hooks/useFontScale';
import {
  isDividerCount,
  normalizeRopeLength,
  ROPE_LENGTH_PRESETS,
  type RopeLength,
} from '../lib/prayers/jesusPrayerRope';
import { prayerParagraphs } from '../lib/prayers/prayers';
import { colors } from '../theme/tokens';
import { PrayerRopeVisual } from './PrayerRopeVisual';

const TARGET_STORAGE_KEY = '@orthoDaily/jesusPrayerTarget';

type Props = {
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
  hintType: { fontSize: number; lineHeight: number };
};

const PRAYER_SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});

function pulse(strong = false) {
  if (Platform.OS === 'web') return;
  Vibration.vibrate(strong ? 16 : 8);
}

export function JesusPrayerRopeBody({
  textColor,
  mutedColor,
  borderColor,
  isDark,
  bodyType,
  hintType,
}: Props) {
  const { t, lang } = useAppTranslation();
  const { text } = useFontScale();
  const [target, setTarget] = useState<RopeLength>(100);
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const stored = await AsyncStorage.getItem(TARGET_STORAGE_KEY);
        if (cancelled) return;
        const parsed = stored ? Number.parseInt(stored, 10) : NaN;
        setTarget(normalizeRopeLength(parsed));
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectTarget = useCallback(async (value: RopeLength) => {
    setTarget(value);
    setCount(0);
    await AsyncStorage.setItem(TARGET_STORAGE_KEY, String(value));
  }, []);

  const increment = useCallback(() => {
    setCount((prev) => {
      const next = prev + 1;
      if (next >= target) pulse(true);
      else if (isDividerCount(next, target)) pulse(true);
      else pulse();
      return next;
    });
  }, [target]);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  const prayerText = prayerParagraphs('jesus', lang)[0] ?? '';
  const complete = count >= target;
  const atDivider = !complete && isDividerCount(count, target);
  const cardBg = isDark ? colors.darkSurface : colors.card;
  const accent = isDark ? colors.tabActiveDark : colors.accentWine;
  const knotActive = accent;
  const knotIdle = isDark ? '#3a342c' : '#e8dfd2';
  const dividerIdle = isDark ? '#4a4338' : '#c9b9a4';
  const dividerActive = isDark ? colors.accentGold : colors.accentWine;

  return (
    <View style={styles.root}>
      <Text style={[styles.intro, hintType, { color: mutedColor }]}>
        {t('jesusPrayer.intro')}
      </Text>

      <View style={[styles.prayerCard, { backgroundColor: cardBg, borderColor }]}>
        <Text style={[styles.prayerLabel, hintType, { color: mutedColor }]}>
          {t('jesusPrayer.prayerLabel')}
        </Text>
        <Text style={[styles.prayerText, bodyType, { color: textColor }]}>{prayerText}</Text>
      </View>

      <View style={styles.targetRow}>
        <Text style={[styles.targetHeading, hintType, { color: mutedColor }]}>
          {t('jesusPrayer.targetLabel')}
        </Text>
        <View style={styles.targetChips}>
          {ROPE_LENGTH_PRESETS.map((preset) => {
            const active = target === preset;
            return (
              <Pressable
                key={preset}
                onPress={() => void selectTarget(preset)}
                disabled={!ready}
                style={({ pressed }) => [
                  styles.targetChip,
                  {
                    backgroundColor: active ? accent : cardBg,
                    borderColor: active ? accent : borderColor,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t('jesusPrayer.targetA11y', { count: preset })}
                {...hoverAccessibilityProps(t('jesusPrayer.targetA11y', { count: preset }), {
                  role: 'button',
                })}
              >
                <Text
                  style={[
                    styles.targetChipText,
                    text(13, 16),
                    { color: active ? (isDark ? colors.darkBg : '#fff') : textColor },
                  ]}
                >
                  {preset}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={increment}
        style={({ pressed }) => [
          styles.counterTap,
          {
            backgroundColor: cardBg,
            borderColor: complete || atDivider ? accent : borderColor,
            opacity: pressed ? 0.94 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={t('jesusPrayer.tapA11y')}
        accessibilityHint={t('jesusPrayer.tapHint', { current: count, target })}
        {...hoverAccessibilityProps(t('jesusPrayer.tapA11y'), { role: 'button' })}
      >
        <Text style={[styles.countLabel, hintType, { color: mutedColor }]}>
          {complete
            ? t('jesusPrayer.complete')
            : atDivider
              ? t('jesusPrayer.dividerLabel')
              : t('jesusPrayer.countLabel')}
        </Text>
        <Text style={[styles.countValue, text(56, 60), { color: complete || atDivider ? accent : textColor }]}>
          {count}
        </Text>
        <Text style={[styles.countOf, hintType, { color: mutedColor }]}>
          {t('jesusPrayer.ofTarget', { target })}
        </Text>

        <PrayerRopeVisual
          length={target}
          count={count}
          isDark={isDark}
          knotActive={knotActive}
          knotIdle={knotIdle}
          dividerActive={dividerActive}
          dividerIdle={dividerIdle}
        />
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          onPress={reset}
          style={({ pressed }) => [
            styles.resetBtn,
            { borderColor, opacity: pressed ? 0.88 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('jesusPrayer.reset')}
          {...hoverAccessibilityProps(t('jesusPrayer.reset'), { role: 'button' })}
        >
          <Text style={[styles.resetText, text(14, 18), { color: textColor }]}>
            {t('jesusPrayer.reset')}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.tip, hintType, { color: mutedColor }]}>{t('jesusPrayer.tip')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  intro: {
    textAlign: 'center',
  },
  prayerCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 8,
  },
  prayerLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
    fontSize: 11,
  },
  prayerText: {
    fontFamily: PRAYER_SERIF,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  targetRow: {
    gap: 8,
  },
  targetHeading: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
  },
  targetChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  targetChip: {
    minWidth: 52,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  targetChipText: {
    fontWeight: '700',
  },
  counterTap: {
    borderRadius: 20,
    borderWidth: 1.5,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 4,
  },
  countLabel: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 11,
    textAlign: 'center',
  },
  countValue: {
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  countOf: {},
  actions: {
    alignItems: 'center',
  },
  resetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  resetText: {
    fontWeight: '600',
  },
  tip: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
