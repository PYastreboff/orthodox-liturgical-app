import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getActiveUiLanguage, translate } from '../i18n/translate';
import { colors } from '../theme/tokens';

type Props = {
  onRetry: () => void;
};

/**
 * Shown by the root ErrorBoundary. It renders outside every provider (theme,
 * preferences), so it reads the language from `translate` and uses fixed dark colours.
 */
export function AppErrorScreen({ onRetry }: Props) {
  const lang = getActiveUiLanguage();
  return (
    <View style={styles.root} accessibilityRole="alert">
      <Text style={styles.title}>{translate(lang, 'app.crashTitle')}</Text>
      <Text style={styles.body}>{translate(lang, 'app.crashBody')}</Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonLabel}>{translate(lang, 'app.retry')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: colors.ink,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.parchment,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.parchment,
    opacity: 0.8,
    textAlign: 'center',
    maxWidth: 420,
    marginBottom: 28,
  },
  button: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: colors.accentGold,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
});
