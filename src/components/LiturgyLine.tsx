import { Platform, StyleSheet, Text } from 'react-native';

import { useAppTranslation } from '../i18n/useAppTranslation';
import { translate } from '../i18n/translate';
import { useFontScale } from '../hooks/useFontScale';
import {
  liturgyRoleLabelKey,
  parseLiturgyLine,
  type LiturgyRole,
  type ParsedLiturgyLine,
} from '../lib/liturgy/parseLiturgyLine';
import type { LiturgyTextLang } from '../lib/liturgy/liturgyViewMode';
import { colors } from '../theme/tokens';

const LITURGY_SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});

type Props = {
  line: string;
  lang: LiturgyTextLang;
  textColor: string;
  mutedColor: string;
  isDark: boolean;
  compact?: boolean;
};

function roleColor(role: LiturgyRole, isDark: boolean) {
  const map: Record<LiturgyRole, string> = {
    priest: isDark ? '#e8c97a' : colors.accentWine,
    deacon: isDark ? '#c9b896' : colors.accentGold,
    choir: isDark ? '#9eb8d9' : colors.accentTheotokos,
    people: isDark ? '#b8b0a6' : colors.muted,
    reader: isDark ? '#b8b0a6' : '#5a5248',
    clergy: isDark ? '#c9a87c' : '#7d5c3a',
    celebrant: isDark ? '#e8c97a' : colors.accentWine,
  };
  return map[role];
}

function roleLabel(
  parsed: ParsedLiturgyLine & { kind: 'role-only' | 'role-speech' },
  lang: LiturgyTextLang,
): string {
  return translate(lang, liturgyRoleLabelKey(parsed.role));
}

export function LiturgyLine({
  line,
  lang,
  textColor,
  mutedColor,
  isDark,
  compact = false,
}: Props) {
  const { t } = useAppTranslation();
  const { text } = useFontScale();
  const parsed = parseLiturgyLine(line, lang);
  const speechType = text(compact ? 13.5 : 14.5, compact ? 20 : 22);
  const rubricType = text(compact ? 11.5 : 12.5, compact ? 17 : 18);
  const headingType = text(compact ? 12 : 13, compact ? 16 : 18);
  const roleType = text(compact ? 10 : 11, compact ? 14 : 16);

  if (!line.trim()) {
    return null;
  }

  switch (parsed.kind) {
    case 'banner':
      return parsed.text ? (
        <Text
          style={[
            styles.banner,
            headingType,
            { color: mutedColor, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(43,38,35,0.05)' },
          ]}
        >
          {parsed.text}
        </Text>
      ) : null;
    case 'heading':
      return (
        <Text style={[styles.heading, headingType, { color: mutedColor, borderColor: mutedColor }]}>
          {parsed.text}
        </Text>
      );
    case 'role-only': {
      const label = roleLabel(parsed, lang);
      const fg = roleColor(parsed.role, isDark);
      return (
        <Text style={[styles.paragraph, speechType, { color: textColor, fontFamily: LITURGY_SERIF }]}>
          <Text style={[styles.roleInline, roleType, { color: fg }]}>{label}</Text>
          {parsed.direction ? (
            <Text style={[styles.directionInline, roleType, { color: fg }]}> ({parsed.direction})</Text>
          ) : null}
        </Text>
      );
    }
    case 'role-speech': {
      const label = roleLabel(parsed, lang);
      const fg = roleColor(parsed.role, isDark);
      return (
        <Text style={[styles.paragraph, speechType, { color: textColor, fontFamily: LITURGY_SERIF }]}>
          <Text style={[styles.roleInline, roleType, { color: fg }]}>
            {label}
            {parsed.direction ? ` (${parsed.direction})` : ''}:{' '}
          </Text>
          {parsed.speech}
        </Text>
      );
    }
    case 'rubric':
      return (
        <Text style={[styles.rubric, rubricType, { color: mutedColor, borderColor: mutedColor }]}>
          {parsed.text}
        </Text>
      );
    case 'devotional':
      if (parsed.variant === 'title') {
        const title = parsed.titleKey ? t(parsed.titleKey) : parsed.text;
        return title ? (
          <Text
            style={[
              styles.devotionalTitle,
              headingType,
              { color: isDark ? '#e8c97a' : colors.accentWine },
            ]}
          >
            {title}
          </Text>
        ) : null;
      }
      return (
        <Text
          style={[
            parsed.variant === 'prayer' ? styles.devotionalPrayer : styles.devotionalCreed,
            speechType,
            { color: textColor, fontFamily: LITURGY_SERIF },
          ]}
        >
          {parsed.text}
        </Text>
      );
    case 'speech':
      return parsed.text ? (
        <Text
          style={[
            styles.paragraph,
            styles.speech,
            speechType,
            { color: textColor, fontFamily: LITURGY_SERIF },
          ]}
        >
          {parsed.text}
        </Text>
      ) : null;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  paragraph: {
    letterSpacing: 0.12,
    marginBottom: 6,
  },
  banner: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 6,
    overflow: 'hidden',
  },
  heading: {
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    opacity: 0.9,
  },
  roleInline: {
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  directionInline: {
    fontStyle: 'italic',
    fontWeight: '600',
    textTransform: 'none',
  },
  speech: {
    letterSpacing: 0.12,
  },
  rubric: {
    fontStyle: 'italic',
    fontWeight: '600',
    opacity: 0.92,
    marginVertical: 4,
    paddingLeft: 10,
    borderLeftWidth: 2,
  },
  devotionalTitle: {
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginTop: 18,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  devotionalCreed: {
    textAlign: 'center',
    letterSpacing: 0.14,
    marginVertical: 8,
    paddingHorizontal: 10,
  },
  devotionalPrayer: {
    textAlign: 'center',
    letterSpacing: 0.14,
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
    lineHeight: 26,
  },
});
