import Svg, { G, Line, Path } from 'react-native-svg';

import { fastingFoodDisplayLabel } from './FastingFoodIcon';
import { HoverAccessible } from './HoverAccessible';
import { translate } from '../i18n/translate';
import { useAppTranslation } from '../i18n/useAppTranslation';

export const CALENDAR_FASTING_FISH_COLOR = '#3d6878';
export const CALENDAR_FASTING_OIL_COLOR = '#b08d57';
export const CALENDAR_FASTING_CROSS_COLOR = '#1a1412';

const FISH_VIEWBOX = '0 0 244.16495 240';
const FISH_VIEWBOX_CX = 244.16495 / 2;
const FISH_VIEWBOX_CY = 240 / 2;
/** Compress width only — same height in the calendar slot, shorter silhouette. */
const FISH_SQUISH_X = 0.75;

const FISH_TAIL_PATH =
  'M14.92701,106.11349c20.45389-15.39068,118.44267-71.36452,211.7862,42.01456.4354.52886,1.29339.23079,1.29339-.45423v-67.96099c0-.70373-.89574-.99968-1.3159-.43514-11.25945,15.12846-93.8409,117.36236-211.67415,32.85306-2.04447-1.46629-2.09991-4.50454-.08954-6.01725Z';

const FISH_BODY_PATH =
  'M227.29874,159.39398c-3.44336,0-6.80371-1.51562-9.07324-4.26855-8.52148-10.35059-17.27441-19.48242-26.24512-27.38965-7.91895,5.54883-16.79883,10.84277-26.57227,15.3291-22.69238,10.41797-46.28125,14.67871-70.11377,12.67383-28.83398-2.42969-58.00049-14.09375-86.68848-34.66895-3.80029-2.72607-6.10107-7.14502-6.1543-11.82227-.05322-4.66406,2.13818-9.12158,5.86133-11.92334h0c6.05859-4.55859,38.61328-27.40527,84.67822-29.48096,23.58154-1.05713,46.70801,3.55957,68.74121,13.73828,10.39453,4.80225,20.55957,10.85742,30.45312,18.13135,14.22266-12.15918,23.20312-23.67334,25.68066-27.00244,3.03418-4.06982,8.29688-5.72656,13.10547-4.13086,4.80566,1.59473,8.03516,6.06885,8.03516,11.1333v67.96143c0,4.93262-3.11816,9.36621-7.75977,11.03223-1.29004.46387-2.62598.6875-3.94824.6875ZM30.23624,109.19525c43.08887,27.82178,85.42871,32.49756,125.99316,13.87646,6.21777-2.85449,12.04395-6.1123,17.44336-9.56934-25.11621-16.99609-51.76709-24.93799-79.69092-23.68164-28.8584,1.30078-51.81836,12.31299-63.74561,19.37451ZM209.45499,113.90033c2.53809,2.31104,5.05664,4.70898,7.55176,7.18896v-14.24805c-2.32812,2.28906-4.84668,4.65625-7.55176,7.05908ZM21.55509,114.89251c-.00488.00391-.00928.00732-.01416.01074l-.00098.00049c.00537-.00342.01025-.00732.01514-.01123Z';

type Props = {
  kind: 'fish' | 'oil' | 'noEating';
  size: number;
};

/** Illustrator export — see assets/calendar-fish.svg */
function FishGlyph({ color }: { color: string }) {
  return (
    <G
      transform={`translate(${FISH_VIEWBOX_CX} ${FISH_VIEWBOX_CY}) scale(${FISH_SQUISH_X} 1) translate(${-FISH_VIEWBOX_CX} ${-FISH_VIEWBOX_CY})`}
    >
      <Path d={FISH_TAIL_PATH} fill={color} />
      <Path d={FISH_BODY_PATH} fill={color} />
    </G>
  );
}

function OilDropGlyph({ color }: { color: string }) {
  return (
    <Path
      d="M12 4.5c-2.8 4.5-4.8 6.8-4.8 9.3a4.8 4.8 0 0 0 9.6 0c0-2.5-2-4.8-4.8-9.3z"
      fill={color}
    />
  );
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

export function CalendarFastingFoodIcon({ kind, size }: Props) {
  const { lang } = useAppTranslation();
  const label =
    kind === 'noEating'
      ? translate(lang, 'fasting.levelNoEating')
      : fastingFoodDisplayLabel(kind, lang);
  const color =
    kind === 'fish'
      ? CALENDAR_FASTING_FISH_COLOR
      : kind === 'oil'
        ? CALENDAR_FASTING_OIL_COLOR
        : CALENDAR_FASTING_CROSS_COLOR;

  return (
    <HoverAccessible label={label} accessibilityRole="image">
      <Svg
        width={size}
        height={size}
        viewBox={kind === 'fish' ? FISH_VIEWBOX : '0 0 24 24'}
      >
        {kind === 'fish' ? <FishGlyph color={color} /> : null}
        {kind === 'oil' ? <OilDropGlyph color={color} /> : null}
        {kind === 'noEating' ? <NoEatingGlyph color={color} /> : null}
      </Svg>
    </HoverAccessible>
  );
}
