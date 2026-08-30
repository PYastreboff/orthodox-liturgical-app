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
import { STACK_CONTENT_MAX_WIDTH } from '../../theme/layout';
import { stackContentColumnStyle } from '../../theme/stackContentColumn';
import { colors } from '../../theme/tokens';
import { useVestmentAccent } from '../../state/VestmentAccentContext';
import { useResolvedColorScheme } from '../../theme/useResolvedColorScheme';
import { Redirect, useRootNavigationState } from 'expo-router';
import Head from 'expo-router/head';

const CONTENT_MAX = STACK_CONTENT_MAX_WIDTH;

type Props = {
  section: TodaySectionId;
};

export function DaySectionPage({ section }: Props) {
  const rootNavigationState = useRootNavigationState();
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
  const pageSubtitle = [model.dashboard.dayTitle, model.gregorianDateLabel]
    .filter((line, index, all) => line && all.indexOf(line) === index)
    .join(' · ');

  const goBack = useStackBack('/(tabs)');

  if (!rootNavigationState?.key) {
    return null;
  }

  if (!isSectionVisibleForRole(section, model.servingRole)) {
    return <Redirect href="/(tabs)" />;
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
              subtitle={pageSubtitle}
              backLabel={t('today.back')}
              onBack={goBack}
              icon={<SectionIcon name={icon} color={iconColor} size={22} />}
              accentSoft={vestmentAccent.accentSoft}
              mutedColor={muted}
            />
            <AppScrollView
              contentContainerStyle={[
                styles.content,
                stackContentColumnStyle({
                  paddingLeft: screenSafe.paddingLeft,
                  paddingRight: screenSafe.paddingRight,
                  phone,
                  maxWidth: CONTENT_MAX,
                }),
                { paddingBottom: insets.bottom + 32 },
              ]}
            >
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
    gap: 0,
  },
  statusError: {
    color: colors.accentWine,
    textAlign: 'center',
    marginTop: 16,
  },
});


