import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useOrthodoxLivestreams } from '../hooks/useOrthodoxLivestreams';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { colors } from '../theme/tokens';

const GOARCH_LIVE_BROADCASTS_URL = 'https://www.goarch.org/live-broadcasts';

type Props = {
  textColor: string;
  mutedColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
  hintType: { fontSize: number; lineHeight: number };
};

export function ServiceLivestreamsSection({
  textColor,
  mutedColor,
  isDark,
  bodyType,
  hintType,
}: Props) {
  const { t } = useAppTranslation();
  const livestreams = useOrthodoxLivestreams();
  const pillBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(43,38,35,0.08)';
  const liveDot = isDark ? '#f87171' : colors.accentWine;

  const openStream = (url: string) => {
    void Linking.openURL(url);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <View style={[styles.liveDot, { backgroundColor: liveDot }]} />
          <Text style={[styles.header, hintType, { color: textColor }]}>
            {t('services.livestreams.title')}
          </Text>
        </View>
        <Pressable
          onPress={livestreams.reload}
          accessibilityRole="button"
          accessibilityLabel={t('services.livestreams.refresh')}
          hitSlop={8}
          style={({ pressed }) => [{ opacity: pressed ? 0.65 : 1 }]}
        >
          <Feather name="refresh-cw" size={16} color={mutedColor} />
        </Pressable>
      </View>

      {livestreams.status === 'loading' ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={mutedColor} />
          <Text style={[hintType, { color: mutedColor }]}>{t('services.livestreams.loading')}</Text>
        </View>
      ) : livestreams.streams.length > 0 ? (
        livestreams.streams.map((stream, index) => {
          const label = t(`services.livestreams.channels.${stream.channelId}`);
          const isLast = index === livestreams.streams.length - 1;
          return (
            <Pressable
              key={`${stream.youtubeChannelId}-${stream.videoId}`}
              onPress={() => openStream(stream.watchUrl)}
              style={({ pressed }) => [
                styles.rowBetween,
                isLast ? styles.rowLast : null,
                pressed ? styles.rowPressed : null,
              ]}
              accessibilityRole="button"
              {...hoverAccessibilityProps(
                t('services.livestreams.watchA11y', { name: label }),
                { role: 'button' },
              )}
            >
              <View style={styles.labelCol}>
                <Text style={[bodyType, styles.channelName, { color: textColor }]}>{label}</Text>
                <Text style={[hintType, styles.liveLabel, { color: liveDot }]}>
                  {t('services.livestreams.liveBadge')}
                </Text>
              </View>
              <View style={[styles.watchPill, { backgroundColor: pillBg }]}>
                <Feather name="external-link" size={13} color={textColor} />
                <Text style={[hintType, styles.watchText, { color: textColor }]}>
                  {t('services.livestreams.watch')}
                </Text>
              </View>
            </Pressable>
          );
        })
      ) : (
        <Text style={[hintType, styles.empty, { color: mutedColor }]}>
          {livestreams.status === 'offline'
            ? t('services.livestreams.offline')
            : t('services.livestreams.noneLive')}
        </Text>
      )}

      <Pressable
        onPress={() => openStream(GOARCH_LIVE_BROADCASTS_URL)}
        style={({ pressed }) => [styles.moreLink, pressed ? styles.rowPressed : null]}
        accessibilityRole="link"
        {...hoverAccessibilityProps(t('services.livestreams.moreLink'), { role: 'link' })}
      >
        <Text style={[hintType, styles.moreLinkText, { color: mutedColor }]}>
          {t('services.livestreams.moreLink')}
        </Text>
        <Feather name="external-link" size={14} color={mutedColor} />
      </Pressable>

      <Text style={[hintType, styles.footnote, { color: mutedColor }]}>
        {t('services.livestreams.footnote')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.28)',
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  header: {
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  rowLast: {
    marginBottom: 0,
  },
  rowPressed: {
    opacity: 0.78,
  },
  labelCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  channelName: {
    fontWeight: '600',
  },
  liveLabel: {
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontSize: 11,
    lineHeight: 14,
  },
  watchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    flexShrink: 0,
  },
  watchText: {
    fontWeight: '700',
  },
  empty: {
    paddingVertical: 6,
    opacity: 0.92,
  },
  moreLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  moreLinkText: {
    textDecorationLine: 'underline',
  },
  footnote: {
    marginTop: 10,
    opacity: 0.88,
    lineHeight: 18,
  },
});
