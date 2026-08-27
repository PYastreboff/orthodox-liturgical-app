import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import Constants from 'expo-constants';
import Head from 'expo-router/head';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { OrthoDailyLogo } from '../../src/components/OrthoDailyLogo';
import { PhonePageHeader } from '../../src/components/PhonePageHeader';
import {
  SettingsLinkRow,
  settingsLinkListInset,
  settingsListCard,
} from '../../src/components/settings/SettingsLinkRow';
import { SettingsOptionModal, type SettingsOption } from '../../src/components/settings/SettingsOptionModal';
import {
  SettingsNotificationsModal,
  type NotificationToggleOption,
} from '../../src/components/settings/SettingsNotificationsModal';
import { SettingsPersonalDaysModal } from '../../src/components/settings/SettingsPersonalDaysModal';
import type { PersonalDayKind } from '../../src/lib/personalDays';
import { SettingsSwitch } from '../../src/components/settings/SettingsSwitch';
import { LanguageGlyphIcon } from '../../src/components/settings/LanguageGlyphIcon';
import { useScreenSafePadding } from '../../src/hooks/useScreenSafePadding';
import { useTabBarBottomPadding } from '../../src/hooks/useTabBarBottomPadding';
import { useTabHeaderShown } from '../../src/hooks/useTabHeaderShown';
import { useAppTranslation } from '../../src/i18n/useAppTranslation';
import { SUPPORT_URL, DONATION_URL } from '../../src/lib/legal/urls';
import {
  SERVING_ROLE_ICON_NAMES,
  SERVING_ROLE_IDS,
  SERVING_ROLE_LABEL_KEYS,
} from '../../src/lib/liturgical/servingRoles';
import {
  type NotificationReminderKind,
  requestNotificationPermissions,
  supportsLocalNotifications,
} from '../../src/lib/notifications/liturgicalReminders';
import { usePreferences } from '../../src/state/PreferencesContext';
import type { ColorSchemePreference } from '../../src/state/PreferencesContext';
import type { UiLanguage } from '../../src/i18n/types';
import type { PrimaryCalendar } from '../../src/lib/calendar/dateDisplay';
import type { FontScalePreference } from '../../src/theme/fontScale';
import type { ClergyRole } from '../../src/types/liturgical';
import { syncWebDocumentTheme } from '../../src/theme/syncWebDocumentTheme';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';
import { colors } from '../../src/theme/tokens';

const LINKEDIN_URL = 'https://www.linkedin.com/in/peter-yastreboff-6a9664313/';
const ORTHOCAL_URL = 'https://orthocal.info/';
const TYPIKON_XML_URL =
  'https://github.com/Mount-Skete/orthodox-typikon-feasts-xml';
const PONOMAR_URL = 'https://www.ponomar.net/';
const GETBIBLE_URL = 'https://getbible.net/v2/';
const OCMA_API_URL = 'https://ocma-api-e9870f.gitlab.io/';

type SettingsPicker =
  | 'servingRole'
  | 'appearance'
  | 'fontScale'
  | 'calendar'
  | 'language'
  | null;

type DataSource = {
  url: string;
  linkKey:
    | 'settings.sourceOrthocalLink'
    | 'settings.sourceTypikonLink'
    | 'settings.sourceRoysterLink'
    | 'settings.sourceGetBibleLink'
    | 'settings.sourceOcmaLink';
  hintKey:
    | 'settings.sourceOrthocalHint'
    | 'settings.sourceTypikonHint'
    | 'settings.sourceRoysterHint'
    | 'settings.sourceGetBibleHint'
    | 'settings.sourceOcmaHint';
};

