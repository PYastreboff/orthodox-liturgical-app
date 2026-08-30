/** iOS Safari zooms focused inputs when font-size is below 16px. */
const NATIVE_MIN_INPUT_FONT_SIZE = 16;

/** Use on search fields so phone focus does not zoom the page (native + mobile web). */
export function nativeTextInputTypeStyle(type: { fontSize: number; lineHeight: number }) {
  const fontSize = Math.max(type.fontSize, NATIVE_MIN_INPUT_FONT_SIZE);
  const lineHeight = Math.max(type.lineHeight, Math.round(fontSize * 1.25));
  return { fontSize, lineHeight };
}

export const minNativeInputFontSize = NATIVE_MIN_INPUT_FONT_SIZE;
