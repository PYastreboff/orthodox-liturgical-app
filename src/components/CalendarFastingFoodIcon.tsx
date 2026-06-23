import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { FastingFoodIcon } from './FastingFoodIcon';
import {
  FASTING_ALLOWANCE_ICON_SIZE,
  fastingAllowanceColor,
  fastingNoEatingColor,
} from './fastingAllowanceIcons';
import { HoverAccessible } from './HoverAccessible';
import { calendarFastingIconLabel } from '../i18n/fastingLabels';
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
  kind: 'fish' | 'wine' | 'oil' | 'noMeat' | 'noEating';
  size?: number;
  /** Override glyph colour (e.g. light cross on a dark legend background). */
  color?: string;
};

const MEAT_ICON_COLOR = '#b02222';
const NO_MEAT_SLASH_COLOR = '#5f1717';

export function calendarFastingFoodIconColor(
  kind: Props['kind'],
  onDarkBackground: boolean,
  foregroundColor = '#f2ebe2',
): string {
  if (kind === 'noEating') return fastingNoEatingColor(onDarkBackground, foregroundColor);
  if (kind === 'noMeat') return MEAT_ICON_COLOR;
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
      : calendarFastingIconLabel(kind, lang);
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

  if (kind === 'noMeat') {
    const meatColor = colorOverride ?? MEAT_ICON_COLOR;
    const slashColor = colorOverride ?? NO_MEAT_SLASH_COLOR;
    return (
      <HoverAccessible label={label} accessibilityRole="image">
        <View style={[styles.iconSlot, { width: size, height: size }]}>
          <View style={[styles.noMeatBase, { width: size, height: size }]}>
            <View style={styles.noMeatGlyphWrap}>
              <Text style={[styles.noMeatM, { color: meatColor }]}>M</Text>
            </View>
          </View>
          <Svg width={size} height={size} viewBox="0 0 24 24" style={styles.noMeatSlash}>
            <Line
              x1={4}
              y1={12}
              x2={20}
              y2={12}
              stroke={slashColor}
              strokeWidth={2.8}
              strokeLinecap="round"
            />
          </Svg>
        </View>
      </HoverAccessible>
    );
  }

  return <FastingFoodIcon kind={kind} color={color} size={size} allowedLabel />;
}

const styles = StyleSheet.create({
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMeatBase: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMeatGlyphWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMeatM: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 17,
  },
  noMeatSlash: {
    position: 'absolute',
  },
});
