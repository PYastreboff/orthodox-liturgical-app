import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

export type SpringConfig = {
  damping: number;
  stiffness: number;
  mass: number;
};

/**
 * Apple's designer-facing spring (response in seconds, damping fraction) converted to the
 * physical mass/stiffness/damping triplet: k = (2π / response)², c = 4π·ζ / response.
 */
export function appleSpring(response: number, dampingFraction: number): SpringConfig {
  const omega = (2 * Math.PI) / response;
  return {
    mass: 1,
    stiffness: omega * omega,
    damping: 2 * dampingFraction * omega,
  };
}

/** Default UI spring — critically damped, settles without overshoot (response 0.35). */
export const UI_SPRING: SpringConfig = appleSpring(0.35, 1);

/** Drawers / sheets released with momentum — slight overshoot (Apple: 0.8 / 0.3). */
export const MOMENTUM_SPRING: SpringConfig = appleSpring(0.3, 0.8);

/** Gesture-driven settle (swipe-back, sheet snap-back) — critically damped. */
export const GESTURE_SPRING: SpringConfig = appleSpring(0.3, 1);

/** Reduced motion: faster and critically damped — no visible travel or bounce. */
export const REDUCED_SPRING: SpringConfig = appleSpring(0.2, 1);

/** Press-down feedback: quick ease-out to 0.97, released with UI_SPRING. */
export const PRESS_SCALE = 0.97;
export const PRESS_IN_MS = 100;

/**
 * Apple's momentum projection (Designing Fluid Interfaces): where a flick would come to
 * rest under scroll-like deceleration. Velocity in px/s.
 */
export function projectMomentum(velocity: number, decelerationRate = 0.998): number {
  'worklet';
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Progressive edge resistance instead of a hard stop. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  'worklet';
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

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
  momentumSpring: SpringConfig;
} {
  const reduceMotion = useReducedMotion();
  return {
    reduceMotion,
    spring: reduceMotion ? REDUCED_SPRING : GESTURE_SPRING,
    momentumSpring: reduceMotion ? REDUCED_SPRING : MOMENTUM_SPRING,
  };
}

function webPrefersReducedTransparency(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
}

/** Reduce Transparency (iOS) / prefers-reduced-transparency (web): solid chrome, no blur. */
export function useReducedTransparency(): boolean {
  const [reduced, setReduced] = useState(() =>
    Platform.OS === 'web' ? webPrefersReducedTransparency() : false,
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
      const query = window.matchMedia('(prefers-reduced-transparency: reduce)');
      const onChange = () => setReduced(query.matches);
      query.addEventListener?.('change', onChange);
      return () => query.removeEventListener?.('change', onChange);
    }
    if (Platform.OS !== 'ios') return;
    let alive = true;
    void AccessibilityInfo.isReduceTransparencyEnabled().then((value) => {
      if (alive) setReduced(value);
    });
    const sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduced);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  return reduced;
}
