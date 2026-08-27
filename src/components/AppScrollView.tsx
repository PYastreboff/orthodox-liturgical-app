import { forwardRef } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';

import { usePhoneLayout } from '../hooks/usePhoneLayout';

/**
 * App ScrollView — hides scroll indicators on phone (native + narrow web).
 */
export const AppScrollView = forwardRef<ScrollView, ScrollViewProps>(
  function AppScrollView(
    { showsVerticalScrollIndicator, showsHorizontalScrollIndicator, ...props },
    ref,
  ) {
    const phone = usePhoneLayout();
    return (
      <ScrollView
        {...props}
        ref={ref}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator ?? !phone}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator ?? !phone}
      />
    );
  },
);
