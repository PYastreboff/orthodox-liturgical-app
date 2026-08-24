import { StyleSheet, Text, View } from 'react-native';

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
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.2,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
});
