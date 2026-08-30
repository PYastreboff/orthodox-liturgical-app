import { useAppTranslation } from '../i18n/useAppTranslation';
import type { WorshipServiceId } from '../lib/liturgical/worshipNavigation';
import { SegmentedControl } from './SegmentedControl';

type Props = {
  value: WorshipServiceId;
  onChange: (value: WorshipServiceId) => void;
  isDark: boolean;
  fullWidth?: boolean;
};

export function WorshipServiceToggle({ value, onChange, isDark, fullWidth = false }: Props) {
  const { t } = useAppTranslation();

  return (
    <SegmentedControl<WorshipServiceId>
      value={value}
      onChange={onChange}
      isDark={isDark}
      fullWidth={fullWidth}
      size="regular"
      scrollable={!fullWidth}
      segments={[
        {
          value: 'chrysostom',
          label: t('liturgy.worship.serviceChrysostom'),
          accessibilityLabel: t('liturgy.worship.serviceChrysostom'),
        },
        {
          value: 'basil',
          label: t('liturgy.worship.serviceBasil'),
          accessibilityLabel: t('liturgy.worship.serviceBasil'),
        },
        {
          value: 'vespers',
          label: t('liturgy.worship.serviceVespers'),
          accessibilityLabel: t('liturgy.worship.serviceVespers'),
        },
      ]}
    />
  );
}