const LITURGICAL_DATA_SOURCES: DataSource[] = [
  {
    url: ORTHOCAL_URL,
    linkKey: 'settings.sourceOrthocalLink',
    hintKey: 'settings.sourceOrthocalHint',
  },
  {
    url: TYPIKON_XML_URL,
    linkKey: 'settings.sourceTypikonLink',
    hintKey: 'settings.sourceTypikonHint',
  },
  {
    url: PONOMAR_URL,
    linkKey: 'settings.sourceRoysterLink',
    hintKey: 'settings.sourceRoysterHint',
  },
  {
    url: GETBIBLE_URL,
    linkKey: 'settings.sourceGetBibleLink',
    hintKey: 'settings.sourceGetBibleHint',
  },
  {
    url: OCMA_API_URL,
    linkKey: 'settings.sourceOcmaLink',
    hintKey: 'settings.sourceOcmaHint',
  },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const { t } = useAppTranslation();
  const router = useRouter();
  const {
    primaryCalendar,
    setPrimaryCalendar,
    colorSchemePreference,
    setColorSchemePreference,
    showVestmentGradient,
    setShowVestmentGradient,
    uiLanguage,
    setUiLanguage,
    fontScale,
    setFontScale,
    servingRole,
    setServingRole,
    notifyFastingReminder,
    setNotifyFastingReminder,
    notifyLiturgyMorning,
    setNotifyLiturgyMorning,
    notifyVespersEve,
    setNotifyVespersEve,
    notifyPresanctified,
    setNotifyPresanctified,
    notifyWeeklyDigest,
    setNotifyWeeklyDigest,
    homeScreenWidget,
    setHomeScreenWidget,
    personalDays,
    setPersonalDays,
  } = usePreferences();

  const [activePicker, setActivePicker] = useState<SettingsPicker>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [personalDaysKind, setPersonalDaysKind] = useState<PersonalDayKind | null>(null);
  const [permissionHint, setPermissionHint] = useState(false);
  const nativeReminders = supportsLocalNotifications();
  const muted = isDark ? '#a39e98' : colors.muted;
  const roleIconColor = isDark ? colors.tabActiveDark : colors.accentWine;

  const servingRoleLabel = t(SERVING_ROLE_LABEL_KEYS[servingRole]);
  const themeLabel =
    colorSchemePreference === 'system'
      ? t('settings.themeSystem')
      : colorSchemePreference === 'light'
        ? t('settings.themeLight')
        : t('settings.themeDark');
  const fontScaleLabel =
    fontScale === 'small'
      ? t('settings.fontScaleSmall')
      : fontScale === 'large'
        ? t('settings.fontScaleLarge')
        : t('settings.fontScaleDefault');
  const calendarLabel =
    primaryCalendar === 'julian' ? t('settings.calendarJulian') : t('settings.calendarGregorian');
  const languageLabel =
    uiLanguage === 'en'
      ? t('settings.languageEnglish')
      : uiLanguage === 'ru'
        ? t('settings.languageRussian')
        : t('settings.languageGreek');

  const notificationsEnabledCount = useMemo(
    () =>
      [
        notifyFastingReminder,
        notifyLiturgyMorning,
        notifyVespersEve,
        notifyPresanctified,
        notifyWeeklyDigest,
      ].filter(Boolean).length,
    [
      notifyFastingReminder,
      notifyLiturgyMorning,
      notifyPresanctified,
      notifyVespersEve,
      notifyWeeklyDigest,
    ],
  );

  const notificationsValueLabel =
    notificationsEnabledCount === 0
      ? t('settings.notificationsOff')
      : t('settings.notificationsOnCount', { count: notificationsEnabledCount });
  const parishFeastDays = useMemo(
    () => personalDays.filter((d) => d.kind === 'parish_feast'),
    [personalDays],
  );
  const namedays = useMemo(
    () => personalDays.filter((d) => d.kind === 'nameday'),
    [personalDays],
  );
  const birthdays = useMemo(
    () => personalDays.filter((d) => d.kind === 'birthday'),
    [personalDays],
  );
  const customEvents = useMemo(
    () => personalDays.filter((d) => d.kind === 'custom_event'),
    [personalDays],
  );
  const reposeDays = useMemo(
    () => personalDays.filter((d) => d.kind === 'repose'),
    [personalDays],
  );
  const parishFeastValueLabel =
    parishFeastDays.length === 0
      ? t('settings.personalDaysNone')
      : t('settings.personalDaysOnCount', { count: parishFeastDays.length });
  const namedayValueLabel =
    namedays.length === 0
      ? t('settings.personalDaysNone')
      : t('settings.personalDaysOnCount', { count: namedays.length });
  const birthdayValueLabel =
    birthdays.length === 0
      ? t('settings.personalDaysNone')
      : t('settings.personalDaysOnCount', { count: birthdays.length });
  const customEventValueLabel =
    customEvents.length === 0
      ? t('settings.personalDaysNone')
      : t('settings.personalDaysOnCount', { count: customEvents.length });
  const reposeValueLabel =
    reposeDays.length === 0
      ? t('settings.personalDaysNone')
      : t('settings.personalDaysOnCount', { count: reposeDays.length });

  const notificationOptions = useMemo(
    (): NotificationToggleOption[] => [
      {
        id: 'fasting',
        label: t('settings.notifyFasting'),
        hint: t('settings.notifyFastingHint'),
        leading: <Feather name="sunrise" size={18} color={roleIconColor} />,
        enabled: notifyFastingReminder,
      },
      {
        id: 'liturgy',
        label: t('settings.notifyLiturgy'),
        hint: t('settings.notifyLiturgyHint'),
        leading: <Feather name="sun" size={18} color={roleIconColor} />,
        enabled: notifyLiturgyMorning,
      },
      {
        id: 'vespers',
        label: t('settings.notifyVespers'),
        hint: t('settings.notifyVespersHint'),
        leading: <Feather name="sunset" size={18} color={roleIconColor} />,
        enabled: notifyVespersEve,
      },
      {
        id: 'presanctified',
        label: t('settings.notifyPresanctified'),
        hint: t('settings.notifyPresanctifiedHint'),
        leading: <Feather name="moon" size={18} color={roleIconColor} />,
        enabled: notifyPresanctified,
      },
      {
        id: 'weekly_digest',
        label: t('settings.notifyWeeklyDigest'),
        hint: t('settings.notifyWeeklyDigestHint'),
        leading: <Feather name="calendar" size={18} color={roleIconColor} />,
        enabled: notifyWeeklyDigest,
      },
    ],
    [
      notifyFastingReminder,
      notifyLiturgyMorning,
      notifyPresanctified,
      notifyVespersEve,
      notifyWeeklyDigest,
      roleIconColor,
      t,
    ],
  );

  const notificationsFooterNote = useMemo(() => {
    if (permissionHint) return t('settings.notifyPermissionDenied');
    if (!nativeReminders) return t('settings.notificationsWebOnly');
    return undefined;
  }, [nativeReminders, permissionHint, t]);

  const servingRoleOptions = useMemo(
    (): SettingsOption<ClergyRole>[] =>
      SERVING_ROLE_IDS.map((id) => ({
        id,
        label: t(SERVING_ROLE_LABEL_KEYS[id]),
        leading: (
          <MaterialCommunityIcons
            name={SERVING_ROLE_ICON_NAMES[id]}
            size={18}
            color={roleIconColor}
          />
        ),
      })),
    [roleIconColor, t],
  );

  const appearanceOptions = useMemo(
    (): SettingsOption<ColorSchemePreference>[] => [
      { id: 'system', label: t('settings.themeSystem') },
      { id: 'light', label: t('settings.themeLight') },
      { id: 'dark', label: t('settings.themeDark') },
    ],
    [t],
  );

  const fontScaleOptions = useMemo(
    (): SettingsOption<FontScalePreference>[] => [
      { id: 'small', label: t('settings.fontScaleSmall') },
      { id: 'default', label: t('settings.fontScaleDefault') },
      { id: 'large', label: t('settings.fontScaleLarge') },
    ],
    [t],
  );

  const calendarOptions = useMemo(
    (): SettingsOption<PrimaryCalendar>[] => [
      { id: 'julian', label: t('settings.calendarJulian') },
      { id: 'gregorian', label: t('settings.calendarGregorian') },
    ],
    [t],
  );

  const languageOptions = useMemo(
    (): SettingsOption<UiLanguage>[] => [
      {
        id: 'en',
        label: t('settings.languageEnglish'),
        leading: <LanguageGlyphIcon lang="en" color={roleIconColor} />,
      },
      {
        id: 'ru',
        label: t('settings.languageRussian'),
        leading: <LanguageGlyphIcon lang="ru" color={roleIconColor} />,
      },
      {
        id: 'el',
        label: t('settings.languageGreek'),
        leading: <LanguageGlyphIcon lang="el" color={roleIconColor} />,
      },
    ],
    [roleIconColor, t],
  );

  const pickerTitle = useMemo(() => {
    switch (activePicker) {
      case 'servingRole':
        return t('settings.servingRole');
      case 'appearance':
        return t('settings.appearance');
      case 'fontScale':
        return t('settings.textSize');
      case 'calendar':
        return t('settings.liturgicalCalendar');
      case 'language':
        return t('settings.appLanguage');
      default:
        return '';
    }
  }, [activePicker, t]);

  const toggleReminder = useCallback(
    async (
      kind: NotificationReminderKind,
      next: boolean,
    ) => {
      const apply = (value: boolean) => {
        if (kind === 'fasting') setNotifyFastingReminder(value);
        else if (kind === 'liturgy') setNotifyLiturgyMorning(value);
        else if (kind === 'vespers') setNotifyVespersEve(value);
        else if (kind === 'presanctified') setNotifyPresanctified(value);
        else if (kind === 'weekly_digest') setNotifyWeeklyDigest(value);
      };

      if (!next) {
        apply(false);
        setPermissionHint(false);
        return;
      }
      if (!nativeReminders) {
        apply(true);
        return;
      }
      const ok = await requestNotificationPermissions(uiLanguage);
      if (!ok) {
        setPermissionHint(true);
        Alert.alert(t('settings.sectionNotifications'), t('settings.notifyPermissionDenied'));
        return;
      }
      setPermissionHint(false);
      apply(true);
    },
    [
      nativeReminders,
      setNotifyFastingReminder,
      setNotifyLiturgyMorning,
      setNotifyPresanctified,
      setNotifyVespersEve,
      setNotifyWeeklyDigest,
      t,
      uiLanguage,
    ],
  );

  const ensureReminderPermission = useCallback(async () => {
    if (!nativeReminders) return true;
    const ok = await requestNotificationPermissions(uiLanguage);
    if (!ok) {
      setPermissionHint(true);
      Alert.alert(t('settings.sectionNotifications'), t('settings.notifyPermissionDenied'));
      return false;
    }
    setPermissionHint(false);
    return true;
  }, [nativeReminders, t, uiLanguage]);

  const version = Constants.expoConfig?.version ?? '0.1.0';
  const screenSafe = useScreenSafePadding();
  const scrollBottomPadding = useTabBarBottomPadding();
  const showTabHeader = useTabHeaderShown();
  const pageBg = theme.colors.background;

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'web') return;
      syncWebDocumentTheme(isDark, pageBg);
      return () => syncWebDocumentTheme(isDark);
    }, [isDark, pageBg]),
  );

  return (
    <>
      <Head>
        <title>{t('tabs.browserTitleSettings')}</title>
      </Head>
      <View style={[styles.page, { backgroundColor: pageBg }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.container,
            {
              paddingTop: screenSafe.paddingTop + 20,
              paddingLeft: screenSafe.paddingLeft,
              paddingRight: screenSafe.paddingRight,
              paddingBottom: scrollBottomPadding,
            },
          ]}
        >
          {!showTabHeader ? (
            <View style={styles.pageHeader}>
              <PhonePageHeader
                title={t('settings.title')}
                subtitle={t('settings.subtitleShort')}
                textColor={theme.colors.text}
                mutedColor={muted}
              />
            </View>
          ) : null}

          <View style={settingsListCard(isDark)}>
            <View style={settingsLinkListInset}>
              <SettingsLinkRow
                isDark={isDark}
                leading={
                  <MaterialCommunityIcons
                    name={SERVING_ROLE_ICON_NAMES[servingRole]}
                    size={18}
                    color={roleIconColor}
                  />
                }
                label={t('settings.servingRole')}
                hint={t('settings.servingRoleRowHint')}
                valueLabel={servingRoleLabel}
                onPress={() => setActivePicker('servingRole')}
              />
              <SettingsLinkRow
                isDark={isDark}
                icon="sun"
                label={t('settings.appearance')}
                hint={t('settings.appearanceRowHint')}
                valueLabel={themeLabel}
                onPress={() => setActivePicker('appearance')}
                showDivider
              />
              <SettingsLinkRow
                isDark={isDark}
                icon="droplet"
                label={t('settings.backgroundColour')}
                hint={t('settings.backgroundColourHint')}
                trailing={
                  <SettingsSwitch
                    value={showVestmentGradient}
                    onValueChange={setShowVestmentGradient}
                    isDark={isDark}
                    accessibilityLabel={t('settings.backgroundColour')}
                  />
                }
                showDivider
              />
              <SettingsLinkRow
                isDark={isDark}
                icon="type"
                label={t('settings.textSize')}
                hint={t('settings.textSizeRowHint')}
                valueLabel={fontScaleLabel}
                onPress={() => setActivePicker('fontScale')}
                showDivider
              />
              <SettingsLinkRow
                isDark={isDark}
                icon="calendar"
                label={t('settings.liturgicalCalendar')}
                hint={t('settings.liturgicalCalendarRowHint')}
                valueLabel={calendarLabel}
                onPress={() => setActivePicker('calendar')}
                showDivider
              />
              <SettingsLinkRow
                isDark={isDark}
                icon="globe"
                label={t('settings.appLanguage')}
                hint={t('settings.appLanguageRowHint')}
                valueLabel={languageLabel}
                onPress={() => setActivePicker('language')}
                showDivider
              />

              <SettingsLinkRow
                isDark={isDark}
                icon="bell"
                label={t('settings.notifications')}
                hint={t('settings.notificationsRowHint')}
                valueLabel={notificationsValueLabel}
                onPress={() => setNotificationsOpen(true)}
                showDivider
              />
              <SettingsLinkRow
                isDark={isDark}
                icon="smartphone"
                label={t('settings.homeScreenWidget')}
                hint={
                  nativeReminders
                    ? t('settings.homeScreenWidgetHint')
                    : t('settings.notificationsWebOnly')
                }
                trailing={
                  <SettingsSwitch
                    value={homeScreenWidget}
                    onValueChange={setHomeScreenWidget}
                    isDark={isDark}
                    accessibilityLabel={t('settings.homeScreenWidget')}
                  />
                }
                showDivider
              />
              <SettingsLinkRow
                isDark={isDark}
                icon="home"
                label={t('settings.parishFeast')}
                hint={t('settings.parishFeastRowHint')}
                valueLabel={parishFeastValueLabel}
                onPress={() => setPersonalDaysKind('parish_feast')}
                showDivider
              />
              <SettingsLinkRow
                isDark={isDark}
                icon="user"
                label={t('settings.nameday')}
                hint={t('settings.namedayRowHint')}
                valueLabel={namedayValueLabel}
                onPress={() => setPersonalDaysKind('nameday')}
                showDivider
              />
              <SettingsLinkRow
                isDark={isDark}
                icon="gift"
                label={t('settings.birthday')}
                hint={t('settings.birthdayRowHint')}
                valueLabel={birthdayValueLabel}
                onPress={() => setPersonalDaysKind('birthday')}
                showDivider
              />
              <SettingsLinkRow
                isDark={isDark}
                icon="star"
                label={t('settings.customEvent')}
                hint={t('settings.customEventRowHint')}
                valueLabel={customEventValueLabel}
                onPress={() => setPersonalDaysKind('custom_event')}
                showDivider
              />
              <SettingsLinkRow
                isDark={isDark}
                leading={
                  <MaterialCommunityIcons
                    name="cross"
                    size={18}
                    color={roleIconColor}
                  />
                }
                label={t('settings.repose')}
                hint={t('settings.reposeRowHint')}
                valueLabel={reposeValueLabel}
                onPress={() => setPersonalDaysKind('repose')}
                showDivider
              />

              <SettingsLinkRow
                isDark={isDark}
                icon="info"
                label={t('settings.colorsLegendLink')}
                hint={t('settings.colorsLegendLinkHint')}
                onPress={() => router.push('/legend')}
                showDivider
              />
              <SettingsLinkRow
                isDark={isDark}
                icon="shield"
                label={t('settings.privacyPolicyLink')}
                hint={t('settings.privacyPolicyHint')}
                onPress={() => router.push('/privacy')}
                showDivider
              />
              <SettingsLinkRow
                isDark={isDark}
                icon="life-buoy"
                label={t('settings.supportLink')}
                hint={t('settings.supportHint')}
                onPress={() => Linking.openURL(SUPPORT_URL)}
                trailingIcon="external-link"
                showDivider
              />
            </View>
          </View>

          <View style={[settingsListCard(isDark), styles.tipJarCard]}>
            <View style={styles.tipJarInner}>
              <Feather
                name="coffee"
                size={22}
                color={isDark ? colors.tabActiveDark : colors.accentWine}
              />
              <Text style={[styles.tipJarTitle, { color: theme.colors.text }]}>
                {t('settings.tipJarTitle')}
              </Text>
              <Text style={[styles.tipJarBody, { color: muted }]}>
                {t('settings.tipJarBody')}
              </Text>
              <Pressable
                onPress={() => Linking.openURL(DONATION_URL)}
                accessibilityRole="link"
                accessibilityLabel={t('settings.tipJarButton')}
                style={({ pressed }) => [
                  styles.tipJarButton,
                  {
                    backgroundColor: isDark ? colors.accentWine : colors.ink,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
              >
                <Feather name="external-link" size={15} color="#fff" />
                <Text style={styles.tipJarButtonLabel}>{t('settings.tipJarButton')}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.footer}>
            <OrthoDailyLogo size={36} />
            <Text style={[styles.footerApp, { color: theme.colors.text }]}>OrthoDaily</Text>
            <Text style={[styles.footerMeta, { color: muted }]}>
              {t('settings.version', { version })}
            </Text>
            <View style={styles.attributionRow}>
              <Text style={[styles.footerCredit, { color: muted }]}>{t('settings.madeBy')}</Text>
              <Pressable
                onPress={() => Linking.openURL(LINKEDIN_URL)}
                accessibilityRole="link"
                accessibilityLabel="Peter Y. on LinkedIn"
              >
                <Text style={styles.footerLink}>Peter Y.</Text>
              </Pressable>
            </View>
            <View style={styles.sourcesBlock}>
              <Text style={[styles.sourcesTitle, { color: theme.colors.text }]}>
                {t('settings.dataSourcesTitle')}
              </Text>
              {LITURGICAL_DATA_SOURCES.map((source) => (
                <View key={source.url} style={styles.sourceRow}>
                  <Pressable
                    onPress={() => Linking.openURL(source.url)}
                    accessibilityRole="link"
                    accessibilityLabel={t(source.linkKey)}
                  >
                    <Text style={styles.footerLink}>{t(source.linkKey)}</Text>
                  </Pressable>
                  <Text style={[styles.sourceHint, { color: muted }]}>{t(source.hintKey)}</Text>
                </View>
              ))}
              <Text style={[styles.footerCredit, styles.sourcesNote, { color: muted }]}>
                {t('settings.dataSourcesNote')}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {activePicker === 'servingRole' ? (
        <SettingsOptionModal
          visible
          title={pickerTitle}
          options={servingRoleOptions}
          value={servingRole}
          onSelect={setServingRole}
          onClose={() => setActivePicker(null)}
          isDark={isDark}
        />
      ) : null}
      {activePicker === 'appearance' ? (
        <SettingsOptionModal
          visible
          title={pickerTitle}
          options={appearanceOptions}
          value={colorSchemePreference}
          onSelect={setColorSchemePreference}
          onClose={() => setActivePicker(null)}
          isDark={isDark}
        />
      ) : null}
      {activePicker === 'fontScale' ? (
        <SettingsOptionModal
          visible
          title={pickerTitle}
          options={fontScaleOptions}
          value={fontScale}
          onSelect={setFontScale}
          onClose={() => setActivePicker(null)}
          isDark={isDark}
        />
      ) : null}
      {activePicker === 'calendar' ? (
        <SettingsOptionModal
          visible
          title={pickerTitle}
          options={calendarOptions}
          value={primaryCalendar}
          onSelect={setPrimaryCalendar}
          onClose={() => setActivePicker(null)}
          isDark={isDark}
        />
      ) : null}
      {activePicker === 'language' ? (
        <SettingsOptionModal
          visible
          title={pickerTitle}
          options={languageOptions}
          value={uiLanguage}
          onSelect={setUiLanguage}
          onClose={() => setActivePicker(null)}
          isDark={isDark}
        />
      ) : null}
      <SettingsNotificationsModal
        visible={notificationsOpen}
        title={t('settings.notifications')}
        subtitle={t('settings.notificationsMobileOnly')}
        options={notificationOptions}
        onToggle={(id, next) => void toggleReminder(id, next)}
        onClose={() => setNotificationsOpen(false)}
        isDark={isDark}
        footerNote={notificationsFooterNote}
      />
      {personalDaysKind ? (
        <SettingsPersonalDaysModal
          visible
          kind={personalDaysKind}
          days={personalDays}
          onChange={setPersonalDays}
          onClose={() => setPersonalDaysKind(null)}
          isDark={isDark}
          onEnableEveReminder={ensureReminderPermission}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
  },
  pageHeader: {
    marginBottom: 20,
  },
  tipJarCard: {
    marginTop: 18,
  },
  tipJarInner: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  tipJarTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  tipJarBody: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  tipJarButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  tipJarButtonLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 8,
    paddingTop: 16,
    alignItems: 'center',
  },
  footerApp: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
  },
  footerMeta: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 17,
  },
  attributionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  footerCredit: {
    fontSize: 12,
    lineHeight: 17,
  },
  sourcesBlock: {
    marginTop: 28,
    paddingHorizontal: 8,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  sourcesTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  sourceRow: {
    marginBottom: 10,
    alignItems: 'center',
  },
  sourceHint: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 4,
  },
  sourcesNote: {
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  footerLink: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: colors.accentWine,
    textDecorationLine: 'underline',
  },
});
