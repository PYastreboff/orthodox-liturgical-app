import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppTranslation } from '../../i18n/useAppTranslation';
import type { ColorSchemePreference } from '../../state/PreferencesContext';

import { AnimatedSegmentIcon } from './AnimatedSegmentIcon';
import { SegmentedPicker, type SegmentedOption } from './SegmentedPicker';

type Props = {
  value: ColorSchemePreference;
  onChange: (value: ColorSchemePreference) => void;
  isDark: boolean;
};

export function ThemeModePicker({ value, onChange, isDark }: Props) {
  const { t } = useAppTranslation();
  const options: SegmentedOption<ColorSchemePreference>[] = [
    { id: 'system', label: t('settings.themeSystem') },
    { id: 'light', label: t('settings.themeLight') },
    { id: 'dark', label: t('settings.themeDark') },
  ];

  return (
    <SegmentedPicker
      options={options}
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
  const { t } = useAppTranslation();
  const size = 18;

  if (optionId === 'system') {
    return (
      <AnimatedSegmentIcon
        index={index}
        progress={progress}
        inactiveColor={inactiveColor}
        size={size}
        accessibilityLabel={t('settings.themeSystem')}
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
        accessibilityLabel={t('settings.themeLight')}
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
      accessibilityLabel={t('settings.themeDark')}
      renderIcon={(color) => <Feather name="moon" size={size} color={color} />}
    />
  );
}
