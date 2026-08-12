import { describe, it, expect } from 'vitest';
import { testDateFor, weeksTrained, TEST_DATE_CREED } from '../useCases/TestSchedule.js';
import { RANKS } from '../entities/Rank.js';

const START = '2026-01-01T00:00:00.000Z';

describe('the test date', () => {
  it('does not move', () => expect(TEST_DATE_CREED).toBe('The date does not move.'));

  it('returns a full schedule, not just a date', () => {
    const s = testDateFor('Recruit', START);
    expect(s).toMatchObject({
      weeks: expect.any(Number),
      sessions: expect.any(Number),
      daysLeft: expect.any(Number),
      testingFor: 'Soldier',
    });
    expect(s.date).toBeInstanceOf(Date);
  });

  it('puts the date after the start', () => {
    const s = testDateFor('Recruit', START);
    expect(s.date.getTime()).toBeGreaterThan(new Date(START).getTime());
  });

  it('names the rank being tested for, one rung up', () => {
    RANKS.slice(0, 5).forEach((rank, i) => {
      const s = testDateFor(rank, START);
      if (s) expect(s.testingFor).toBe(RANKS[i + 1]);
    });
  });

  it('returns null without a start date', () => {
    expect(testDateFor('Recruit', null)).toBeNull();
  });
});

describe('weeks trained', () => {
  it('reads zero on day one', () => {
    expect(weeksTrained(new Date().toISOString())).toBe(0);
  });

  it('counts whole weeks only', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();
    expect(weeksTrained(tenDaysAgo)).toBe(1);
  });
});
