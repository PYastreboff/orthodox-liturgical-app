import { StyleSheet, Text, View } from 'react-native';

import { useFontScale } from '../hooks/useFontScale';
import { SectionIcon, type SectionIconName } from './SectionIcon';

type Props = {
  title: string;
  icon: SectionIconName;
  color: string;
  /** Extra space below the title row (e.g. non-collapsible cards). */
  marginBottom?: number;
};

export function SectionTitleRow({ title, icon, color, marginBottom }: Props) {
  const { text } = useFontScale();
  const titleType = text(20, 26);
  return (
    <View style={[styles.row, marginBottom != null ? { marginBottom } : null]}>
      <SectionIcon name={icon} color={color} />
      <Text style={[styles.title, titleType, { color }]} numberOfLines={2}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 8,
  },
  title: {
    flex: 1,
    letterSpacing: 0.2,
    fontWeight: '700',
  },
});
