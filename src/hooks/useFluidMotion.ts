import { useReducedMotion } from 'react-native-reanimated';

export type SpringConfig = {
  damping: number;
  stiffness: number;
  mass: number;
};

/** Apple-style gesture spring: near-critical damping, crisp settle without sag. */
export const GESTURE_SPRING: SpringConfig = { damping: 22, stiffness: 260, mass: 0.9 };

/** Reduced-motion spring: critically damped and faster — no visible bounce. */
export const REDUCED_SPRING: SpringConfig = { damping: 30, stiffness: 460, mass: 0.7 };

/**
 * Reduced-motion aware helpers.
 *
 * Sensorimotor (reduce-motion / reduce-transparency) users still need
 * feedback — but a gentle, non-vestibular equivalent: cross-fades and
 * short, bounce-free settles instead of slides and elastic springs.
 */
export function useFluidMotion(): {
  reduceMotion: boolean;
  spring: SpringConfig;
} {
  const reduceMotion = useReducedMotion();
  return {
    reduceMotion,
    spring: reduceMotion ? REDUCED_SPRING : GESTURE_SPRING,
  };
}