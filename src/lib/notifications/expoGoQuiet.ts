import { LogBox } from 'react-native';

/**
 * Expo Go (SDK 53) does not support remote push via expo-notifications and
 * logs a loud warning at import time (on Android it even throws). This app only
 * schedules LOCAL notifications, which still work in Expo Go, so we silence the
 * misleading messages. Import this module BEFORE expo-notifications is loaded.
 */

const EXPO_GO_WARN_MARKERS = [
  'expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go',
  '`expo-notifications` functionality is not fully supported in Expo Go:',
];

LogBox.ignoreLogs(EXPO_GO_WARN_MARKERS);

// LogBox.ignoreLogs only suppresses the in-app overlay; the same warnings would
// still print to the Metro terminal. Patch console.warn before any further
// module executes so expo-notifications' import-time warnings are dropped too.
const originalWarn = console.warn;
console.warn = (...args: Parameters<typeof console.warn>) => {
  const first = typeof args[0] === 'string' ? args[0] : '';
  if (EXPO_GO_WARN_MARKERS.some((marker) => first.includes(marker))) {
    return;
  }
  originalWarn(...args);
};