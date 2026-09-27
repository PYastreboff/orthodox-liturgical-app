import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTranslation } from '../../i18n/useAppTranslation';
import { DONATION_URL } from '../../lib/legal/urls';
import { PAYPAL_BUTTON_BLUE, PAYPAL_BUTTON_BLUE_PRESSED, PayPalMark } from '../PayPalLogo';
import { TipJarFrame } from './TipJarFrame';

/** Android & web: voluntary tip via PayPal.me. iOS uses StoreKit (TipJarCard.ios.tsx). */
export function TipJarCard() {
  const { t } = useAppTranslation();

  return (
    <TipJarFrame body={t('settings.tipJarBody')}>
      <Pressable
        onPress={() => void Linking.openURL(DONATION_URL)}
        accessibilityRole="link"
        accessibilityLabel={t('settings.tipJarButton')}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed ? PAYPAL_BUTTON_BLUE_PRESSED : PAYPAL_BUTTON_BLUE,
            opacity: pressed ? 0.96 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View style={styles.markChip}>
          <PayPalMark height={14} />
        </View>
        <Text style={styles.label}>{t('settings.tipJarButton')}</Text>
      </Pressable>
    </TipJarFrame>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 200,
    boxShadow: '0px 2px 4px rgba(0,48,135,0.18)',
  },
  markChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
