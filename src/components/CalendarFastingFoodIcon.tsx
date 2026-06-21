import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { fastingFoodDisplayLabel } from './FastingFoodIcon';
import {
  FASTING_ALLOWANCE_ICON_SIZE,
  fastingAllowanceColor,
  fastingNoEatingColor,
} from './fastingAllowanceIcons';
import { FastingFoodIcon } from './FastingFoodIcon';
import { HoverAccessible } from './HoverAccessible';
import { translate } from '../i18n/translate';
import { useAppTranslation } from '../i18n/useAppTranslation';

export {
  FASTING_FISH_COLOR as CALENDAR_FASTING_FISH_COLOR,
  FASTING_WINE_COLOR as CALENDAR_FASTING_WINE_COLOR,
  FASTING_OIL_COLOR as CALENDAR_FASTING_OIL_COLOR,
  FASTING_NO_EATING_COLOR as CALENDAR_FASTING_CROSS_COLOR,
  FASTING_ALLOWANCE_ICON_SIZE,
  CALENDAR_FASTING_ICON_SIZE,
  CALENDAR_FASTING_ICON_GAP,
} from './fastingAllowanceIcons';

type Props = {
  kind: 'fish' | 'wine' | 'oil' | 'noEating';
  size?: number;
  /** Override glyph colour (e.g. light cross on a dark legend background). */
  color?: string;
};

export function calendarFastingFoodIconColor(
  kind: Props['kind'],
  onDarkBackground: boolean,
  foregroundColor = '#f2ebe2',
): string {
  if (kind === 'noEating') return fastingNoEatingColor(onDarkBackground, foregroundColor);
  return fastingAllowanceColor(kind);
}

/** X mark — total fast (no eating). */
function NoEatingGlyph({ color }: { color: string }) {
  return (
    <>
      <Line
        x1={6}
        y1={6}
        x2={18}
        y2={18}
        stroke={color}
        strokeWidth={3.2}
        strokeLinecap="round"
      />
      <Line
        x1={18}
        y1={6}
        x2={6}
        y2={18}
        stroke={color}
        strokeWidth={3.2}
        strokeLinecap="round"
      />
    </>
  );
}

export function CalendarFastingFoodIcon({
  kind,
  size = FASTING_ALLOWANCE_ICON_SIZE,
  color: colorOverride,
}: Props) {
  const { lang } = useAppTranslation();
  const label =
    kind === 'noEating'
      ? translate(lang, 'fasting.levelNoEating')
      : fastingFoodDisplayLabel(kind, lang);
  const color = colorOverride ?? calendarFastingFoodIconColor(kind, false);

  if (kind === 'noEating') {
    return (
      <HoverAccessible label={label} accessibilityRole="image">
        <View style={[styles.iconSlot, { width: size, height: size }]}>
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <NoEatingGlyph color={color} />
          </Svg>
        </View>
      </HoverAccessible>
    );
  }

  return <FastingFoodIcon kind={kind} color={color} size={size} />;
}

const styles = StyleSheet.create({
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
