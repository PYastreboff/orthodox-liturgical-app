import { Feather } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import Head from 'expo-router/head';
import { StyleSheet, View } from 'react-native';

import { AppScrollView } from '../src/components/AppScrollView';
import { RecipesLibrary } from '../src/components/RecipesLibrary';
import { StackScreenHeader } from '../src/components/StackScreenHeader';
import { SwipeBackShell } from '../src/components/SwipeBackShell';
import { useLayoutSafeAreaInsets } from '../src/hooks/useLayoutSafeAreaInsets';
import { useScreenSafePadding } from '../src/hooks/useScreenSafePadding';
import { useStackBack } from '../src/hooks/useStackBack';
import { useAppTranslation } from '../src/i18n/useAppTranslation';
import { usePhoneLayout } from '../src/hooks/usePhoneLayout';
import { useVestmentAccent } from '../src/state/VestmentAccentContext';
import { stackContentColumnStyle } from '../src/theme/stackContentColumn';
import { useResolvedColorScheme } from '../src/theme/useResolvedColorScheme';
import { colors } from '../src/theme/tokens';

export default function RecipesScreen() {
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
        <title>{t('recipes.browserTitle')}</title>
        <meta name="description" content={t('recipes.pageIntro')} />
      </Head>
      <SwipeBackShell onBack={goBack}>
        <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
          <StackScreenHeader
            title={t('recipes.pageTitle')}
            subtitle={t('recipes.pageIntro')}
            backLabel={t('recipes.back')}
            onBack={goBack}
            icon={<Feather name="book-open" size={22} color={vestmentAccent.accent} />}
            accentSoft={vestmentAccent.accentSoft}
            mutedColor={muted}
            iconPlacement="back"
          />
        <AppScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            stackContentColumnStyle({
              paddingLeft: screenSafe.paddingLeft,
              paddingRight: screenSafe.paddingRight,
              phone,
            }),
            { paddingBottom: insets.bottom + 28 },
          ]}
        >
          <RecipesLibrary
            textColor={theme.colors.text}
            mutedColor={muted}
            borderColor={theme.colors.border}
            isDark={isDark}
            contentBottom={8}
          />
        </AppScrollView>
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
    paddingTop: 8,
  },
});
