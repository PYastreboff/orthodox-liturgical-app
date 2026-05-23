import { Feather } from '@expo/vector-icons';

import { useAppTranslation } from '../../i18n/useAppTranslation';
import type { FontScalePreference } from '../../theme/fontScale';

import { AnimatedSegmentIcon } from './AnimatedSegmentIcon';
import { SegmentedPicker, type SegmentedOption } from './SegmentedPicker';

type Props = {
  value: FontScalePreference;
  onChange: (value: FontScalePreference) => void;
  isDark: boolean;
};

const ICON_SIZE = 17;

export function FontScalePicker({ value, onChange, isDark }: Props) {
  const { t } = useAppTranslation();
  const options: SegmentedOption<FontScalePreference>[] = [
    { id: 'small', label: t('settings.fontScaleSmall') },
    { id: 'default', label: t('settings.fontScaleDefault') },
    { id: 'large', label: t('settings.fontScaleLarge') },
  ];

  return (
    <SegmentedPicker
      options={options}
      value={value}
      onChange={onChange}
      isDark={isDark}
      optionStyle="row"
      renderLeading={(option, { inactiveColor, index, progress }) => (
        <FontScaleOptionIcon
          optionId={option.id}
          index={index}
          progress={progress}
          inactiveColor={inactiveColor}
        />
      )}
    />
  );
}

function FontScaleOptionIcon({
  optionId,
  index,
  progress,
  inactiveColor,
}: {
  optionId: FontScalePreference;
  index: number;
  progress: import('react-native-reanimated').SharedValue<number>;
  inactiveColor: string;
}) {
  const { t } = useAppTranslation();
  const labels: Record<FontScalePreference, string> = {
    small: t('settings.fontScaleSmall'),
    default: t('settings.fontScaleDefault'),
    large: t('settings.fontScaleLarge'),
  };

  const iconName =
    optionId === 'small' ? 'minus' : optionId === 'default' ? 'type' : 'plus';

  return (
    <AnimatedSegmentIcon
      index={index}
      progress={progress}
      inactiveColor={inactiveColor}
      size={ICON_SIZE}
      accessibilityLabel={labels[optionId]}
      renderIcon={(color) => <Feather name={iconName} size={ICON_SIZE} color={color} />}
    />
  );
}
