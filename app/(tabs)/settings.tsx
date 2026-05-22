import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Constants from 'expo-constants';

import { CalendarModePicker } from '../../src/components/settings/CalendarModePicker';
import { SettingsRow } from '../../src/components/settings/SettingsRow';
import { SettingsSection } from '../../src/components/settings/SettingsSection';
import { SettingsSwitch } from '../../src/components/settings/SettingsSwitch';
import { ThemeModePicker } from '../../src/components/settings/ThemeModePicker';
import { usePreferences } from '../../src/state/PreferencesContext';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';
import { colors } from '../../src/theme/tokens';

const LINKEDIN_URL = 'https://www.linkedin.com/in/peter-yastreboff-6a9664313/';
const ORTHOCAL_URL = 'https://orthocal.info/';

export default function SettingsScreen() {
  const theme = useTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const {
    showAlternateCalendar,
    setShowAlternateCalendar,
    primaryCalendar,
    setPrimaryCalendar,
    defaultTextLang,
    setDefaultTextLang,
    colorSchemePreference,
    setColorSchemePreference,
  } = usePreferences();

  const version = Constants.expoConfig?.version ?? '0.1.0';
  const alternateLabel =
    primaryCalendar === 'julian' ? 'Show Gregorian alongside' : 'Show Julian alongside';

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#a39e98' : colors.muted }]}>
          Appearance and liturgical display preferences for OrthoDaily.
        </Text>
      </View>

      <SettingsSection
        title="Appearance"
        description="Choose light, dark, or match your device."
        isDark={isDark}
      >
        <ThemeModePicker
          value={colorSchemePreference}
          onChange={setColorSchemePreference}
          isDark={isDark}
        />
      </SettingsSection>

      <SettingsSection
        title="Calendar"
        description="Primary church calendar and optional second date line."
        isDark={isDark}
      >
        <Text style={[styles.fieldLabel, { color: isDark ? '#a39e98' : colors.muted }]}>
          Primary calendar
        </Text>
        <CalendarModePicker
          value={primaryCalendar}
          onChange={setPrimaryCalendar}
          isDark={isDark}
        />
        <SettingsRow
          label={alternateLabel}
          hint="Display the other calendar on Today and the month grid."
          isDark={isDark}
          showDivider={false}
          trailing={
            <SettingsSwitch
              value={showAlternateCalendar}
              onValueChange={setShowAlternateCalendar}
              isDark={isDark}
            />
          }
        />
      </SettingsSection>

      <SettingsSection
        title="Liturgical texts"
        description="Default language order when both are available."
        isDark={isDark}
      >
        <SettingsRow
          label="English first"
          isDark={isDark}
          onPress={() => setDefaultTextLang('en')}
          trailing={
            <SelectionMark selected={defaultTextLang === 'en'} isDark={isDark} />
          }
        />
        <SettingsRow
          label="Church Slavonic first"
          isDark={isDark}
          showDivider={false}
          onPress={() => setDefaultTextLang('chu')}
          trailing={
            <SelectionMark selected={defaultTextLang === 'chu'} isDark={isDark} />
          }
        />
      </SettingsSection>

      <View style={styles.footer}>
        <Text style={[styles.footerApp, { color: theme.colors.text }]}>OrthoDaily</Text>
        <Text style={[styles.footerMeta, { color: isDark ? '#a39e98' : colors.muted }]}>
          Version {version} · Moscow Patriarchate–oriented rubrics
        </Text>
        <View style={styles.attributionRow}>
          <Text style={[styles.footerCredit, { color: isDark ? '#a39e98' : colors.muted }]}>Made by </Text>
          <Pressable
            onPress={() => Linking.openURL(LINKEDIN_URL)}
            accessibilityRole="link"
            accessibilityLabel="Peter Y. on LinkedIn"
          >
            <Text style={styles.footerLink}>Peter Y.</Text>
          </Pressable>
        </View>
        <Text
          style={[styles.footerCredit, styles.attributionBlock, { color: isDark ? '#a39e98' : colors.muted }]}
        >
          Liturgical data from{' '}
          <Text
            style={styles.footerLink}
            onPress={() => Linking.openURL(ORTHOCAL_URL)}
            accessibilityRole="link"
          >
            Orthocal.info
          </Text>
          {' '}(OCA rubrics)
        </Text>
      </View>
    </ScrollView>
  );
}

function SelectionMark({ selected, isDark }: { selected: boolean; isDark: boolean }) {
  if (!selected) {
    return (
      <View
        style={[
          styles.radioOuter,
          { borderColor: isDark ? '#6a6560' : colors.border },
        ]}
      />
    );
  }
  return (
    <View style={[styles.radioOuter, styles.radioOuterActive, { borderColor: colors.accentWine }]}>
      <View style={styles.radioInner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
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
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 2,
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
  attributionBlock: {
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  footerLink: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: colors.accentWine,
    textDecorationLine: 'underline',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    backgroundColor: 'rgba(107, 45, 60, 0.12)',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accentWine,
  },
});
