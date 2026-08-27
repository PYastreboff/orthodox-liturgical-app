import { useCallback } from 'react';
import { Platform, Share } from 'react-native';

import { useAppTranslation } from '../i18n/useAppTranslation';
import {
  buildRecipeShareBody,
  buildRecipeShareUrl,
  type RecipeShareTextInput,
} from '../lib/share/recipeShareLink';

export function useShareRecipe() {
  const { t } = useAppTranslation();

  const shareRecipe = useCallback(
    async (input: RecipeShareTextInput) => {
      const shareBasePath = input.shareBasePath ?? '/recipes';
      const url = buildRecipeShareUrl(input.recipeId, shareBasePath);
      const body = buildRecipeShareBody(input, t('app.name'));
      const message = `${body}\n${url}`;

      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.share) {
          try {
            await navigator.share({
              title: t('recipes.shareTitle'),
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
          window.alert(t('recipes.shareCopied'));
          return;
        }
        window.prompt(t('recipes.shareCopyPrompt'), message);
        return;
      }

      try {
        await Share.share(
          Platform.OS === 'ios'
            ? { message: body, url, title: t('recipes.shareTitle') }
            : { message, title: t('recipes.shareTitle') },
        );
      } catch {
        // User dismissed — no alert.
      }
    },
    [t],
  );

  return { shareRecipe };
}
