import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';

import { useAppTranslation } from '../i18n/useAppTranslation';
import { colors } from '../theme/tokens';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';

type Props = {
  message: string;
  onRetry?: () => void;
  textStyle?: StyleProp<TextStyle>;
};

/** Localized "couldn't load" line with a retry action, readable in both colour schemes. */
export function OfflineNotice({ message, onRetry, textStyle }: Props) {
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const color = isDark ? colors.feastTextSoftDark : colors.accentWine;

  return (
    <View style={styles.root} accessibilityLiveRegion="polite">
      <Text style={[styles.message, textStyle, { color }]}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.retry, { borderColor: color }, pressed && styles.pressed]}
        >
          <Text style={[styles.retryLabel, textStyle, { color }]}>{t('app.retry')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: 10,
    marginVertical: 12,
  },
  message: {
    textAlign: 'center',
  },
  retry: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  retryLabel: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
