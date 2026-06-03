import type { ReactNode } from 'react';
import {
  ScrollView,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useDocumentScrollWeb } from '../hooks/useDocumentScrollWeb';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, 'style' | 'contentContainerStyle' | 'children'>;
};

/**
 * On iPhone Safari, content flows in the document so html/body scroll (portfolio-style).
 * Elsewhere uses a normal RN ScrollView.
 */
export function ScreenScroll({
  children,
  style,
  contentContainerStyle,
  scrollProps,
}: Props) {
  const documentScroll = useDocumentScrollWeb();

  if (documentScroll) {
    return (
      <View style={[styles.documentFlow, style]}>
        <View style={[styles.documentContent, contentContainerStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      style={style}
      contentContainerStyle={contentContainerStyle}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  );
}

const styles = {
  documentFlow: {
    width: '100%' as const,
    alignSelf: 'stretch' as const,
    flexGrow: 1,
    flexShrink: 0,
    height: 'auto' as const,
  },
  documentContent: {
    width: '100%' as const,
    alignSelf: 'stretch' as const,
  },
};
