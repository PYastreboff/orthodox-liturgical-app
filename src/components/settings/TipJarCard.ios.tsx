import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { Product, Purchase } from 'expo-iap';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTranslation } from '../../i18n/useAppTranslation';
import { useVestmentAccent } from '../../state/VestmentAccentContext';
import { TipJarFrame } from './TipJarFrame';

/**
 * Consumable In-App Purchase products — create these in App Store Connect
 * (Features → In-App Purchases → Consumable) with these exact product IDs.
 */
export const TIP_PRODUCT_IDS = [
  'church.orthodox.orthodaily.tip.small',
  'church.orthodox.orthodaily.tip.medium',
  'church.orthodox.orthodaily.tip.large',
] as const;

type ExpoIap = typeof import('expo-iap');

/** Expo Go has no StoreKit bridge; dev/production builds do. */
function loadExpoIap(): ExpoIap | null {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return null;
  try {
    // Lazy so Expo Go never evaluates the native module.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-iap') as ExpoIap;
  } catch {
    return null;
  }
}

type Status = 'idle' | 'purchasing' | 'thanks' | 'error';

/** iOS: tips go through StoreKit (App Store guideline 3.1.1), not PayPal. */
export function TipJarCard() {
  const { t } = useAppTranslation();
  const vestmentAccent = useVestmentAccent();
  const iapRef = useRef<ExpoIap | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [pendingSku, setPendingSku] = useState<string | null>(null);

  useEffect(() => {
    const iap = loadExpoIap();
    iapRef.current = iap;
    if (!iap) return;

    let cancelled = false;
    const tipIds = new Set<string>(TIP_PRODUCT_IDS);

    const updated = iap.purchaseUpdatedListener((purchase: Purchase) => {
      if (!tipIds.has(purchase.productId)) return;
      void iap
        .finishTransaction({ purchase, isConsumable: true })
        .catch(() => undefined)
        .finally(() => {
          if (cancelled) return;
          setPendingSku(null);
          setStatus('thanks');
        });
    });
    const failed = iap.purchaseErrorListener((error) => {
      if (cancelled) return;
      setPendingSku(null);
      setStatus(iap.isUserCancelledError(error) ? 'idle' : 'error');
    });

    void (async () => {
      try {
        await iap.initConnection();
        const result = await iap.fetchProducts({ skus: [...TIP_PRODUCT_IDS], type: 'in-app' });
        if (cancelled) return;
        const list = ((result ?? []) as Product[]).filter((p) => tipIds.has(p.id));
        list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        setProducts(list);
      } catch {
        if (!cancelled) setProducts([]);
      }
    })();

    return () => {
      cancelled = true;
      updated.remove();
      failed.remove();
      void iap.endConnection().catch(() => undefined);
    };
  }, []);

  // No StoreKit (Expo Go) or products not live yet: hide rather than show a dead button.
  if (products.length === 0) return null;

  const buy = (sku: string) => {
    const iap = iapRef.current;
    if (!iap || status === 'purchasing') return;
    setPendingSku(sku);
    setStatus('purchasing');
    iap.requestPurchase({ request: { apple: { sku } }, type: 'in-app' }).catch((error: unknown) => {
      setPendingSku(null);
      setStatus(iap.isUserCancelledError(error) ? 'idle' : 'error');
    });
  };

  const tierLabels = [t('settings.tipSmall'), t('settings.tipMedium'), t('settings.tipLarge')];

  return (
    <TipJarFrame body={t('settings.tipJarBodyIos')}>
      <View style={styles.row}>
        {products.map((product, index) => {
          const busy = pendingSku === product.id;
          const label = tierLabels[index] ?? product.title;
          return (
            <Pressable
              key={product.id}
              onPress={() => buy(product.id)}
              disabled={status === 'purchasing'}
              accessibilityRole="button"
              accessibilityLabel={`${label}, ${product.displayPrice}`}
              accessibilityState={{ busy, disabled: status === 'purchasing' }}
              style={({ pressed }) => [
                styles.tier,
                {
                  backgroundColor: vestmentAccent.accent,
                  opacity: status === 'purchasing' && !busy ? 0.5 : pressed ? 0.85 : 1,
                },
              ]}
            >
              {busy ? (
                <ActivityIndicator size="small" color={vestmentAccent.onAccent} />
              ) : (
                <>
                  <Text style={[styles.tierLabel, { color: vestmentAccent.onAccent }]}>{label}</Text>
                  <Text style={[styles.tierPrice, { color: vestmentAccent.onAccent }]}>
                    {product.displayPrice}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
      {status === 'thanks' ? (
        <Text style={[styles.note, { color: vestmentAccent.accent }]} accessibilityLiveRegion="polite">
          {t('settings.tipThanks')}
        </Text>
      ) : null}
      {status === 'error' ? (
        <Text style={[styles.note, { color: vestmentAccent.accent }]} accessibilityLiveRegion="polite">
          {t('settings.tipFailed')}
        </Text>
      ) : null}
    </TipJarFrame>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'stretch',
  },
  tier: {
    flex: 1,
    minHeight: 56,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tierLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  tierPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  note: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
