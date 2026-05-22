import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import type { ColorSchemePreference } from '../../state/PreferencesContext';

import { AnimatedSegmentIcon } from './AnimatedSegmentIcon';
import { SegmentedPicker, type SegmentedOption } from './SegmentedPicker';

const OPTIONS: SegmentedOption<ColorSchemePreference>[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

type Props = {
  value: ColorSchemePreference;
  onChange: (value: ColorSchemePreference) => void;
  isDark: boolean;
};

export function ThemeModePicker({ value, onChange, isDark }: Props) {
  return (
    <SegmentedPicker
      options={OPTIONS}
      value={value}
      onChange={onChange}
      isDark={isDark}
      optionStyle="column"
      renderLeading={(option, { inactiveColor, index, progress }) => (
        <ThemeOptionIcon
          optionId={option.id}
          index={index}
          progress={progress}
          inactiveColor={inactiveColor}
        />
      )}
    />
  );
}

function ThemeOptionIcon({
  optionId,
  index,
  progress,
  inactiveColor,
}: {
  optionId: ColorSchemePreference;
  index: number;
  progress: import('react-native-reanimated').SharedValue<number>;
  inactiveColor: string;
}) {
  const size = 18;

  if (optionId === 'system') {
    return (
      <AnimatedSegmentIcon
        index={index}
        progress={progress}
        inactiveColor={inactiveColor}
        size={size}
        renderIcon={(color) => (
          <MaterialCommunityIcons name="theme-light-dark" size={size} color={color} />
        )}
      />
    );
  }

  if (optionId === 'light') {
    return (
      <AnimatedSegmentIcon
        index={index}
        progress={progress}
        inactiveColor={inactiveColor}
        size={size}
        renderIcon={(color) => <Feather name="sun" size={size} color={color} />}
      />
    );
  }

  return (
    <AnimatedSegmentIcon
      index={index}
      progress={progress}
      inactiveColor={inactiveColor}
      size={size}
      renderIcon={(color) => <Feather name="moon" size={size} color={color} />}
    />
  );
}
