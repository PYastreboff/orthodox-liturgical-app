import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { colors } from '../../src/theme/tokens';
import { usePreferences } from '../../src/state/PreferencesContext';

export default function SettingsScreen() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { showGregorianAlongside, setShowGregorianAlongside, defaultTextLang, setDefaultTextLang } =
    usePreferences();

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.muted }]}>Calendar display</Text>
        <Pressable
          style={styles.row}
          onPress={() => setShowGregorianAlongside(!showGregorianAlongside)}
        >
          <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
            Show Gregorian alongside Julian
          </Text>
          <Text style={styles.rowValue}>{showGregorianAlongside ? 'On' : 'Off'}</Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.muted }]}>Default texts</Text>
        <Pressable style={styles.row} onPress={() => setDefaultTextLang('en')}>
          <Text style={[styles.rowLabel, { color: theme.colors.text }]}>English first</Text>
          <Text style={styles.rowValue}>{defaultTextLang === 'en' ? '✓' : ''}</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => setDefaultTextLang('chu')}>
          <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Church Slavonic first</Text>
          <Text style={styles.rowValue}>{defaultTextLang === 'chu' ? '✓' : ''}</Text>
        </Pressable>
      </View>

      <Text style={[styles.footnote, { color: isDark ? '#a39e98' : colors.muted }]}>
        System dark mode follows the device. Altar-specific always-dark can be a separate toggle once
        you add persisted preferences (for example AsyncStorage or expo-secure-store).
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowLabel: {
    fontSize: 16,
    flex: 1,
    paddingRight: 12,
  },
  rowValue: {
    fontSize: 16,
    color: colors.accentWine,
    fontWeight: '600',
  },
  footnote: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },
});
