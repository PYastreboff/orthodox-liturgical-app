import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppTranslation } from '../../i18n/useAppTranslation';
import type { PrimaryCalendar } from '../../lib/calendar/dateDisplay';

import { AnimatedSegmentIcon } from './AnimatedSegmentIcon';
import { SegmentedPicker, type SegmentedOption } from './SegmentedPicker';

type Props = {
  value: PrimaryCalendar;
  onChange: (value: PrimaryCalendar) => void;
  isDark: boolean;
  flush?: boolean;
};

export function CalendarModePicker({ value, onChange, isDark, flush = false }: Props) {
  const { t } = useAppTranslation();
  const options: SegmentedOption<PrimaryCalendar>[] = [
    { id: 'julian', label: t('settings.calendarJulian') },
    { id: 'gregorian', label: t('settings.calendarGregorian') },
  ];

  return (
    <SegmentedPicker
      options={options}
      value={value}
      onChange={onChange}
      isDark={isDark}
      flush={flush}
      optionStyle="row"
      renderLeading={(option, { inactiveColor, index, progress }) => (
        <AnimatedSegmentIcon
          index={index}
          progress={progress}
          inactiveColor={inactiveColor}
          accessibilityLabel={
            option.id === 'julian' ? t('a11y.calendarJulian') : t('a11y.calendarGregorian')
          }
          renderIcon={(color) => (
            <MaterialCommunityIcons
              name={option.id === 'julian' ? 'calendar-month' : 'calendar'}
              size={18}
              color={color}
            />
          )}
        />
      )}
    />
  );
}
