import { forwardRef, useEffect } from 'react';
import { Platform, ScrollView, type ScrollViewProps } from 'react-native';

import { usePhoneLayout } from '../hooks/usePhoneLayout';

const WEB_SCROLL_CLASS = 'app-scroll-view';

function ensureWebScrollbarStyles() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const styleId = 'app-scroll-view-scrollbar';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .${WEB_SCROLL_CLASS} {
      scrollbar-width: thin;
      scrollbar-color: rgba(107, 45, 60, 0.32) rgba(43, 38, 35, 0.04);
    }
    .${WEB_SCROLL_CLASS}[data-color-scheme="dark"] {
      scrollbar-color: rgba(232, 201, 122, 0.28) rgba(255, 255, 255, 0.04);
    }
    .${WEB_SCROLL_CLASS}::-webkit-scrollbar {
      width: 7px;
      height: 7px;
    }
    .${WEB_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${WEB_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(107, 45, 60, 0.34);
      border-radius: 999px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }
    .${WEB_SCROLL_CLASS}[data-color-scheme="dark"]::-webkit-scrollbar-thumb {
      background-color: rgba(232, 201, 122, 0.28);
    }
    .${WEB_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(107, 45, 60, 0.42);
    }
    .${WEB_SCROLL_CLASS}[data-color-scheme="dark"]::-webkit-scrollbar-thumb:hover {
      background-color: rgba(232, 201, 122, 0.34);
    }
  `;
  document.head.appendChild(style);
}

type AppScrollViewProps = ScrollViewProps & {
  colorScheme?: 'light' | 'dark';
};

/**
 * Web ScrollView with a subtle parchment/dark themed scrollbar.
 */
export const AppScrollView = forwardRef<ScrollView, AppScrollViewProps>(
  function AppScrollView(
    {
      showsVerticalScrollIndicator,
      showsHorizontalScrollIndicator,
      style,
      colorScheme,
      ...props
    },
    ref,
  ) {
    const phone = usePhoneLayout();

    useEffect(() => {
      ensureWebScrollbarStyles();
    }, []);

    return (
      <ScrollView
        {...props}
        ref={ref}
        // @ts-expect-error web-only className for scrollbar CSS
        className={WEB_SCROLL_CLASS}
        data-color-scheme={colorScheme}
        style={style}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator ?? !phone}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator ?? !phone}
      />
    );
  },
);
