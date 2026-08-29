import { StyleSheet, Text, View } from 'react-native';

import { SPLASH_BACKGROUND } from '../brand/splash';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { getAppVersion } from '../lib/appVersion';
import { OrthoDailyLogo } from './OrthoDailyLogo';

type Props = {
  logoSize?: number;
};

/** Branded launch screen — matches assets/splash.png (wine/gold cross on dark ground). */
export function AppSplashScreen({ logoSize = 148 }: Props) {
  const { t } = useAppTranslation();
  const version = getAppVersion();
  const versionLabel = t('a11y.appVersion', { version });

  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <OrthoDailyLogo size={logoSize} />
      </View>
      <Text style={styles.version} accessibilityLabel={versionLabel}>
        {versionLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SPLASH_BACKGROUND,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  version: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'rgba(232, 210, 160, 0.72)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
});
