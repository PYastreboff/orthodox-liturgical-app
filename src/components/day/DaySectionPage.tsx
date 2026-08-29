import { StyleSheet, Text, View } from 'react-native';

import { AppScrollView } from '../AppScrollView';
import { StackScreenHeader } from '../StackScreenHeader';
import { SwipeBackShell } from '../SwipeBackShell';
import { SectionIcon } from '../SectionIcon';
import { TodaySectionContent } from '../TodaySectionContent';
import { TodaySkeleton } from '../TodaySkeleton';
import { VestmentPageBackground } from '../VestmentPageBackground';
import { useLayoutSafeAreaInsets } from '../../hooks/useLayoutSafeAreaInsets';
import { usePhoneLayout } from '../../hooks/usePhoneLayout';
import { useScreenSafePadding } from '../../hooks/useScreenSafePadding';
import { useStackBack } from '../../hooks/useStackBack';
import { useTodayDayModel } from '../../hooks/useTodayDayModel';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import {
  isSectionVisibleForRole,
  todaySectionIcon,
  todaySectionTitleKey,
  type TodaySectionId,
} from '../../lib/today/todaySections';
import { SERVING_ROLE_PHRASE_LABEL_KEYS } from '../../lib/liturgical/servingRoles';
import { iconBadgeSurface, surfaceCard } from '../../theme/cards';
import { colors, radii } from '../../theme/tokens';
import { useVestmentAccent } from '../../state/VestmentAccentContext';
import { useResolvedColorScheme } from '../../theme/useResolvedColorScheme';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useEffect } from 'react';

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
  const titleKey = todaySectionTitleKey(section, model.servingRole);
  const title =
    section === 'vestments'
      ? t(titleKey, { role: t(SERVING_ROLE_PHRASE_LABEL_KEYS[model.servingRole]) })
      : t(titleKey);
  const icon = todaySectionIcon(section, model.servingRole);
  const vestmentAccent = useVestmentAccent();
  const iconColor = vestmentAccent.accent;
  const muted = isDark ? '#a39e98' : colors.muted;

  const goBack = useStackBack('/(tabs)');

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
      <SwipeBackShell onBack={goBack} blurReveal>
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
              <View style={[styles.intro, surfaceCard(isDark, { radius: radii.xl })]}>
                <View style={iconBadgeSurface(vestmentAccent.accentSoft)}>
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
      </SwipeBackShell>
    </>
  );
}

const styles = StyleSheet.create({
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
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  introText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  introDay: {
    fontSize: 17,
    fontWeight: '800',
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
