import { StyleSheet, Text, View } from 'react-native';

import { typography } from '../theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  textColor: string;
  mutedColor: string;
};

/** Large in-page title for phone (when the tab nav header is hidden). */
export function PhonePageHeader({ title, subtitle, textColor, mutedColor }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: mutedColor }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  title: {
    ...typography.headline,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
