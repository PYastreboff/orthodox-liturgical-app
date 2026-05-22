import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import { colors } from './tokens';

export const navigationThemeLight = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accentGold,
    background: colors.parchment,
    card: colors.card,
    text: colors.ink,
    border: colors.border,
    notification: colors.accentWine,
  },
};

export const navigationThemeDark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accentGold,
    background: colors.darkBg,
    card: colors.darkSurface,
    text: colors.darkInk,
    border: colors.darkBorder,
    notification: colors.accentWine,
  },
};
