import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { StackScreenHeader } from '../src/components/StackScreenHeader';
import { useLayoutSafeAreaInsets } from '../src/hooks/useLayoutSafeAreaInsets';
import { useScreenSafePadding } from '../src/hooks/useScreenSafePadding';
import { useAppTranslation } from '../src/i18n/useAppTranslation';
import {
  PRIVACY_POLICY_LAST_UPDATED,
  PRIVACY_POLICY_SECTIONS,
} from '../src/lib/legal/privacyPolicy';
import { useResolvedColorScheme } from '../src/theme/useResolvedColorScheme';
import { colors } from '../src/theme/tokens';

export default function PrivacyPolicyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const screenSafe = useScreenSafePadding();
  const insets = useLayoutSafeAreaInsets();
  const muted = isDark ? '#a39e98' : colors.muted;

  return (
    <>
      <Head>
        <title>OrthoDaily - Privacy Policy</title>
        <meta
          name="description"
          content="Privacy Policy for OrthoDaily — how the app stores preferences and loads liturgical data."
        />
      </Head>
      <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
        <StackScreenHeader
          title={t('privacy.title')}
          backLabel={t('privacy.back')}
          onBack={() => (router.canGoBack() ? router.back() : router.replace('/settings'))}
        />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingLeft: screenSafe.paddingLeft,
              paddingRight: screenSafe.paddingRight,
              paddingBottom: insets.bottom + 40,
            },
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
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    paddingTop: 12,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
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
