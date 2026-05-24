import { useTheme } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import { HoverAccessible } from './HoverAccessible';
import { OrthoDailyLogo } from './OrthoDailyLogo';

export function AppBrandHeader() {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <HoverAccessible label="OrthoDaily Home" accessibilityRole="image">
        <OrthoDailyLogo size={26} />
      </HoverAccessible>
      <Text style={[styles.title, { color: theme.colors.text }]}>OrthoDaily Home</Text>
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
