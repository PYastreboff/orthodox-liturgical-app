import { StyleSheet, View } from 'react-native';

import { SPLASH_BACKGROUND } from '../brand/splash';
import { OrthoDailyLogo } from './OrthoDailyLogo';

type Props = {
  logoSize?: number;
};

/** Branded launch screen — matches assets/splash.png (wine/gold cross on dark ground). */
export function AppSplashScreen({ logoSize = 148 }: Props) {
  return (
    <View style={styles.root}>
      <OrthoDailyLogo size={logoSize} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SPLASH_BACKGROUND,
  },
});
