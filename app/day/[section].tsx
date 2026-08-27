import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { DaySectionPage } from '../../src/components/day/DaySectionPage';
import {
  isSectionVisibleForRole,
  isTodaySectionId,
} from '../../src/lib/today/todaySections';
import { usePreferences } from '../../src/state/PreferencesContext';

export default function DaySectionScreen() {
  const router = useRouter();
  const { servingRole } = usePreferences();
  const params = useLocalSearchParams<{ section?: string | string[] }>();
  const raw = Array.isArray(params.section) ? params.section[0] : params.section;
  const section = raw && isTodaySectionId(raw) ? raw : null;

  useEffect(() => {
    if (!section || !isSectionVisibleForRole(section, servingRole)) {
      router.replace('/(tabs)');
    }
  }, [section, servingRole, router]);

  if (!section || !isSectionVisibleForRole(section, servingRole)) {
    return null;
  }

  return <DaySectionPage section={section} />;
}
