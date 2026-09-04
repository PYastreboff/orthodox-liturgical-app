import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { usePreferences } from '../state/PreferencesContext';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';
import { colors } from '../theme/tokens';

const STEPS = ['welcome', 'calendar', 'role', 'notifications'] as const;
type TipStep = (typeof STEPS)[number];

const STEP_ICONS: Record<TipStep, keyof typeof Feather.glyphMap> = {
  welcome: 'book-open',
  calendar: 'calendar',
  role: 'users',
  notifications: 'bell',
};

/**
 * Short first-launch tips after splash — calendar mode, serving role, notifications.
 * Guest-friendly; dismiss persists via PreferencesContext.
 */
export function FirstLaunchTips() {
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const { preferencesReady, onboardingCompleted, setOnboardingCompleted } = usePreferences();
  const { width } = useWindowDimensions();
  const [stepIndex, setStepIndex] = useState(0);

  const visible = preferencesReady && !onboardingCompleted;
  const step = STEPS[stepIndex] ?? 'welcome';
  const isFirst = stepIndex <= 0;
  const isLast = stepIndex >= STEPS.length - 1;

  const copy = useMemo(
    () => ({
      welcome: {
        title: t('onboarding.welcomeTitle'),
        body: t('onboarding.welcomeBody'),
      },
      calendar: {
        title: t('onboarding.calendarTitle'),
        body: t('onboarding.calendarBody'),
      },
      role: {
        title: t('onboarding.roleTitle'),
        body: t('onboarding.roleBody'),
      },
      notifications: {
        title: t('onboarding.notificationsTitle'),
        body: t('onboarding.notificationsBody'),
      },
    }),
    [t],
  );

  const finish = useCallback(() => {
    setOnboardingCompleted(true);
  }, [setOnboardingCompleted]);

  const goPrev = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goNext = useCallback(() => {
    if (isLast) finish();
    else setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }, [finish, isLast]);

  if (!visible) return null;

  const surfaceBg = isDark ? colors.darkSurface : colors.card;
  const textColor = isDark ? colors.darkInk : colors.ink;
  const mutedColor = isDark ? '#a39e98' : colors.muted;
  const borderColor = isDark ? colors.darkBorder : colors.border;
  const iconColor = isDark ? colors.tabActiveDark : colors.accentWine;
  const arrowIdleBg = isDark ? '#2a2420' : '#f0e8dc';
  const sheetMaxWidth = Math.min(420, width - 40);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={finish}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={finish} accessibilityElementsHidden />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: surfaceBg,
              borderColor,
              maxWidth: sheetMaxWidth,
            },
          ]}
        >
          <Text style={[styles.welcome, { color: iconColor }]}>
            {step === 'welcome' ? t('onboarding.welcome') : t('app.name')}
          </Text>

          <View style={[styles.iconWrap, { backgroundColor: arrowIdleBg }]}>
            <Feather name={STEP_ICONS[step]} size={28} color={iconColor} />
          </View>

          <Text style={[styles.kicker, { color: mutedColor }]}>
            {t('onboarding.progress', { current: stepIndex + 1, total: STEPS.length })}
          </Text>
          <Text style={[styles.title, { color: textColor }]}>{copy[step].title}</Text>
          <Text style={[styles.body, { color: mutedColor }]}>{copy[step].body}</Text>

          <View style={styles.dots}>
            {STEPS.map((id, i) => (
              <View
                key={id}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === stepIndex ? colors.accentWine : isDark ? '#4a4440' : '#d4cfc6',
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.navRow}>
            <Pressable
              style={({ pressed }) => [
                styles.arrowBtn,
                { backgroundColor: arrowIdleBg, opacity: isFirst ? 0.35 : pressed ? 0.78 : 1 },
              ]}
              onPress={goPrev}
              disabled={isFirst}
              hitSlop={8}
              {...hoverAccessibilityProps(t('onboarding.prev'), { role: 'button' })}
            >
              <Feather name="chevron-left" size={28} color={iconColor} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.skipBtn, pressed ? styles.pressed : null]}
              onPress={finish}
              {...hoverAccessibilityProps(t('onboarding.skip'), { role: 'button' })}
            >
              <Text style={[styles.skipLabel, { color: mutedColor }]}>{t('onboarding.skip')}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.arrowBtn,
                {
                  backgroundColor: isLast ? colors.accentWine : arrowIdleBg,
                  opacity: pressed ? 0.78 : 1,
                },
              ]}
              onPress={goNext}
              hitSlop={8}
              {...hoverAccessibilityProps(
                isLast ? t('onboarding.done') : t('onboarding.next'),
                { role: 'button' },
              )}
            >
              <Feather
                name={isLast ? 'check' : 'chevron-right'}
                size={isLast ? 24 : 28}
                color={isLast ? '#fff' : iconColor}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 16, 14, 0.55)',
  },
  sheet: {
    width: '100%',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: 'center',
    boxShadow: '0px 10px 24px rgba(0,0,0,0.22)',
  },
  welcome: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 18,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    gap: 12,
  },
  arrowBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.78,
  },
});
