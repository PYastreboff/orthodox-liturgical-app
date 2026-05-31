import { useCallback } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import Constants from 'expo-constants';
import Head from 'expo-router/head';

import { AppLanguagePicker } from '../../src/components/settings/AppLanguagePicker';
import { BugReportLink } from '../../src/components/settings/BugReportLink';
import { CalendarModePicker } from '../../src/components/settings/CalendarModePicker';
import { SettingsRow } from '../../src/components/settings/SettingsRow';
import { SettingsSection } from '../../src/components/settings/SettingsSection';
import { SettingsSwitch } from '../../src/components/settings/SettingsSwitch';
import { FontScalePicker } from '../../src/components/settings/FontScalePicker';
import { ThemeModePicker } from '../../src/components/settings/ThemeModePicker';
import { useScreenSafePadding } from '../../src/hooks/useScreenSafePadding';
import { useTabBarBottomPadding } from '../../src/hooks/useTabBarBottomPadding';
import { useAppTranslation } from '../../src/i18n/useAppTranslation';
import { usePreferences } from '../../src/state/PreferencesContext';
import { syncWebDocumentTheme } from '../../src/theme/syncWebDocumentTheme';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';
import { colors } from '../../src/theme/tokens';

const LINKEDIN_URL = 'https://www.linkedin.com/in/peter-yastreboff-6a9664313/';
const ORTHOCAL_URL = 'https://orthocal.info/';
const TYPIKON_XML_URL =
  'https://github.com/Mount-Skete/orthodox-typikon-feasts-xml';
const PONOMAR_URL = 'https://www.ponomar.net/';
const GETBIBLE_URL = 'https://getbible.net/v2/';
const OCMA_API_URL = 'https://ocma-api-e9870f.gitlab.io/';

type DataSource = {
  url: string;
  linkKey:
    | 'settings.sourceOrthocalLink'
    | 'settings.sourceTypikonLink'
    | 'settings.sourceRoysterLink'
    | 'settings.sourceGetBibleLink'
    | 'settings.sourceOcmaLink';
  hintKey:
    | 'settings.sourceOrthocalHint'
    | 'settings.sourceTypikonHint'
    | 'settings.sourceRoysterHint'
    | 'settings.sourceGetBibleHint'
    | 'settings.sourceOcmaHint';
};

