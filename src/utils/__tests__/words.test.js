import { describe, it, expect } from 'vitest';
import { countWord } from '../words.js';
import { ROOM_IDS, CORE_TESTS, TIERS } from '../../domain/entities/Trial.js';

describe('countWord', () => {
  it('writes small numbers as words', () => {
    expect(countWord(5)).toBe('five');
    expect(countWord(10)).toBe('ten');
  });
  it('falls back to the numeral past its range', () => expect(countWord(40)).toBe('40'));
});

describe('the trial groups', () => {
  it('holds five trials in The Room', () => expect(ROOM_IDS).toHaveLength(5));

  it('accounts for every trial in exactly one tier', () => {
    const counted = TIERS.reduce((n, t) => n + CORE_TESTS.filter((c) => c.group === t.key).length, 0);
    expect(counted).toBe(CORE_TESTS.length);
  });
});
