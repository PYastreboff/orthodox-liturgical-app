import { LiturgicalLegendGuide } from './LiturgicalLegendGuide';

type Props = {
  textColor: string;
  mutedColor?: string;
  compact?: boolean;
};

export function CalendarColorLegend({ textColor, mutedColor, compact = false }: Props) {
  return (
    <LiturgicalLegendGuide
      textColor={textColor}
      mutedColor={mutedColor}
      variant="calendar"
      compact={compact}
    />
  );
}
