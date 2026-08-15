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
  /** 0 → 1 dark-to-dawn light level, mirrors the page's --light */
  light: 0,
  /**
   * Acts can push the dawn forward faster than page scroll alone.
   * Written every frame by the act that owns the moment; the engine
   * decays it back to 0 once nothing is asking.
   */
  lightBoost: 0,
  /** 0 → 1 the cloud-break reveal: lifts the aircraft out of the deck */
  reveal: 0,
};
