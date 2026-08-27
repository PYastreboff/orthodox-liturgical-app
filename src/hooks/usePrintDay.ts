import { useCallback } from 'react';

import { useAppTranslation } from '../i18n/useAppTranslation';
import {
  printOrShareDaySheet,
  type PrintDayInput,
} from '../lib/print/printDay';

export function usePrintDay() {
  const { lang } = useAppTranslation();

  const printDay = useCallback(
    async (input: Omit<PrintDayInput, 'lang'>) => {
      await printOrShareDaySheet({ ...input, lang });
    },
    [lang],
  );

  return { printDay };
}
