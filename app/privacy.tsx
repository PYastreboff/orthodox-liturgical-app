import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

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
        <title>OrthoDaily – Privacy Policy</title>
        <meta
          name="description"
          content="Privacy Policy for OrthoDaily — how the app stores preferences and loads liturgical data."
        />
      </Head>
      <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
        <View
          style={[
            styles.topBar,
            {
              paddingTop: screenSafe.paddingTop + 8,
              paddingLeft: screenSafe.paddingLeft,
              paddingRight: screenSafe.paddingRight,
              borderBottomColor: isDark ? colors.darkBorder : colors.border,
            },
          ]}
        >
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/settings'))}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel={t('privacy.back')}
          >
            <Feather name="chevron-left" size={22} color={theme.colors.text} />
            <Text style={[styles.backLabel, { color: theme.colors.text }]}>{t('privacy.back')}</Text>
          </Pressable>
        </View>
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
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('privacy.title')}</Text>
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
  topBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    paddingVertical: 4,
    paddingRight: 8,
  },
  backLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    paddingTop: 20,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 8,
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
