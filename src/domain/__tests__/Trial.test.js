import { describe, it, expect } from 'vitest';
import { CORE_TESTS, TIERS, ROOM_IDS, testById } from '../entities/Trial.js';
import { RANKS } from '../entities/Rank.js';

const GROUPS = TIERS.map((t) => t.key);

describe('the trials', () => {
  it('has a threshold for every rank on every trial', () => {
    for (const t of CORE_TESTS) expect(t.thresholds).toHaveLength(RANKS.length);
  });

  it('gives every trial a unique id', () => {
    const ids = CORE_TESTS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('places every trial in a declared tier', () => {
    for (const t of CORE_TESTS) expect(GROUPS).toContain(t.group);
  });

  it('moves thresholds in the direction the trial is scored', () => {
    for (const t of CORE_TESTS)
      for (let i = 1; i < t.thresholds.length; i++)
        t.higher
          ? expect(t.thresholds[i]).toBeGreaterThan(t.thresholds[i - 1])
          : expect(t.thresholds[i]).toBeLessThan(t.thresholds[i - 1]);
  });

  it('states what each trial needs and how it is measured', () => {
    for (const t of CORE_TESTS) {
      expect(t.needs).toBeTruthy();
      expect(t.unit).toBeTruthy();
      expect(typeof t.higher).toBe('boolean');
    }
  });

  it('finds a trial by id and returns undefined for an unknown one', () => {
    expect(testById(CORE_TESTS[0].id)).toBe(CORE_TESTS[0]);
    expect(testById('nonexistent')).toBeUndefined();
  });

  it('lists only room trials in ROOM_IDS', () => {
    for (const id of ROOM_IDS) expect(testById(id).group).toBe('room');
  });
});
