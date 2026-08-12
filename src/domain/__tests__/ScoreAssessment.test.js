import { describe, it, expect } from 'vitest';
import { completedTests, remainingTests, roomComplete, allComplete, overallRank } from '../useCases/ScoreAssessment.js';
import { CORE_TESTS, ROOM_IDS } from '../entities/Trial.js';
import { RANKS } from '../entities/Rank.js';

const atRank = (i) => Object.fromEntries(CORE_TESTS.map((t) => [t.id, t.thresholds[i]]));

describe('assessment scoring', () => {
  it('counts nothing completed at the start', () => {
    expect(completedTests({})).toHaveLength(0);
    expect(remainingTests({})).toHaveLength(CORE_TESTS.length);
  });

  it('knows when the room trials are done', () => {
    expect(roomComplete({})).toBe(false);
    const room = Object.fromEntries(ROOM_IDS.map((id) => [id, 1]));
    expect(roomComplete(room)).toBe(true);
  });

  it('knows when every trial is done', () => {
    expect(allComplete(atRank(0))).toBe(true);
    expect(allComplete({})).toBe(false);
  });

  it('awards the rank every trial clears', () => {
    RANKS.forEach((_, i) => expect(overallRank(atRank(i))).toBe(i));
  });

  it('is held down by its weakest trial', () => {
    const results = atRank(4);
    results[CORE_TESTS[0].id] = CORE_TESTS[0].thresholds[0];
    expect(overallRank(results)).toBe(0);
  });

  it('does not drag an untested warrior to Recruit', () => {
    const one = { [CORE_TESTS[0].id]: CORE_TESTS[0].thresholds[4] };
    expect(overallRank(one)).toBe(4);
  });
});
