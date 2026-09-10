import { Feather } from '@expo/vector-icons';
import { useTheme } from "expo-router/react-navigation";
import Head from 'expo-router/head';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppScrollView } from '../src/components/AppScrollView';
import { EasterCookingLibrary } from '../src/components/EasterCookingLibrary';
import { StackScreenHeader } from '../src/components/StackScreenHeader';
import { SwipeBackShell } from '../src/components/SwipeBackShell';
import { useLayoutSafeAreaInsets } from '../src/hooks/useLayoutSafeAreaInsets';
import { usePhoneLayout } from '../src/hooks/usePhoneLayout';
import { useScreenSafePadding } from '../src/hooks/useScreenSafePadding';
import { useStackBack } from '../src/hooks/useStackBack';
import { useAppTranslation } from '../src/i18n/useAppTranslation';
import { useVestmentAccent } from '../src/state/VestmentAccentContext';
import { stackContentColumnStyle } from '../src/theme/stackContentColumn';
import { useResolvedColorScheme } from '../src/theme/useResolvedColorScheme';
import { colors } from '../src/theme/tokens';

export default function EasterCookingScreen() {
  const theme = useTheme();
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const screenSafe = useScreenSafePadding();
  const insets = useLayoutSafeAreaInsets();
  const phone = usePhoneLayout();
  const muted = isDark ? '#a39e98' : colors.muted;
  const vestmentAccent = useVestmentAccent();
  const goBack = useStackBack('/(tabs)');

  return (
    <>
      <Head>
        <title>{t('easterCooking.browserTitle')}</title>
        <meta name="description" content={t('easterCooking.intro')} />
      </Head>
      <SwipeBackShell onBack={goBack}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
            <AppScrollView
              keyboardShouldPersistTaps="handled"
              style={styles.scroll}
              contentContainerStyle={[
                styles.content,
                stackContentColumnStyle({
                  paddingLeft: screenSafe.paddingLeft,
                  paddingRight: screenSafe.paddingRight,
                  phone,
                }),
                { paddingTop: 16, paddingBottom: insets.bottom + 28 },
              ]}
            >
              <StackScreenHeader
                title={t('easterCooking.pageTitle')}
                subtitle={t('easterCooking.intro')}
                backLabel={t('easterCooking.back')}
                onBack={goBack}
                icon={<Feather name="gift" size={22} color={vestmentAccent.accent} />}
                accentSoft={vestmentAccent.accentSoft}
                mutedColor={muted}
                iconPlacement="back"
              />
              <EasterCookingLibrary
                textColor={theme.colors.text}
                mutedColor={muted}
                borderColor={theme.colors.border}
                isDark={isDark}
                contentBottom={8}
              />
            </AppScrollView>
          </View>
        </SafeAreaView>
      </SwipeBackShell>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {},
});
