import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { PrimaryCalendar } from '../../lib/calendar/dateDisplay';

import { AnimatedSegmentIcon } from './AnimatedSegmentIcon';
import { SegmentedPicker, type SegmentedOption } from './SegmentedPicker';

const OPTIONS: SegmentedOption<PrimaryCalendar>[] = [
  { id: 'julian', label: 'Julian' },
  { id: 'gregorian', label: 'Gregorian' },
];

type Props = {
  value: PrimaryCalendar;
  onChange: (value: PrimaryCalendar) => void;
  isDark: boolean;
};

export function CalendarModePicker({ value, onChange, isDark }: Props) {
  return (
    <SegmentedPicker
      options={OPTIONS}
      value={value}
      onChange={onChange}
      isDark={isDark}
      optionStyle="row"
      renderLeading={(option, { inactiveColor, index, progress }) => (
        <AnimatedSegmentIcon
          index={index}
          progress={progress}
          inactiveColor={inactiveColor}
          accessibilityLabel={
            option.id === 'julian' ? 'Julian church calendar' : 'Gregorian civil calendar'
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
