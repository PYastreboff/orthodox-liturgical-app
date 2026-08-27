import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppScrollView } from '../AppScrollView';
import { StackScreenHeader } from '../StackScreenHeader';
import { SectionIcon } from '../SectionIcon';
import { TodaySectionContent } from '../TodaySectionContent';
import { TodaySkeleton } from '../TodaySkeleton';
import { VestmentPageBackground } from '../VestmentPageBackground';
import { useLayoutSafeAreaInsets } from '../../hooks/useLayoutSafeAreaInsets';
import { usePhoneLayout } from '../../hooks/usePhoneLayout';
import { useScreenSafePadding } from '../../hooks/useScreenSafePadding';
import { useSwipeToBack } from '../../hooks/useSwipeToBack';
import { useTodayDayModel } from '../../hooks/useTodayDayModel';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import {
  isSectionVisibleForRole,
  todaySectionIcon,
  todaySectionTitleKey,
  type TodaySectionId,
} from '../../lib/today/todaySections';
import { colors } from '../../theme/tokens';
import { useResolvedColorScheme } from '../../theme/useResolvedColorScheme';
import { useTheme } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useCallback, useEffect } from 'react';

const CONTENT_MAX = 800;

type Props = {
  section: TodaySectionId;
};

export function DaySectionPage({ section }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const screenSafe = useScreenSafePadding();
  const insets = useLayoutSafeAreaInsets();
  const phone = usePhoneLayout();
  const model = useTodayDayModel();
  const title = t(todaySectionTitleKey(section, model.servingRole));
  const icon = todaySectionIcon(section, model.servingRole);
  const iconColor = isDark ? colors.tabActiveDark : colors.accentWine;
  const muted = isDark ? '#a39e98' : colors.muted;

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  }, [router]);

  const { panHandlers, animatedStyle, dimStyle } = useSwipeToBack(goBack);

  useEffect(() => {
    if (!isSectionVisibleForRole(section, model.servingRole)) {
      router.replace('/(tabs)');
    }
  }, [section, model.servingRole, router]);

  if (!isSectionVisibleForRole(section, model.servingRole)) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{`${title} - OrthoDaily`}</title>
      </Head>
      <View style={styles.shell}>
        <Animated.View pointerEvents="none" style={[styles.blurWrap, dimStyle]}>
          <BlurView
            intensity={Platform.OS === 'ios' ? 48 : 70}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
            {...(Platform.OS === 'android'
              ? ({ experimentalBlurMethod: 'dimezisBlurView' } as const)
              : null)}
          />
        </Animated.View>
        <Animated.View style={[styles.page, animatedStyle]} {...panHandlers}>
          <VestmentPageBackground
            appearance={model.appearance}
            gradientEnabled={model.showVestmentGradient}
          >
            <View style={styles.pageInner}>
              <StackScreenHeader
                title={title}
                backLabel={t('today.back')}
                onBack={goBack}
              />
              <AppScrollView
                contentContainerStyle={[
                  styles.content,
                  {
                    paddingLeft: screenSafe.paddingLeft,
                    paddingRight: screenSafe.paddingRight,
                    paddingBottom: insets.bottom + 32,
                    maxWidth: phone ? undefined : CONTENT_MAX,
                  },
                ]}
              >
                <View
                  style={[
                    styles.intro,
                    {
                      backgroundColor: isDark ? colors.darkSurface : colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.introIcon,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(107,45,60,0.1)',
                      },
                    ]}
                  >
                    <SectionIcon name={icon} color={iconColor} size={26} />
                  </View>
                  <View style={styles.introText}>
                    <Text
                      style={[styles.introDay, { color: theme.colors.text }]}
                      numberOfLines={2}
                    >
                      {model.dashboard.dayTitle}
                    </Text>
                    <Text style={[styles.introDate, { color: muted }]} numberOfLines={2}>
                      {model.gregorianDateLabel}
                    </Text>
                  </View>
                </View>

                {model.waitingForDay ? (
                  <TodaySkeleton isDark={isDark} />
                ) : model.error ? (
                  <Text style={[styles.statusError, model.type.status]}>
                    {t('today.offline', { error: model.error })}
                  </Text>
                ) : (
                  <TodaySectionContent section={section} model={model} />
                )}
              </AppScrollView>
            </View>
          </VestmentPageBackground>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  blurWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  page: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  pageInner: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 4,
    gap: 0,
  },
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  introIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  introDay: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  introDate: {
    fontSize: 13,
    lineHeight: 18,
  },
  statusError: {
    color: colors.accentWine,
    textAlign: 'center',
    marginTop: 16,
  },
});
