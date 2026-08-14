/**
 * Shared aircraft state. Acts write to it from their frame callback; the single
 * page-level WebGL stage reads it. Plain mutable object — never React state.
 */
export const uav = {
  /** 0 → 1 position along the master flight curve */
  t: 0,
  /** 0 → 1 how present the aircraft is on screen */
  weight: 0,
  /** extra bank applied during manoeuvres */
  bank: 0,
  /** suppression release progress, 0 when idle */
  release: 0,
};
