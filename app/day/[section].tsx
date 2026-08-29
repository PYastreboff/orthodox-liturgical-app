import { Redirect, useLocalSearchParams, useRootNavigationState } from 'expo-router';

import { DaySectionPage } from '../../src/components/day/DaySectionPage';
import {
  isSectionVisibleForRole,
  isTodaySectionId,
} from '../../src/lib/today/todaySections';
import { usePreferences } from '../../src/state/PreferencesContext';

export default function DaySectionScreen() {
  const rootNavigationState = useRootNavigationState();
  const { servingRole } = usePreferences();
  const params = useLocalSearchParams<{ section?: string | string[] }>();
  const raw = Array.isArray(params.section) ? params.section[0] : params.section;
  const section = raw && isTodaySectionId(raw) ? raw : null;
  const invalid = !section || !isSectionVisibleForRole(section, servingRole);

  if (!rootNavigationState?.key) {
    return null;
  }

  if (invalid) {
    return <Redirect href="/(tabs)" />;
  }

  return <DaySectionPage section={section} />;
}
