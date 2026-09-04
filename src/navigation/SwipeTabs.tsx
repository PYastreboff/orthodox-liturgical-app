import {
  createMaterialTopTabNavigator,
  type MaterialTopTabNavigationEventMap,
  type MaterialTopTabNavigationOptions,
} from "expo-router/js-top-tabs";
import type {
  ParamListBase,
  TabNavigationState,
} from "expo-router/react-navigation";
import { withLayoutContext } from 'expo-router';

const { Navigator } = createMaterialTopTabNavigator();

/** Bottom tabs that can be swiped between (Today ↔ Calendar ↔ Prayers ↔ Liturgy ↔ Settings). */
export const SwipeTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);
