export type PrimaryCalendar = 'julian' | 'gregorian';

export type DateDisplayOptions = {
  primaryCalendar: PrimaryCalendar;
  /** When true, show the non-primary calendar alongside it. */
  showAlternateCalendar: boolean;
};

export type DateDisplayFlags = {
  showJulian: boolean;
  showGregorian: boolean;
  primaryCalendar: PrimaryCalendar;
};

export function getDateDisplayFlags(options: DateDisplayOptions): DateDisplayFlags {
  const { primaryCalendar, showAlternateCalendar } = options;
  return {
    primaryCalendar,
    showJulian: primaryCalendar === 'julian' || showAlternateCalendar,
    showGregorian: primaryCalendar === 'gregorian' || showAlternateCalendar,
  };
}

export type OrderedDateLine = {
  kind: 'julian' | 'gregorian';
  label: string;
};

export function orderedDateLines(
  flags: DateDisplayFlags,
  julianLabel: string,
  gregorianLabel: string,
): OrderedDateLine[] {
  const primary: OrderedDateLine = {
    kind: flags.primaryCalendar,
    label: flags.primaryCalendar === 'julian' ? julianLabel : gregorianLabel,
  };
  const lines = [primary];

  if (flags.showJulian && flags.showGregorian) {
    const alternate: OrderedDateLine = {
      kind: flags.primaryCalendar === 'julian' ? 'gregorian' : 'julian',
      label: flags.primaryCalendar === 'julian' ? gregorianLabel : julianLabel,
    };
    lines.push(alternate);
  }

  return lines;
}

export function numericDateHint(
  flags: DateDisplayFlags,
  julianNumeric: string,
  gregorianNumeric: string,
): string {
  if (flags.showJulian && flags.showGregorian) {
    return `Numeric: Julian ${julianNumeric} · Civil ${gregorianNumeric}`;
  }
  if (flags.showJulian) {
    return `Numeric: Julian ${julianNumeric}`;
  }
  return `Numeric: Civil ${gregorianNumeric}`;
}
