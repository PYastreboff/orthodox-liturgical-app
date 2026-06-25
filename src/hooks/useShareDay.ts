import { useCallback } from 'react';
import { Platform, Share } from 'react-native';

import { useAppTranslation } from '../i18n/useAppTranslation';
import {
  buildDayShareBody,
  buildDayShareUrl,
  type DayShareTextInput,
} from '../lib/share/dayShareLink';

export function useShareDay() {
  const { t } = useAppTranslation();

  const shareDay = useCallback(
    async (input: DayShareTextInput) => {
      const url = buildDayShareUrl(input.dayIso);
      const body = buildDayShareBody(input, t('app.name'));
      const message = `${body}\n${url}`;

      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.share) {
          try {
            await navigator.share({
              title: t('today.shareDayTitle'),
              text: body,
              url,
            });
            return;
          } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return;
          }
        }
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(message);
          window.alert(t('today.shareDayCopied'));
          return;
        }
        window.prompt(t('today.shareDayCopyPrompt'), message);
        return;
      }

      try {
        await Share.share(
          Platform.OS === 'ios'
            ? { message: body, url, title: t('today.shareDayTitle') }
            : { message, title: t('today.shareDayTitle') },
        );
      } catch {
        // User dismissed — no alert.
      }
    },
    [t],
  );

  return { shareDay };
}
