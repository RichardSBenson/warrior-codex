import { describe, it, expect } from 'vitest';
import { browsingMode, trainingMode, TRAINING_ENLARGED_KEYS, MIN_TOUCH_TARGET } from '../theme.js';
import { colours, trainingFloors, a11y } from '../tokens.js';

/**
 * The design system is load-bearing. If training mode ever stops being larger
 * than browsing mode, the app becomes unreadable mid-session and nobody notices
 * until someone is squinting at a phone in the sun.
 */
describe('training mode typography', () => {
  it.each(TRAINING_ENLARGED_KEYS)('enlarges %s relative to browsing mode', (key) => {
    expect(trainingMode.type[key].size).toBeGreaterThan(browsingMode.type[key].size);
  });

  it.each(TRAINING_ENLARGED_KEYS)('holds %s at or above the protocol floor', (key) => {
    expect(trainingMode.type[key].size).toBeGreaterThanOrEqual(trainingFloors[key]);
  });

  it('changes nothing but type between the two modes', () => {
    expect(trainingMode.colours).toEqual(browsingMode.colours);
    expect(trainingMode.spacing).toEqual(browsingMode.spacing);
  });
});

describe('tokens', () => {
  it('exposes every colour the theme references', () => {
    for (const mode of [browsingMode, trainingMode])
      for (const style of Object.values(mode.type))
        expect(Object.values(colours)).toContain(style.colour);
  });

  it('every colour is a six digit hex', () => {
    for (const value of Object.values(colours)) expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('keeps the touch target at the accessibility floor', () => {
    expect(MIN_TOUCH_TARGET).toBe(a11y.touchTargetPx);
    expect(MIN_TOUCH_TARGET).toBeGreaterThanOrEqual(44);
  });
});
