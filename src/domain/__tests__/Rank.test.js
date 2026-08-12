import { describe, it, expect } from 'vitest';
import { RANKS, RANK_COLORS, REVEAL_FLAVOR, RANK_LORE, rankIndex, nextRank, isMaxRank, rankForTest } from '../entities/Rank.js';
import { CORE_TESTS } from '../entities/Trial.js';

describe('the ladder', () => {
  it('is exactly six rungs', () => expect(RANKS).toHaveLength(6));

  it('runs Recruit to Legend in order', () => {
    expect(RANKS).toEqual(['Recruit', 'Soldier', 'Warrior', 'Veteran', 'Warlord', 'Legend']);
  });

  it('names rank four Veteran', () => expect(RANKS[3]).toBe('Veteran'));

  it.each(['RANK_COLORS', 'REVEAL_FLAVOR', 'RANK_LORE'])('%s covers every rank', (name) => {
    const table = { RANK_COLORS, REVEAL_FLAVOR, RANK_LORE }[name];
    for (const rank of RANKS) expect(table[rank]).toBeDefined();
  });

  it('finds the index of every rank', () => {
    RANKS.forEach((r, i) => expect(rankIndex(r)).toBe(i));
  });

  it('returns -1 for a rank that does not exist', () => expect(rankIndex('Elite')).toBe(-1));

  it('clamps nextRank at the top', () => {
    expect(nextRank(0)).toBe('Soldier');
    expect(nextRank(5)).toBe('Legend');
    expect(nextRank(99)).toBe('Legend');
  });

  it('knows the ceiling', () => {
    expect(isMaxRank(5)).toBe(true);
    expect(isMaxRank(4)).toBe(false);
  });
});

describe('rankForTest', () => {
  /* Returns a rank INDEX, not a name. 0 = Recruit, 5 = Legend. */

  it('awards the exact rank when a threshold is hit precisely', () => {
    for (const trial of CORE_TESTS)
      trial.thresholds.forEach((value, i) => {
        expect(rankForTest(trial, value)).toBe(i);
      });
  });

  it('never exceeds Legend however far past the top standard', () => {
    for (const trial of CORE_TESTS) {
      const beyond = trial.higher ? trial.thresholds[5] * 10 : 1;
      expect(rankForTest(trial, beyond)).toBe(5);
    }
  });

  it('falls to Recruit for a missing or unscored value', () => {
    expect(rankForTest(CORE_TESTS[0], undefined)).toBe(0);
    expect(rankForTest(CORE_TESTS[0], null)).toBe(0);
  });
});
