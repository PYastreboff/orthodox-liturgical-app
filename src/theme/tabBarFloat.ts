/** Horizontal inset for the floating tab bar pill. */
export const TAB_BAR_FLOAT_HORIZONTAL_PHONE = 14;
export const TAB_BAR_FLOAT_HORIZONTAL_WEB = 20;

/** Gap between the pill bottom and the screen edge. */
export const TAB_BAR_FLOAT_BOTTOM_GAP_PHONE = 10;
export const TAB_BAR_FLOAT_BOTTOM_GAP_WEB = 14;

export function tabBarFloatInsets(isNativePhone: boolean, bottomInset: number) {
  const horizontal = isNativePhone ? TAB_BAR_FLOAT_HORIZONTAL_PHONE : TAB_BAR_FLOAT_HORIZONTAL_WEB;
  const bottomGap = isNativePhone ? TAB_BAR_FLOAT_BOTTOM_GAP_PHONE : TAB_BAR_FLOAT_BOTTOM_GAP_WEB;
  return {
    horizontal,
    bottomGap,
    hostBottomPad: bottomInset + bottomGap,
  };
}

/** Extra scroll clearance for the floated pill (content + host gap). */
export function tabBarFloatScrollExtra(isNativePhone: boolean): number {
  return isNativePhone ? TAB_BAR_FLOAT_BOTTOM_GAP_PHONE : TAB_BAR_FLOAT_BOTTOM_GAP_WEB;
}
