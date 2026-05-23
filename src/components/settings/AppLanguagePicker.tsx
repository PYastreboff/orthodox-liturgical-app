import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { UiLanguage } from '../../i18n/types';
import { useAppTranslation } from '../../i18n/useAppTranslation';

import { AnimatedSegmentIcon } from './AnimatedSegmentIcon';
import { SegmentedPicker, type SegmentedOption } from './SegmentedPicker';

type Props = {
  value: UiLanguage;
  onChange: (value: UiLanguage) => void;
  isDark: boolean;
};

export function AppLanguagePicker({ value, onChange, isDark }: Props) {
  const { t } = useAppTranslation();
  const options: SegmentedOption<UiLanguage>[] = [
    { id: 'en', label: t('settings.languageEnglish') },
    { id: 'ru', label: t('settings.languageRussian') },
  ];

  return (
    <SegmentedPicker
      options={options}
      value={value}
      onChange={onChange}
      isDark={isDark}
      optionStyle="row"
      renderLeading={(option, { inactiveColor, index, progress }) => (
        <AnimatedSegmentIcon
          index={index}
          progress={progress}
          inactiveColor={inactiveColor}
          accessibilityLabel={option.id === 'en' ? 'English' : 'Русский'}
          renderIcon={(color) => (
            <MaterialCommunityIcons
              name={option.id === 'en' ? 'alphabet-latin' : 'alphabet-cyrillic'}
              size={18}
              color={color}
            />
          )}
        />
      )}
    />
  );
}
