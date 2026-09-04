import Head from 'expo-router/head';
import { Feather } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from "expo-router/react-navigation";

import { StackScreenHeader } from '../src/components/StackScreenHeader';
import { SwipeBackShell } from '../src/components/SwipeBackShell';
import { useLayoutSafeAreaInsets } from '../src/hooks/useLayoutSafeAreaInsets';
import { usePhoneLayout } from '../src/hooks/usePhoneLayout';
import { useScreenSafePadding } from '../src/hooks/useScreenSafePadding';
import { useStackBack } from '../src/hooks/useStackBack';
import { useAppTranslation } from '../src/i18n/useAppTranslation';
import {
  PRIVACY_POLICY_LAST_UPDATED,
  PRIVACY_POLICY_SECTIONS,
} from '../src/lib/legal/privacyPolicy';
import { useVestmentAccent } from '../src/state/VestmentAccentContext';
import { useResolvedColorScheme } from '../src/theme/useResolvedColorScheme';
import { STACK_CONTENT_NARROW_MAX_WIDTH } from '../src/theme/layout';
import { stackContentColumnStyle } from '../src/theme/stackContentColumn';
import { colors } from '../src/theme/tokens';

export default function PrivacyPolicyScreen() {
  const theme = useTheme();
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const screenSafe = useScreenSafePadding();
  const insets = useLayoutSafeAreaInsets();
  const phone = usePhoneLayout();
  const muted = isDark ? '#a39e98' : colors.muted;
  const vestmentAccent = useVestmentAccent();
  const goBack = useStackBack('/settings');

  return (
    <>
      <Head>
        <title>OrthoDaily - Privacy Policy</title>
        <meta
          name="description"
          content="Privacy Policy for OrthoDaily — how the app stores preferences and loads liturgical data."
        />
      </Head>
      <SwipeBackShell onBack={goBack}>
        <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
          <StackScreenHeader
            title={t('privacy.title')}
            subtitle={t('privacy.intro')}
            backLabel={t('privacy.back')}
            onBack={goBack}
            icon={<Feather name="shield" size={22} color={vestmentAccent.accent} />}
            accentSoft={vestmentAccent.accentSoft}
            mutedColor={muted}
            contentMaxWidth={STACK_CONTENT_NARROW_MAX_WIDTH}
            iconPlacement="back"
          />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            stackContentColumnStyle({
              paddingLeft: screenSafe.paddingLeft,
              paddingRight: screenSafe.paddingRight,
              phone,
              maxWidth: STACK_CONTENT_NARROW_MAX_WIDTH,
            }),
            { paddingBottom: insets.bottom + 40 },
          ]}
        >
          <Text style={[styles.updated, { color: muted }]}>
            {t('privacy.lastUpdated', { date: PRIVACY_POLICY_LAST_UPDATED })}
          </Text>
          <Text style={[styles.intro, { color: muted }]}>{t('privacy.intro')}</Text>
          {PRIVACY_POLICY_SECTIONS.map((section) => (
            <View key={section.heading} style={styles.section}>
              <Text style={[styles.heading, { color: theme.colors.text }]}>{section.heading}</Text>
              {section.paragraphs.map((paragraph) => (
                <Text key={paragraph.slice(0, 48)} style={[styles.body, { color: theme.colors.text }]}>
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}
        </ScrollView>
        </View>
      </SwipeBackShell>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    paddingTop: 12,
  },
  updated: {
    fontSize: 13,
    marginBottom: 10,
  },
  intro: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 22,
  },
  section: {
    marginBottom: 22,
    gap: 8,
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.96,
  },
});
