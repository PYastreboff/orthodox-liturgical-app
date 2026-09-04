import { Feather } from '@expo/vector-icons';
import { useTheme } from "expo-router/react-navigation";
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { SwipeBackShell } from './SwipeBackShell';
import { useScreenSafePadding } from '../hooks/useScreenSafePadding';
import { useStackBack } from '../hooks/useStackBack';
import type { Href } from 'expo-router';

type Props = {
  fallbackRoute: Href;
  backLabel: string;
  children: ReactNode;
};

/** Full-screen subpage with swipe-back and a simple back row (error / empty states). */
export function SwipeBackMissingPage({ fallbackRoute, backLabel, children }: Props) {
  const theme = useTheme();
  const screenSafe = useScreenSafePadding();
  const goBack = useStackBack(fallbackRoute);

  return (
    <SwipeBackShell onBack={goBack}>
      <View
        style={[
          styles.page,
          {
            backgroundColor: theme.colors.background,
            paddingTop: screenSafe.paddingTop + 12,
            paddingLeft: screenSafe.paddingLeft + 16,
            paddingRight: screenSafe.paddingRight + 16,
          },
        ]}
      >
        <Pressable
          onPress={goBack}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
        >
          <Feather name="chevron-left" size={22} color={theme.colors.text} />
          <Text style={[styles.backLabel, { color: theme.colors.text }]}>{backLabel}</Text>
        </Pressable>
        {children}
      </View>
    </SwipeBackShell>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    gap: 8,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    marginBottom: 20,
  },
  backLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});
