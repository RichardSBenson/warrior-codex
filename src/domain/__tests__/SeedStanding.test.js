import { describe, it, expect } from 'vitest';
import { resultsAtRank, startDateForWeek } from '../useCases/SeedStanding.js';
import { overallRank } from '../useCases/ScoreAssessment.js';
import { roomComplete, allComplete } from '../useCases/ScoreAssessment.js';
import { CORE_TESTS } from '../entities/Trial.js';
import { RANKS } from '../entities/Rank.js';
import { weekNumber } from '../useCases/GetSession.js';

describe('seeding a standing', () => {
  it('fills every trial', () => {
    expect(Object.keys(resultsAtRank('Soldier'))).toHaveLength(CORE_TESTS.length);
  });

  it('lands exactly on the rank asked for, never one either side', () => {
    RANKS.forEach((rank, i) => expect(overallRank(resultsAtRank(rank))).toBe(i));
  });

  it('completes both the room and the full assessment', () => {
    expect(roomComplete(resultsAtRank('Recruit'))).toBe(true);
    expect(allComplete(resultsAtRank('Recruit'))).toBe(true);
  });

  it('returns nothing for a rank that does not exist', () => {
    expect(resultsAtRank('Elite')).toEqual({});
  });
});

describe('the start date for a week', () => {
  const today = new Date('2026-08-13T12:00:00Z');

  it('puts week one at today', () => {
    expect(weekNumber(startDateForWeek(1, today), today)).toBe(1);
  });

  it('backdates so the chosen week is the current one', () => {
    for (const w of [1, 5, 9, 12, 16])
      expect(weekNumber(startDateForWeek(w, today), today)).toBe(w);
  });

  it('never returns a future date', () => {
    expect(new Date(startDateForWeek(0, today)).getTime()).toBeLessThanOrEqual(today.getTime());
  });
});
