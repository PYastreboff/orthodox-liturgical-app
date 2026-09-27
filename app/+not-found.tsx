import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'expo-router/react-navigation';

import { useAppTranslation } from '../src/i18n/useAppTranslation';
import { useVestmentAccent } from '../src/state/VestmentAccentContext';
import { useResolvedColorScheme } from '../src/theme/useResolvedColorScheme';
import { colors } from '../src/theme/tokens';

export default function NotFoundScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const vestmentAccent = useVestmentAccent();

  return (
    <>
      <Head>
        <title>{t('app.notFoundTitle')}</title>
      </Head>
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]} accessibilityRole="header">
          {t('app.notFoundTitle')}
        </Text>
        <Text style={[styles.body, { color: isDark ? '#a39e98' : colors.muted }]}>
          {t('app.notFoundBody')}
        </Text>
        <Pressable
          onPress={() => router.replace('/')}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: vestmentAccent.accent },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.buttonLabel, { color: vestmentAccent.onAccent }]}>
            {t('app.goHome')}
          </Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 420,
    marginBottom: 28,
  },
  button: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
