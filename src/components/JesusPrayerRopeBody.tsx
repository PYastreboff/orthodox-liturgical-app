import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, Vibration } from 'react-native';
import { Feather } from '@expo/vector-icons';

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
  Vibration.vibrate(strong ? 14 : 6);
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
  const [showRope, setShowRope] = useState(false);

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

  const decrement = useCallback(() => {
    setCount((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  const prayerText = prayerParagraphs('jesus', lang)[0] ?? '';
  const complete = count >= target;
  const atDivider = !complete && isDividerCount(count, target);
  const progress = target > 0 ? Math.min(count / target, 1) : 0;
  const accent = isDark ? colors.tabActiveDark : colors.accentWine;
  const track = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(43,38,35,0.08)';
  const knotActive = accent;
  const knotIdle = isDark ? '#3a342c' : '#e8dfd2';
  const dividerIdle = isDark ? '#4a4338' : '#c9b9a4';
  const dividerActive = isDark ? colors.accentGold : colors.accentWine;
  const statusLabel = complete
    ? t('jesusPrayer.complete')
    : atDivider
      ? t('jesusPrayer.dividerLabel')
      : t('jesusPrayer.countLabel');

  return (
    <View style={styles.root}>
      <Text style={[styles.prayerText, bodyType, { color: textColor }]}>{prayerText}</Text>

      <View style={styles.lengthRow}>
        {ROPE_LENGTH_PRESETS.map((preset) => {
          const active = target === preset;
          return (
            <Pressable
              key={preset}
              onPress={() => void selectTarget(preset)}
              disabled={!ready}
              style={({ pressed }) => [
                styles.lengthChip,
                {
                  borderColor: active ? accent : borderColor,
                  backgroundColor: active
                    ? isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(107,45,60,0.08)'
                    : 'transparent',
                  opacity: pressed ? 0.86 : 1,
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
                  text(14, 18),
                  styles.lengthChipText,
                  { color: active ? accent : textColor },
                ]}
              >
                {preset}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={increment}
        style={({ pressed }) => [
          styles.counterCard,
          {
            borderColor: complete || atDivider ? accent : borderColor,
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(43,38,35,0.03)',
            opacity: pressed ? 0.92 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={t('jesusPrayer.tapA11y')}
        accessibilityHint={t('jesusPrayer.tapHint', { current: count, target })}
        {...hoverAccessibilityProps(t('jesusPrayer.tapA11y'), { role: 'button' })}
      >
        <Text style={[hintType, styles.statusLabel, { color: mutedColor }]}>{statusLabel}</Text>
        <Text style={[text(48, 52), styles.countValue, { color: complete || atDivider ? accent : textColor }]}>
          {count}
        </Text>
        <Text style={[hintType, { color: mutedColor }]}>
          {t('jesusPrayer.ofTarget', { target })}
        </Text>

        <View
          style={[styles.progressTrack, { backgroundColor: track }]}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: target, now: count }}
          accessibilityLabel={t('jesusPrayer.progressA11y', { current: count, target })}
        >
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: accent }]} />
        </View>

        <Text style={[text(15, 20), styles.tapHint, { color: accent }]}>
          {t('jesusPrayer.tapButton')}
        </Text>
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          onPress={decrement}
          disabled={count === 0}
          style={({ pressed }) => [styles.actionBtn, { opacity: count === 0 ? 0.4 : pressed ? 0.8 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel={t('jesusPrayer.undo')}
          {...hoverAccessibilityProps(t('jesusPrayer.undo'), { role: 'button' })}
        >
          <Feather name="minus" size={16} color={textColor} />
          <Text style={[text(14, 18), { color: textColor }]}>{t('jesusPrayer.undo')}</Text>
        </Pressable>
        <Pressable
          onPress={reset}
          style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.8 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel={t('jesusPrayer.reset')}
          {...hoverAccessibilityProps(t('jesusPrayer.reset'), { role: 'button' })}
        >
          <Feather name="rotate-ccw" size={16} color={textColor} />
          <Text style={[text(14, 18), { color: textColor }]}>{t('jesusPrayer.reset')}</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => setShowRope((value) => !value)}
        style={({ pressed }) => [styles.ropeToggle, { opacity: pressed ? 0.8 : 1 }]}
        accessibilityRole="button"
        accessibilityState={{ expanded: showRope }}
        accessibilityLabel={showRope ? t('jesusPrayer.hideRope') : t('jesusPrayer.showRope')}
        {...hoverAccessibilityProps(showRope ? t('jesusPrayer.hideRope') : t('jesusPrayer.showRope'), {
          role: 'button',
        })}
      >
        <Text style={[hintType, { color: mutedColor }]}>
          {showRope ? t('jesusPrayer.hideRope') : t('jesusPrayer.showRope')}
        </Text>
        <Feather name={showRope ? 'chevron-up' : 'chevron-down'} size={16} color={mutedColor} />
      </Pressable>

      {showRope ? (
        <PrayerRopeVisual
          length={target}
          count={count}
          isDark={isDark}
          knotActive={knotActive}
          knotIdle={knotIdle}
          dividerActive={dividerActive}
          dividerIdle={dividerIdle}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  prayerText: {
    fontFamily: PRAYER_SERIF,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.92,
  },
  lengthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  lengthChip: {
    minWidth: 56,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  lengthChipText: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  counterCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: {
    textAlign: 'center',
  },
  countValue: {
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  tapHint: {
    marginTop: 6,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  ropeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
});
