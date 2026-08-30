import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { HoverPressable } from '../HoverPressable';
import { hoverAccessibilityProps } from '../../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { intlLocaleForLanguage } from '../../i18n/locale';
import { dateToJulianPlainDate } from '../../lib/calendar/julianGregorian';
import {
  clampPersonalDate,
  clampReposeYear,
  daysInCalendarMonth,
  formatFortiethDayPreview,
  formatPersonalDayDate,
  gregorianMonthDay,
  MAX_PERSONAL_DAYS,
  newPersonalDayId,
  type PersonalDay,
  type PersonalDayCalendar,
  type PersonalDayKind,
} from '../../lib/personalDays';
import { colors } from '../../theme/tokens';
import { SettingsSheetFrame, SettingsSheetScrollView } from './SettingsSheetFrame';
import { SettingsSwitch } from './SettingsSwitch';

type Props = {
  visible: boolean;
  kind: PersonalDayKind;
  days: readonly PersonalDay[];
  onChange: (next: PersonalDay[]) => void;
  onClose: () => void;
  isDark: boolean;
  onEnableEveReminder?: () => Promise<boolean>;
};

type Draft = {
  id: string | null;
  kind: PersonalDayKind;
  title: string;
  month: number;
  day: number;
  year: number;
  calendar: PersonalDayCalendar;
  remindEve: boolean;
  showFortiethDay: boolean;
};

function todayInCalendar(calendar: PersonalDayCalendar): { month: number; day: number } {
  const now = new Date();
  if (calendar === 'julian') {
    const julian = dateToJulianPlainDate(now);
    return { month: julian.month, day: julian.day };
  }
  return gregorianMonthDay(now);
}

function copyForKind(kind: PersonalDayKind, t: (key: string) => string) {
  switch (kind) {
    case 'parish_feast':
      return {
        title: t('settings.parishFeast'),
        hint: t('settings.parishFeastHint'),
        empty: t('settings.parishFeastEmpty'),
        add: t('settings.addParishFeast'),
        placeholder: t('settings.parishFeastPlaceholder'),
      };
    case 'nameday':
      return {
        title: t('settings.nameday'),
        hint: t('settings.namedayHint'),
        empty: t('settings.namedayEmpty'),
        add: t('settings.addNameday'),
        placeholder: t('settings.namedayPlaceholder'),
      };
    case 'birthday':
      return {
        title: t('settings.birthday'),
        hint: t('settings.birthdayHint'),
        empty: t('settings.birthdayEmpty'),
        add: t('settings.addBirthday'),
        placeholder: t('settings.birthdayPlaceholder'),
      };
    case 'repose':
      return {
        title: t('settings.repose'),
        hint: t('settings.reposeHint'),
        empty: t('settings.reposeEmpty'),
        add: t('settings.addRepose'),
        placeholder: t('settings.reposePlaceholder'),
      };
    default:
      return {
        title: t('settings.customEvent'),
        hint: t('settings.customEventHint'),
        empty: t('settings.customEventEmpty'),
        add: t('settings.addCustomEvent'),
        placeholder: t('settings.customEventPlaceholder'),
      };
  }
}

function emptyDraft(kind: PersonalDayKind, calendar: PersonalDayCalendar): Draft {
  const today = todayInCalendar(calendar);
  return {
    id: null,
    kind,
    title: '',
    month: today.month,
    day: today.day,
    year: new Date().getFullYear(),
    calendar,
    remindEve: true,
    showFortiethDay: kind === 'repose',
  };
}

function draftFromDay(day: PersonalDay): Draft {
  return {
    id: day.id,
    kind: day.kind,
    title: day.title,
    month: day.month,
    day: day.day,
    year: day.year ?? new Date().getFullYear(),
    calendar: day.calendar,
    remindEve: day.remindEve,
    showFortiethDay: day.kind === 'repose' ? day.showFortiethDay !== false : false,
  };
}

