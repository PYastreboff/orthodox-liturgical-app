import { Platform } from 'react-native';

/** iOS zooms focused inputs when font-size is below 16px. */
const NATIVE_MIN_INPUT_FONT_SIZE = 16;

/** Use on worship/recipe search fields so phone focus does not zoom the page. */
export function nativeTextInputTypeStyle(type: { fontSize: number; lineHeight: number }) {
  if (Platform.OS === 'web') return type;

  const fontSize = Math.max(type.fontSize, NATIVE_MIN_INPUT_FONT_SIZE);
  const lineHeight = Math.max(type.lineHeight, Math.round(fontSize * 1.25));
  return { fontSize, lineHeight };
}
