import { Linking, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAppTranslation } from '../../i18n/useAppTranslation';
import { SUPPORT_URL } from '../../lib/legal/urls';
import { SettingsLinkRow, settingsLinkListInset } from './SettingsLinkRow';

type Props = {
  isDark: boolean;
};

/** Guide + legal links in one Legal-style list. */
export function AboutLinks({ isDark }: Props) {
  const { t } = useAppTranslation();
  const router = useRouter();

  return (
    <View style={settingsLinkListInset}>
      <SettingsLinkRow
        isDark={isDark}
        icon="info"
        label={t('settings.colorsLegendLink')}
        hint={t('settings.colorsLegendLinkHint')}
        onPress={() => router.push('/legend')}
      />
      <SettingsLinkRow
        isDark={isDark}
        icon="shield"
        label={t('settings.privacyPolicyLink')}
        hint={t('settings.privacyPolicyHint')}
        onPress={() => router.push('/privacy')}
        showDivider
      />
      <SettingsLinkRow
        isDark={isDark}
        icon="life-buoy"
        label={t('settings.supportLink')}
        hint={t('settings.supportHint')}
        onPress={() => Linking.openURL(SUPPORT_URL)}
        trailingIcon="external-link"
        showDivider
      />
    </View>
  );
}
