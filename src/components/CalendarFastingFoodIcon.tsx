import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { FastingFoodIcon } from './FastingFoodIcon';
import {
  FASTING_ALLOWANCE_ICON_SIZE,
  fastingAllowanceColor,
  fastingNoEatingColor,
} from './fastingAllowanceIcons';
import { HoverAccessible } from './HoverAccessible';
import { NoMeatIcon, FASTING_NO_MEAT_COLOR } from './NoMeatIcon';
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
  /** Override glyph colour (e.g. white on the hero). */
  color?: string;
  /** Override slash colour for `noMeat` (defaults to calendar dark red). */
  slashColor?: string;
};

export function calendarFastingFoodIconColor(
  kind: Props['kind'],
  onDarkBackground: boolean,
  foregroundColor = '#ffffff',
): string {
  if (kind === 'noEating') return fastingNoEatingColor(onDarkBackground, foregroundColor);
  if (kind === 'noMeat') return FASTING_NO_MEAT_COLOR;
  return fastingAllowanceColor(kind);
}

/**
 * Filled X — total fast (no eating).
 * Uses a path fill (not stroked lines) so the mark stays visible on dark UI
 * when react-native-svg stroke colouring is unreliable on web.
 */
function NoEatingGlyph({ color }: { color: string }) {
  return (
    <Path
      fill={color}
      d="M7.05 5.34a1.6 1.6 0 0 0-2.26 2.26L9.74 12l-4.95 4.95a1.6 1.6 0 1 0 2.26 2.26L12 14.26l4.95 4.95a1.6 1.6 0 0 0 2.26-2.26L14.26 12l4.95-4.95a1.6 1.6 0 1 0-2.26-2.26L12 9.74 7.05 5.34z"
    />
  );
}

export function CalendarFastingFoodIcon({
  kind,
  size = FASTING_ALLOWANCE_ICON_SIZE,
  color: colorOverride,
  slashColor,
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
    const meatColor = colorOverride ?? FASTING_NO_MEAT_COLOR;
    return (
      <HoverAccessible label={label} accessibilityRole="image">
        <View style={[styles.iconSlot, { width: size, height: size }]}>
          <NoMeatIcon size={size} color={meatColor} slashColor={slashColor} />
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
});
