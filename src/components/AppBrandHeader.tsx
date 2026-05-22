import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { colors } from '../theme/tokens';
import { HoverAccessible } from './HoverAccessible';
import { OrthoDailyLogo } from './OrthoDailyLogo';

export function AppBrandHeader() {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.row}>
      <HoverAccessible label="OrthoDaily Home" accessibilityRole="image">
        <OrthoDailyLogo size={26} />
      </HoverAccessible>
      <Text style={[styles.title, { color: isDark ? colors.darkInk : colors.ink }]}>OrthoDaily Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
