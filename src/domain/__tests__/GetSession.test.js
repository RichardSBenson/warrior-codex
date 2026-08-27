import { describe, it, expect } from 'vitest';
import program from '../../data/sources/recruitToSoldier.json';
import exercises from '../../data/sources/exercises.json';
import { weekNumber, dayNumber, positionFor, blockForWeek, getSession, todaysSession, totalSets } from '../useCases/GetSession.js';

const EX_IDS = new Set(exercises.map((e) => e.id));

describe('the program', () => {
  it('covers all twelve weeks with no gaps', () => {
    for (let w = 1; w <= program.weeks; w++) expect(blockForWeek(program, w)).not.toBeNull();
  });

  it('runs six sessions a week in every training block', () => {
    for (const b of program.blocks) {
      if (b.taperFrom || b.phase === 'Test') continue;
      expect(b.days.map((d) => d.dayNumber)).toEqual([1, 2, 3, 4, 5, 6]);
    }
  });

  it('prescribes only exercises that exist', () => {
    for (const b of program.blocks)
      for (const d of b.days || [])
        for (const m of d.movements) expect(EX_IDS.has(m.movementId)).toBe(true);
  });

  it('gives every movement sets, a rest and a type', () => {
    for (const b of program.blocks)
      for (const d of b.days || [])
        for (const m of d.movements) {
          expect(m.sets).toBeGreaterThan(0);
          expect(typeof m.rest).toBe('number');
          expect(['sets', 'hold', 'holdEach']).toContain(m.type);
        }
  });

  it('opens with a timed Surya Namaskar', () => {
    expect(program.warmUp.steps[0].name).toBe('Surya Namaskar');
    expect(program.warmUp.steps[0].seconds).toBeGreaterThan(0);
  });
});

describe('placing you in the program', () => {
  const start = '2026-01-01T00:00:00.000Z';
  it('puts day one in week one', () => {
    expect(weekNumber(start, new Date('2026-01-01T10:00:00Z'))).toBe(1);
  });
  it('rolls to week two after seven days', () => {
    expect(weekNumber(start, new Date('2026-01-08T10:00:00Z'))).toBe(2);
  });
  it('never returns week zero', () => {
    expect(weekNumber(start, new Date('2025-12-01T10:00:00Z'))).toBe(1);
  });
  it('reads Sunday as day seven', () => {
    expect(dayNumber(new Date('2026-08-16T10:00:00'))).toBe(7);
  });
  it('reads Monday as day one', () => {
    expect(dayNumber(new Date('2026-08-10T10:00:00'))).toBe(1);
  });
});

describe('todays session', () => {
  it('returns a full session for a training day', () => {
    const s = getSession(program, 1, 1);
    expect(s.dayName).toBe('STRIKE');
    expect(s.movements.length).toBeGreaterThan(0);
    expect(s.warmUp).toBeTruthy();
  });

  it('rests on the seventh day', () => {
    const s = todaysSession(program, '2026-01-01T00:00:00.000Z', new Date('2026-08-16T10:00:00'));
    expect(s.rest).toBe(true);
  });

  it('counts every prescribed set', () => {
    expect(totalSets(getSession(program, 1, 1))).toBe(15);
  });
});

describe('the taper', () => {
  const peak = getSession(program, 9, 1);
  const taper = getSession(program, 11, 1);

  it('borrows the peak block rather than inventing a week', () => {
    expect(taper.dayName).toBe(peak.dayName);
    expect(taper.tapered).toBe(true);
  });

  it('cuts a set from every movement', () => {
    taper.movements.forEach((m, i) => expect(m.sets).toBe(Math.max(1, peak.movements[i].sets - 1)));
  });

  it('never drops a movement below a single set', () => {
    for (const m of taper.movements) expect(m.sets).toBeGreaterThanOrEqual(1);
  });

  it('reduces total volume', () => {
    expect(totalSets(taper)).toBeLessThan(totalSets(peak));
  });
});

describe('the proving ground override', () => {
  const start = '2026-01-01T00:00:00.000Z';

  it('reads the calendar when there is no override', () => {
    const p = positionFor(start, new Date('2026-01-08T10:00:00Z'), null);
    expect(p).toMatchObject({ week: 2, overridden: false });
  });

  it('stands wherever the override says', () => {
    const p = positionFor(start, new Date('2026-01-08T10:00:00Z'), { week: 9, day: 3 });
    expect(p).toMatchObject({ week: 9, day: 3, overridden: true });
  });

  it('returns the session for that position, not today', () => {
    const s = todaysSession(program, start, new Date('2026-01-02T10:00:00Z'), { week: 9, day: 6 });
    expect(s.week).toBe(9);
    expect(s.dayName).toBe('GAMES');
  });

  it('marks the session as overridden so nothing mistakes it for today', () => {
    const s = todaysSession(program, start, new Date(), { week: 5, day: 1 });
    expect(s.overridden).toBe(true);
  });

  it('still rests on day seven, override or not', () => {
    expect(todaysSession(program, start, new Date(), { week: 3, day: 7 }).rest).toBe(true);
  });

  it('walks every week and day of the program without throwing', () => {
    for (let w = 1; w <= program.weeks; w++)
      for (let d = 1; d <= 7; d++)
        expect(() => todaysSession(program, start, new Date(), { week: w, day: d })).not.toThrow();
  });
});
