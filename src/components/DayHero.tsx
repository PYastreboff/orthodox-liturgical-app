import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import {
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { feastRankHeroLabelForMajorFeastDay } from '../i18n/feastRank';
import { useFontScale } from '../hooks/useFontScale';
import { usePhoneLayout } from '../hooks/usePhoneLayout';
import { useAppTranslation } from '../i18n/useAppTranslation';
import type { LiturgicalDayAppearance } from '../lib/calendar/dayAppearance';
import type { HeroFastChipDisplay } from '../i18n/fastingLabels';
import { vestmentHeroGradient } from '../lib/liturgical/vestmentGradient';
import {
  SERVING_ROLE_ICON_NAMES,
  SERVING_ROLE_IDS,
  SERVING_ROLE_LABEL_KEYS,
} from '../lib/liturgical/servingRoles';
import { isRedTypikonRank, typikonIconColor, type FeastRankDisplay } from '../lib/liturgical/typikonSymbols';
import type { ClergyRole } from '../types/liturgical';
import { colors } from '../theme/tokens';
import { useLiturgicalVestmentAccent } from '../state/VestmentAccentContext';
import { cardElevation } from '../theme/cards';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';
import { SECTION_CARD_PADDING, SECTION_CARD_PADDING_PHONE } from '../theme/layout';
import { FastingFoodIcon } from './FastingFoodIcon';
import { CalendarFastingFoodIcon } from './CalendarFastingFoodIcon';
import { TypikonSymbol } from './TypikonSymbol';

const ROLE_MENU_ITEM_PRESSED = 'rgba(139,46,60,0.22)';

type Props = {
  appearance: LiturgicalDayAppearance;
  dayTitle: string;
  dateLabel: string;
  julianDateLabel?: string | null;
  toneLabel: string;
  feastRank: FeastRankDisplay;
  heroFastChip?: HeroFastChipDisplay;
  showFeastRankChip?: boolean;
  isMajorFeastDay?: boolean;
  orthocalFeastLevel?: number;
  servingRole: ClergyRole;
  onServingRoleChange: (role: ClergyRole) => void;
  canGoToToday: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onShare?: () => void;
};

export function DayHero({
  appearance,
  dayTitle,
  dateLabel,
  julianDateLabel,
  toneLabel,
  feastRank,
  heroFastChip,
  showFeastRankChip = true,
  isMajorFeastDay = false,
  orthocalFeastLevel,
  servingRole,
  onServingRoleChange,
  canGoToToday,
  onPrevious,
  onNext,
  onToday,
  onShare,
}: Props) {
  const { t, lang } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const vestmentAccent = useLiturgicalVestmentAccent();
  const phoneLayout = usePhoneLayout();
  const heroPaddingX = phoneLayout ? SECTION_CARD_PADDING_PHONE : SECTION_CARD_PADDING;
  const { text } = useFontScale();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [roleMenuPos, setRoleMenuPos] = useState({ top: 0, left: 0 });
  const roleBtnRef = useRef<View>(null);
  const heroStyle = useMemo(
    () => vestmentHeroGradient(appearance, isDark),
    [appearance.key, appearance.label, isDark],
  );
  const fg = heroStyle.foreground;
  const fgLower = fg.toLowerCase();
  const darkHeroSurface =
    fgLower === '#ffffff' ||
    fgLower === '#f7eef8' ||
    fgLower === '#e8eef8' ||
    fgLower === '#f2ebe2' ||
    fgLower === colors.darkInk.toLowerCase();
  const lightHeroBackground = fgLower === '#1e1a16' || fgLower === colors.ink.toLowerCase();
  const chipBg = darkHeroSurface
    ? 'rgba(255,255,255,0.22)'
    : lightHeroBackground
      ? 'rgba(255,255,255,0.14)'
      : isDark
        ? 'rgba(255,255,255,0.1)'
        : 'rgba(255,255,255,0.65)';
  const navBtnBg = darkHeroSurface
    ? 'rgba(255,255,255,0.22)'
    : lightHeroBackground
      ? 'rgba(255,255,255,0.14)'
      : 'rgba(255,255,255,0.22)';
  const todayBtnBg = isDark
    ? darkHeroSurface
      ? 'rgba(255,255,255,0.16)'
      : 'rgba(30,26,22,0.55)'
    : darkHeroSurface
      ? 'rgba(255,255,255,0.92)'
      : vestmentAccent.accent;
  const todayBtnFg = isDark ? fg : darkHeroSurface ? colors.ink : vestmentAccent.onAccent;
  const dayTitleType = text(26, 38);
  const primaryDateType = text(17, 22);
  const julianDateType = text(12, 16);
  const chipType = text(12, 16);
  const feastChipType = text(12, 16);
  const todayBtnType = text(13, 18);
  const menuLabelType = text(14, 18);
  // Dark hero → typikon ranks that render for dark surfaces; light hero → light-surface ranks.
  const typikonSurface = darkHeroSurface ? 'dark' : 'light';
  const typikonColor =
    (darkHeroSurface || lightHeroBackground) && !isRedTypikonRank(feastRank)
      ? fg
      : typikonIconColor(feastRank, typikonSurface);
  const majorFeastServiceLabel = isMajorFeastDay
    ? feastRankHeroLabelForMajorFeastDay(feastRank, orthocalFeastLevel, lang)
    : null;
  const majorFeastChipBg = darkHeroSurface
    ? 'rgba(214,58,82,0.28)'
    : lightHeroBackground
      ? 'rgba(214,58,82,0.16)'
      : isDark
        ? 'rgba(214,58,82,0.28)'
        : 'rgba(214,58,82,0.16)';
  const majorFeastBorder = isDark ? colors.feastHoverBorderDark : colors.feastBorder;
  const majorFeastTypikonColor = darkHeroSurface ? colors.feastBorder : fg;
  const majorFeastTypikonBackdrop = darkHeroSurface
    ? 'rgba(255,255,255,0.28)'
    : lightHeroBackground
      ? 'rgba(255,255,255,0.72)'
      : isDark
        ? 'rgba(255,255,255,0.14)'
        : 'rgba(255,255,255,0.72)';
  const roleMenuSurface = isDark ? '#2a2724' : '#fffcf7';
  const roleMenuText = isDark ? '#e8e3dd' : colors.ink;
  const roleMenuBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(43,38,35,0.12)';
  const servingRoleLabel = t(SERVING_ROLE_LABEL_KEYS[servingRole]);

  const onPreviousRef = useRef(onPrevious);
  const onNextRef = useRef(onNext);
  onPreviousRef.current = onPrevious;
  onNextRef.current = onNext;

  const daySwipe = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.4,
      onPanResponderRelease: (_evt, gesture) => {
        if (Math.abs(gesture.dx) < 48) return;
        if (gesture.dx < 0) onNextRef.current();
        else onPreviousRef.current();
      },
    }),
  ).current;

  const openRoleMenu = () => {
    if (roleMenuOpen) {
      setRoleMenuOpen(false);
      return;
    }
    roleBtnRef.current?.measureInWindow((x, y, _w, h) => {
      setRoleMenuPos({ top: y + h + 6, left: Math.max(8, x) });
      setRoleMenuOpen(true);
    });
  };

  const heroFastA11y = heroFastChip
    ? [
        heroFastChip.label,
        heroFastChip.icons.noMeat ? t('fasting.levelMeatFast') : null,
        heroFastChip.icons.fish ? t('fasting.exceptionFish') : null,
        heroFastChip.icons.wine ? t('fasting.exceptionWine') : null,
        heroFastChip.icons.oil ? t('fasting.exceptionOil') : null,
      ]
        .filter(Boolean)
        .join(', ')
    : null;

  return (
    <View
      style={[
        styles.heroShell,
        cardElevation(isDark),
        isDark ? styles.heroShellDark : null,
        isMajorFeastDay
          ? { borderWidth: 4, borderColor: majorFeastBorder }
          : null,
      ]}
      {...daySwipe.panHandlers}
    >
      <LinearGradient
        colors={[...heroStyle.gradient]}
        start={{ x: 0, y: 0.15 }}
        end={{ x: 0.92, y: 1 }}
        style={[styles.heroGradient, { paddingHorizontal: heroPaddingX }]}
      >
      <View style={styles.titleRow}>
        <Pressable
          ref={roleBtnRef}
          style={({ pressed }) => [
            styles.roleBtn,
            { backgroundColor: navBtnBg },
            pressed && styles.navBtnPressed,
          ]}
          onPress={openRoleMenu}
          accessibilityRole="button"
          accessibilityState={{ expanded: roleMenuOpen }}
          accessibilityLabel={`${t('settings.servingRole')}: ${servingRoleLabel}`}
          hitSlop={6}
        >
          <MaterialCommunityIcons
            name={SERVING_ROLE_ICON_NAMES[servingRole]}
            size={18}
            color={fg}
          />
        </Pressable>
        <Text
          style={[
            styles.dayTitle,
            dayTitleType,
            { color: fg },
            isMajorFeastDay ? styles.dayTitleFeast : null,
            phoneLayout ? styles.dayTitleWithCornersPhone : styles.dayTitleWithCorners,
          ]}
          numberOfLines={2}
        >
          {dayTitle}
        </Text>
        {onShare ? (
          <View style={styles.cornerActions}>
            <Pressable
              style={({ pressed }) => [
                styles.cornerBtn,
                { backgroundColor: navBtnBg },
                pressed && styles.navBtnPressed,
              ]}
              onPress={onShare}
              accessibilityLabel={t('today.shareDayA11y')}
              accessibilityRole="button"
              hitSlop={6}
            >
              <Feather name="share-2" size={16} color={fg} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.cornerSpacer} />
        )}
      </View>

      <Modal
        visible={roleMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleMenuOpen(false)}
      >
        <View style={styles.roleMenuRoot} pointerEvents="box-none">
          <Pressable
            style={styles.roleMenuBackdrop}
            onPress={() => setRoleMenuOpen(false)}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          <View
            style={[
              styles.roleMenu,
              {
                top: roleMenuPos.top,
                left: roleMenuPos.left,
                backgroundColor: roleMenuSurface,
                borderColor: roleMenuBorder,
              },
            ]}
          >
            {SERVING_ROLE_IDS.map((id) => {
              const selected = servingRole === id;
              const label = t(SERVING_ROLE_LABEL_KEYS[id]);
              return (
                <Pressable
                  key={id}
                  style={({ pressed }) => [
                    styles.roleMenuItem,
                    {
                      backgroundColor: selected
                        ? vestmentAccent.accent
                        : pressed
                          ? ROLE_MENU_ITEM_PRESSED
                          : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    onServingRoleChange(id);
                    setRoleMenuOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={label}
                >
                  <MaterialCommunityIcons
                    name={SERVING_ROLE_ICON_NAMES[id]}
                    size={18}
                    color={selected ? vestmentAccent.onAccent : roleMenuText}
                  />
                  <Text
                    style={[
                      styles.roleMenuItemLabel,
                      menuLabelType,
                      { color: selected ? vestmentAccent.onAccent : roleMenuText },
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>

      <View style={styles.navRow}>
        <Pressable
          style={({ pressed }) => [
            styles.navBtn,
            { backgroundColor: navBtnBg },
            pressed && styles.navBtnPressed,
          ]}
          onPress={onPrevious}
          accessibilityLabel={t('today.prevDay')}
        >
          <View style={styles.navChevronSlot} pointerEvents="none">
            <Feather
              name="chevron-left"
              size={24}
              color={fg}
              style={styles.navChevronLeft}
            />
          </View>
        </Pressable>

        <View style={styles.dateBlock}>
          <Text style={[styles.primaryDate, primaryDateType, { color: fg }]}>{dateLabel}</Text>
          {julianDateLabel ? (
            <Text style={[styles.julianDate, julianDateType, { color: fg }]}>
              {julianDateLabel}
            </Text>
          ) : null}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.navBtn,
            { backgroundColor: navBtnBg },
            pressed && styles.navBtnPressed,
          ]}
          onPress={onNext}
          accessibilityLabel={t('today.nextDay')}
        >
          <View style={styles.navChevronSlot} pointerEvents="none">
            <Feather
              name="chevron-right"
              size={24}
              color={fg}
              style={styles.navChevronRight}
            />
          </View>
        </Pressable>
      </View>

      <View style={styles.chipRow}>
        <View style={[styles.chip, { backgroundColor: chipBg }]}>
          <Text style={[styles.chipText, chipType, { color: fg }]}>{toneLabel}</Text>
        </View>
        {showFeastRankChip ? (
          isMajorFeastDay && majorFeastServiceLabel ? (
            <View style={[styles.chip, styles.feastChip, { backgroundColor: majorFeastChipBg }]}>
              <View
                style={[styles.feastTypikonBackdrop, { backgroundColor: majorFeastTypikonBackdrop }]}
              >
                <TypikonSymbol
                  feastRank={feastRank}
                  variant="chip"
                  color={majorFeastTypikonColor}
                  style={styles.chipIcon}
                />
              </View>
              <Text
                style={[styles.feastChipText, feastChipType, { color: fg }]}
                numberOfLines={2}
              >
                {majorFeastServiceLabel}
              </Text>
            </View>
          ) : (
            <View style={[styles.chip, { backgroundColor: chipBg }]}>
              <TypikonSymbol
                feastRank={feastRank}
                variant="chip"
                color={typikonColor}
                style={styles.chipIcon}
              />
            </View>
          )
        ) : null}
        {heroFastChip ? (
          <View
            style={[styles.chip, styles.fastChip, { backgroundColor: chipBg }]}
            accessibilityLabel={heroFastA11y ?? undefined}
          >
            <Text style={[styles.fastChipText, chipType, { color: fg }]}>{heroFastChip.label}</Text>
            {heroFastChip.icons.noMeat ||
            heroFastChip.icons.fish ||
            heroFastChip.icons.wine ||
            heroFastChip.icons.oil ? (
              <View style={styles.fastChipIconSpacer} />
            ) : null}
            {heroFastChip.icons.noMeat ? (
              <CalendarFastingFoodIcon kind="noMeat" color={fg} slashColor={fg} />
            ) : null}
            {heroFastChip.icons.fish ? (
              <FastingFoodIcon kind="fish" color={fg} allowedLabel />
            ) : null}
            {heroFastChip.icons.wine ? (
              <FastingFoodIcon kind="wine" color={fg} allowedLabel />
            ) : null}
            {heroFastChip.icons.oil ? (
              <FastingFoodIcon kind="oil" color={fg} allowedLabel />
            ) : null}
          </View>
        ) : null}
      </View>

      {canGoToToday ? (
        <Pressable style={[styles.todayBtn, { backgroundColor: todayBtnBg }]} onPress={onToday}>
          <Text style={[styles.todayBtnText, todayBtnType, { color: todayBtnFg }]}>
            {t('today.jumpToToday')}
          </Text>
        </Pressable>
      ) : null}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  heroShell: {
    borderRadius: 28,
    marginBottom: 10,
    width: '100%',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  heroShellDark: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    width: '100%',
  },
  titleRow: {
    width: '100%',
    marginBottom: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 68, // Fixed height for 2 lines of title text
  },
  dayTitle: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
    width: '100%',
  },
  dayTitleFeast: {
    letterSpacing: 0.35,
  },
  dayTitleWithCorners: {
    paddingHorizontal: 72,
  },
  dayTitleWithCornersPhone: {
    paddingHorizontal: 40,
  },
  roleBtn: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerActions: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cornerBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerSpacer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 66,
    height: 30,
  },
  roleMenuRoot: {
    flex: 1,
  },
  roleMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  roleMenu: {
    position: 'absolute',
    minWidth: 200,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  roleMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  roleMenuItemLabel: {
    fontWeight: '600',
    flexShrink: 1,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 4,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    flexShrink: 0,
  },
  navBtnPressed: {
    opacity: 0.75,
  },
  navChevronSlot: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navChevronLeft: {
    lineHeight: 24,
    textAlign: 'center',
    transform: [{ translateX: -1 }],
  },
  navChevronRight: {
    lineHeight: 24,
    textAlign: 'center',
    transform: [{ translateX: 1 }],
  },
  dateBlock: {
    flex: 1,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  primaryDate: {
    fontWeight: '600',
    textAlign: 'center',
  },
  julianDate: {
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.88,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  chipIcon: {
    marginVertical: 0,
  },
  feastChip: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    maxWidth: '92%',
  },
  feastTypikonBackdrop: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  feastChipText: {
    fontWeight: '700',
    flexShrink: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  fastChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  fastChipIconSpacer: {
    width: 6,
  },
  fastChipText: {
    fontWeight: '700',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  todayBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  todayBtnText: {
    fontWeight: '600',
  },
});