const LITURGICAL_DATA_SOURCES: DataSource[] = [
  {
    url: ORTHOCAL_URL,
    linkKey: 'settings.sourceOrthocalLink',
    hintKey: 'settings.sourceOrthocalHint',
  },
  {
    url: TYPIKON_XML_URL,
    linkKey: 'settings.sourceTypikonLink',
    hintKey: 'settings.sourceTypikonHint',
  },
  {
    url: PONOMAR_URL,
    linkKey: 'settings.sourceRoysterLink',
    hintKey: 'settings.sourceRoysterHint',
  },
  {
    url: GETBIBLE_URL,
    linkKey: 'settings.sourceGetBibleLink',
    hintKey: 'settings.sourceGetBibleHint',
  },
  {
    url: OCMA_API_URL,
    linkKey: 'settings.sourceOcmaLink',
    hintKey: 'settings.sourceOcmaHint',
  },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const { t } = useAppTranslation();
  const {
    primaryCalendar,
    setPrimaryCalendar,
    colorSchemePreference,
    setColorSchemePreference,
    showVestmentGradient,
    setShowVestmentGradient,
    uiLanguage,
    setUiLanguage,
    fontScale,
    setFontScale,
  } = usePreferences();

  const version = Constants.expoConfig?.version ?? '0.1.0';
  const screenSafe = useScreenSafePadding();
  const scrollBottomPadding = useTabBarBottomPadding();
  const pageBg = theme.colors.background;

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'web') return;
      syncWebDocumentTheme(isDark, pageBg);
      return () => syncWebDocumentTheme(isDark);
    }, [isDark, pageBg]),
  );

  return (
    <>
      <Head>
        <title>{t('tabs.browserTitleSettings')}</title>
      </Head>
      <View style={[styles.page, { backgroundColor: pageBg }]}>
      <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: screenSafe.paddingTop + 20,
          paddingLeft: screenSafe.paddingLeft,
          paddingRight: screenSafe.paddingRight,
          paddingBottom: scrollBottomPadding,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('settings.title')}</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#a39e98' : colors.muted }]}>
          {t('settings.subtitle')}
        </Text>
      </View>

      <SettingsSection
        title={t('settings.appearance')}
        description={t('settings.appearanceHint')}
        isDark={isDark}
      >
        <ThemeModePicker
          value={colorSchemePreference}
          onChange={setColorSchemePreference}
          isDark={isDark}
        />
        <SettingsRow
          label={t('settings.backgroundColour')}
          hint={t('settings.backgroundColourHint')}
          isDark={isDark}
          trailing={
            <SettingsSwitch
              value={showVestmentGradient}
              onValueChange={setShowVestmentGradient}
              isDark={isDark}
              accessibilityLabel={t('settings.backgroundColour')}
            />
          }
        />
      </SettingsSection>

      <SettingsSection
        title={t('settings.textSize')}
        description={t('settings.textSizeHint')}
        isDark={isDark}
      >
        <FontScalePicker value={fontScale} onChange={setFontScale} isDark={isDark} />
      </SettingsSection>

      <SettingsSection
        title={t('settings.liturgicalCalendar')}
        description={t('settings.liturgicalCalendarHint')}
        isDark={isDark}
      >
        <CalendarModePicker
          value={primaryCalendar}
          onChange={setPrimaryCalendar}
          isDark={isDark}
        />
      </SettingsSection>

      <SettingsSection
        title={t('settings.appLanguage')}
        description={t('settings.appLanguageHint')}
        isDark={isDark}
      >
        <AppLanguagePicker value={uiLanguage} onChange={setUiLanguage} isDark={isDark} />
      </SettingsSection>

      <SettingsSection
        title={t('settings.bugReportTitle')}
        description={t('settings.bugReportHint')}
        isDark={isDark}
      >
        <BugReportLink isDark={isDark} />
      </SettingsSection>

      <View style={styles.footer}>
        <Text style={[styles.footerApp, { color: theme.colors.text }]}>OrthoDaily</Text>
        <Text style={[styles.footerMeta, { color: isDark ? '#a39e98' : colors.muted }]}>
          {t('settings.version', { version })}
        </Text>
        <View style={styles.attributionRow}>
          <Text style={[styles.footerCredit, { color: isDark ? '#a39e98' : colors.muted }]}>
            {t('settings.madeBy')}
          </Text>
          <Pressable
            onPress={() => Linking.openURL(LINKEDIN_URL)}
            accessibilityRole="link"
            accessibilityLabel="Peter Y. on LinkedIn"
          >
            <Text style={styles.footerLink}>Peter Y.</Text>
          </Pressable>
        </View>
        <View style={styles.sourcesBlock}>
          <Text style={[styles.sourcesTitle, { color: theme.colors.text }]}>
            {t('settings.dataSourcesTitle')}
          </Text>
          {LITURGICAL_DATA_SOURCES.map((source) => (
            <View key={source.url} style={styles.sourceRow}>
              <Pressable
                onPress={() => Linking.openURL(source.url)}
                accessibilityRole="link"
                accessibilityLabel={t(source.linkKey)}
              >
                <Text style={styles.footerLink}>{t(source.linkKey)}</Text>
              </Pressable>
              <Text style={[styles.sourceHint, { color: isDark ? '#a39e98' : colors.muted }]}>
                {t(source.hintKey)}
              </Text>
            </View>
          ))}
          <Text style={[styles.footerCredit, styles.sourcesNote, { color: isDark ? '#a39e98' : colors.muted }]}>
            {t('settings.dataSourcesNote')}
          </Text>
        </View>
      </View>
    </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
  },
  footer: {
    marginTop: 8,
    paddingTop: 16,
    alignItems: 'center',
  },
  footerApp: {
    fontSize: 15,
    fontWeight: '600',
  },
  footerMeta: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 17,
  },
  attributionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  footerCredit: {
    fontSize: 12,
    lineHeight: 17,
  },
  sourcesBlock: {
    marginTop: 28,
    paddingHorizontal: 8,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  sourcesTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  sourceRow: {
    marginBottom: 10,
    alignItems: 'center',
  },
  sourceHint: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 4,
  },
  sourcesNote: {
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  footerLink: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: colors.accentWine,
    textDecorationLine: 'underline',
  },
});