export function SettingsPersonalDaysModal({
  visible,
  kind,
  days,
  onChange,
  onClose,
  isDark,
  onEnableEveReminder,
}: Props) {
  const { t, lang } = useAppTranslation();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const sheetHeight = Math.round(windowHeight * (windowWidth < 600 ? 2 / 3 : 0.85));
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    if (!visible) {
      setDraft(null);
      return;
    }
    const hasItems = days.some((d) => d.kind === kind);
    setDraft(hasItems ? null : emptyDraft(kind, 'gregorian'));
  }, [visible, kind]);

  const setDraftCalendar = (calendar: PersonalDayCalendar) => {
    if (!draft) return;
    if (!draft.id) {
      const today = todayInCalendar(calendar);
      setDraft({ ...draft, calendar, month: today.month, day: today.day });
      return;
    }
    setDraft({ ...draft, calendar });
  };
  const surfaceBg = isDark ? '#2a2724' : '#ebe6de';
  const textColor = isDark ? '#e8e3dd' : '#2b2623';
  const mutedColor = isDark ? '#a39e98' : colors.muted;
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(43,38,35,0.12)';
  const handleColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(43,38,35,0.28)';
  const fieldBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(43,38,35,0.06)';
  const locale = intlLocaleForLanguage(lang);

  const monthLabel = useMemo(() => {
    if (!draft) return '';
    return new Intl.DateTimeFormat(locale, { month: 'long' }).format(
      new Date(2024, draft.month - 1, 1),
    );
  }, [draft, locale]);

  const items = days.filter((d) => d.kind === kind);
  const copy = copyForKind(kind, t);
  const dateHint = t('settings.personalDaysDateHint');
  const listTitle = copy.title;
  const listHint = copy.hint;
  const addLabel = copy.add;

  const closeAll = () => {
    setDraft(null);
    onClose();
  };

  const saveDraft = async () => {
    if (!draft) return;
    const title = draft.title.trim();
    if (!title) return;
    const { month, day } = clampPersonalDate(draft.month, draft.day);
    let remindEve = draft.remindEve;
    if (remindEve && onEnableEveReminder) {
      const allowed = await onEnableEveReminder();
      if (!allowed) remindEve = false;
    }
    const saved: PersonalDay = {
      id: draft.id ?? newPersonalDayId(),
      kind: draft.kind,
      title,
      month,
      day,
      calendar: draft.calendar,
      remindEve,
      ...(draft.kind === 'repose'
        ? {
            year: clampReposeYear(draft.year),
            showFortiethDay: draft.showFortiethDay,
          }
        : null),
    };
    const without = days.filter((d) => d.id !== saved.id);
    onChange([...without, saved]);
    setDraft(null);
  };

  const removeDraft = () => {
    if (!draft?.id) {
      setDraft(null);
      return;
    }
    onChange(days.filter((d) => d.id !== draft.id));
    setDraft(null);
  };

  const renderList = () => (
    <View style={styles.group}>
      {items.length === 0 ? (
        <Text style={[styles.empty, { color: mutedColor }]}>
          {copy.empty}
        </Text>
      ) : (
        items.map((item) => (
          <HoverPressable
            key={item.id}
            isDark={isDark}
            baseBackground={fieldBg}
            style={styles.itemRow}
            onPress={() => setDraft(draftFromDay(item))}
            accessibilityRole="button"
            {...hoverAccessibilityProps(item.title, { role: 'button' })}
          >
            <View style={styles.itemText}>
              <Text style={[styles.itemTitle, { color: textColor }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.itemMeta, { color: mutedColor }]}>
                {formatPersonalDayDate(item, lang)}
                {item.remindEve ? ` · ${t('settings.personalDayRemindOn')}` : ''}
                {item.kind === 'repose' && item.showFortiethDay !== false
                  ? ` · ${t('settings.reposeFortiethOn')}`
                  : ''}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={mutedColor} />
          </HoverPressable>
        ))
      )}
      <HoverPressable
        isDark={isDark}
        style={styles.addBtn}
        onPress={() => setDraft(emptyDraft(kind, 'gregorian'))}
        disabled={days.length >= MAX_PERSONAL_DAYS}
        accessibilityRole="button"
        {...hoverAccessibilityProps(addLabel, { role: 'button' })}
      >
        <Feather name="plus" size={16} color={isDark ? '#fff' : textColor} />
        <Text style={[styles.addLabel, { color: isDark ? '#fff' : textColor }]}>{addLabel}</Text>
      </HoverPressable>
    </View>
  );

  const shiftMonth = (delta: number) => {
    if (!draft) return;
    const nextMonth = ((draft.month - 1 + delta + 12) % 12) + 1;
    setDraft({ ...draft, ...clampPersonalDate(nextMonth, draft.day) });
  };

  const shiftDay = (delta: number) => {
    if (!draft) return;
    const max = daysInCalendarMonth(draft.month);
    const next = ((draft.day - 1 + delta + max) % max) + 1;
    setDraft({ ...draft, day: next });
  };

  const shiftYear = (delta: number) => {
    if (!draft) return;
    setDraft({ ...draft, year: clampReposeYear(draft.year + delta) });
  };

  return (
    <SettingsSheetFrame
      visible={visible}
      onClose={closeAll}
      sheetHeight={sheetHeight}
      surfaceBg={surfaceBg}
      borderColor={borderColor}
      handleColor={handleColor}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.avoid}
      >
        <View style={styles.sheetBody}>
            <Text style={[styles.title, { color: textColor }]}>
              {draft
                ? draft.id
                  ? t('settings.editPersonalDay')
                  : addLabel
                : listTitle}
            </Text>
            <Text style={[styles.subtitle, { color: mutedColor }]}>
              {draft
                ? draft.kind === 'repose'
                  ? t('settings.reposeDateHint')
                  : dateHint
                : listHint}
            </Text>

            {draft ? (
              <SettingsSheetScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={[styles.fieldLabel, { color: mutedColor }]}>
                  {t('settings.personalDayTitle')}
                </Text>
                <TextInput
                  value={draft.title}
                  onChangeText={(title) => setDraft({ ...draft, title })}
                  placeholder={copy.placeholder}
                  placeholderTextColor={mutedColor}
                  style={[styles.input, { color: textColor, backgroundColor: fieldBg, borderColor }]}
                />

                <Text style={[styles.fieldLabel, { color: mutedColor }]}>
                  {t('settings.personalDayDate')}
                </Text>
                <View style={[styles.calendarToggle, { backgroundColor: fieldBg, borderColor }]}>
                  {(['gregorian', 'julian'] as const).map((cal) => {
                    const selected = draft.calendar === cal;
                    const label =
                      cal === 'julian'
                        ? t('settings.calendarJulian')
                        : t('settings.calendarGregorian');
                    return (
                      <HoverPressable
                        key={cal}
                        isDark={isDark}
                        selected={selected}
                        style={styles.calendarOption}
                        onPress={() => setDraftCalendar(cal)}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        {...hoverAccessibilityProps(label, { role: 'button' })}
                      >
                        <Text
                          style={[
                            styles.calendarOptionLabel,
                            { color: selected ? '#fff' : textColor },
                          ]}
                          numberOfLines={1}
                        >
                          {label}
                        </Text>
                      </HoverPressable>
                    );
                  })}
                </View>
                <View style={styles.dateRow}>
                  <View style={[styles.stepper, { backgroundColor: fieldBg, borderColor, flex: 1.4 }]}>
                    <HoverPressable
                      isDark={isDark}
                      onPress={() => shiftMonth(-1)}
                      style={styles.stepperBtn}
                      accessibilityRole="button"
                      accessibilityLabel={t('settings.personalDayPrevMonth')}
                      {...hoverAccessibilityProps(t('settings.personalDayPrevMonth'), {
                        role: 'button',
                      })}
                    >
                      <Feather name="chevron-left" size={18} color={textColor} />
                    </HoverPressable>
                    <Text style={[styles.stepperValue, { color: textColor }]} numberOfLines={1}>
                      {monthLabel}
                    </Text>
                    <HoverPressable
                      isDark={isDark}
                      onPress={() => shiftMonth(1)}
                      style={styles.stepperBtn}
                      accessibilityRole="button"
                      accessibilityLabel={t('settings.personalDayNextMonth')}
                      {...hoverAccessibilityProps(t('settings.personalDayNextMonth'), {
                        role: 'button',
                      })}
                    >
                      <Feather name="chevron-right" size={18} color={textColor} />
                    </HoverPressable>
                  </View>

                  <View style={[styles.stepper, { backgroundColor: fieldBg, borderColor, flex: 0.85 }]}>
                    <HoverPressable
                      isDark={isDark}
                      onPress={() => shiftDay(-1)}
                      style={styles.stepperBtn}
                      accessibilityRole="button"
                      accessibilityLabel={t('settings.personalDayPrevDay')}
                      {...hoverAccessibilityProps(t('settings.personalDayPrevDay'), {
                        role: 'button',
                      })}
                    >
                      <Feather name="chevron-left" size={18} color={textColor} />
                    </HoverPressable>
                    <Text style={[styles.stepperValue, { color: textColor }]}>{draft.day}</Text>
                    <HoverPressable
                      isDark={isDark}
                      onPress={() => shiftDay(1)}
                      style={styles.stepperBtn}
                      accessibilityRole="button"
                      accessibilityLabel={t('settings.personalDayNextDay')}
                      {...hoverAccessibilityProps(t('settings.personalDayNextDay'), {
                        role: 'button',
                      })}
                    >
                      <Feather name="chevron-right" size={18} color={textColor} />
                    </HoverPressable>
                  </View>
                </View>

                {draft.kind === 'repose' ? (
                  <View style={[styles.dateRow, { marginTop: 8 }]}>
                    <View style={[styles.stepper, { backgroundColor: fieldBg, borderColor, flex: 1 }]}>
                      <HoverPressable
                        isDark={isDark}
                        onPress={() => shiftYear(-1)}
                        style={styles.stepperBtn}
                        accessibilityRole="button"
                        accessibilityLabel={t('settings.personalDayPrevYear')}
                        {...hoverAccessibilityProps(t('settings.personalDayPrevYear'), {
                          role: 'button',
                        })}
                      >
                        <Feather name="chevron-left" size={18} color={textColor} />
                      </HoverPressable>
                      <Text style={[styles.stepperValue, { color: textColor }]}>{draft.year}</Text>
                      <HoverPressable
                        isDark={isDark}
                        onPress={() => shiftYear(1)}
                        style={styles.stepperBtn}
                        accessibilityRole="button"
                        accessibilityLabel={t('settings.personalDayNextYear')}
                        {...hoverAccessibilityProps(t('settings.personalDayNextYear'), {
                          role: 'button',
                        })}
                      >
                        <Feather name="chevron-right" size={18} color={textColor} />
                      </HoverPressable>
                    </View>
                  </View>
                ) : null}

                <View style={styles.remindRow}>
                  <View style={styles.remindText}>
                    <Text style={[styles.itemTitle, { color: textColor }]}>
                      {t('settings.personalDayRemindEve')}
                    </Text>
                    <Text style={[styles.itemMeta, { color: mutedColor }]}>
                      {t('settings.personalDayRemindEveHint')}
                    </Text>
                  </View>
                  <SettingsSwitch
                    value={draft.remindEve}
                    onValueChange={(remindEve) => setDraft({ ...draft, remindEve })}
                    isDark={isDark}
                    accessibilityLabel={t('settings.personalDayRemindEve')}
                  />
                </View>

                {draft.kind === 'repose' ? (
                  <>
                    <View style={styles.remindRow}>
                      <View style={styles.remindText}>
                        <Text style={[styles.itemTitle, { color: textColor }]}>
                          {t('settings.reposeShowFortiethDay')}
                        </Text>
                        <Text style={[styles.itemMeta, { color: mutedColor }]}>
                          {t('settings.reposeShowFortiethDayHint')}
                        </Text>
                      </View>
                      <SettingsSwitch
                        value={draft.showFortiethDay}
                        onValueChange={(showFortiethDay) =>
                          setDraft({ ...draft, showFortiethDay })
                        }
                        isDark={isDark}
                        accessibilityLabel={t('settings.reposeShowFortiethDay')}
                      />
                    </View>
                    {draft.showFortiethDay ? (
                      <Text style={[styles.fortiethPreview, { color: mutedColor }]}>
                        {t('settings.reposeFortiethPreview', {
                          date: formatFortiethDayPreview(draft, lang),
                        })}
                      </Text>
                    ) : null}
                  </>
                ) : null}
              </SettingsSheetScrollView>
            ) : (
              <SettingsSheetScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {renderList()}
                {days.length >= MAX_PERSONAL_DAYS ? (
                  <Text style={[styles.empty, { color: mutedColor }]}>
                    {t('settings.personalDaysMax')}
                  </Text>
                ) : null}
              </SettingsSheetScrollView>
            )}

            <View style={styles.actions}>
              {draft ? (
                <>
                  {draft.id ? (
                    <HoverPressable isDark={isDark} onPress={removeDraft} style={styles.actionBtn}>
                      <Text style={styles.deleteLabel}>{t('settings.deletePersonalDay')}</Text>
                    </HoverPressable>
                  ) : (
                    <HoverPressable isDark={isDark} onPress={() => setDraft(null)} style={styles.actionBtn}>
                      <Text style={[styles.backLabel, { color: mutedColor }]}>
                        {t('settings.personalDayBack')}
                      </Text>
                    </HoverPressable>
                  )}
                  <HoverPressable
                    isDark={isDark}
                    onPress={() => void saveDraft()}
                    style={styles.actionBtn}
                    disabled={!draft.title.trim()}
                  >
                    <Text
                      style={[
                        styles.saveLabel,
                        {
                          color: isDark ? '#fff' : textColor,
                          opacity: draft.title.trim() ? 1 : 0.4,
                        },
                      ]}
                    >
                      {t('settings.savePersonalDay')}
                    </Text>
                  </HoverPressable>
                </>
              ) : (
                <HoverPressable isDark={isDark} onPress={closeAll} style={styles.actionBtn}>
                  <Text style={[styles.backLabel, { color: mutedColor }]}>
                    {t('settings.personalDayBack')}
                  </Text>
                </HoverPressable>
              )}
            </View>
        </View>
      </KeyboardAvoidingView>
    </SettingsSheetFrame>
  );
}

const styles = StyleSheet.create({
  avoid: {
    flex: 1,
    minHeight: 0,
  },
  sheetBody: {
    flex: 1,
    minHeight: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  group: {
    gap: 8,
    marginBottom: 10,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  empty: {
    fontSize: 13,
    lineHeight: 18,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  itemText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
  },
  itemMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  addLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  input: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  calendarToggle: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 3,
    gap: 3,
  },
  calendarOption: {
    flex: 1,
    minHeight: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  calendarOptionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    paddingHorizontal: 2,
  },
  stepperBtn: {
    width: 36,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
  remindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  remindText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  fortiethPreview: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  saveLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#b42318',
  },
  backLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
