import type { ViewStyle } from 'react-native';

import { STACK_CONTENT_MAX_WIDTH } from './layout';

/** Centered content column shared by stack headers and scroll bodies on desktop web. */
export function stackContentColumnStyle(options: {
  paddingLeft: number;
  paddingRight: number;
  phone: boolean;
  maxWidth?: number;
}): ViewStyle {
  const { paddingLeft, paddingRight, phone, maxWidth = STACK_CONTENT_MAX_WIDTH } = options;

  return {
    paddingLeft,
    paddingRight,
    width: '100%',
    alignSelf: 'center',
    ...(phone ? null : { maxWidth }),
  };
}
