import { describe, it, expect } from 'vitest';
import recruit from '../../data/sources/recruitToSoldier.json';
import warrior from '../../data/sources/soldierToWarrior.json';
import exercises from '../../data/sources/exercises.json';
import { blockForWeek, getSession, totalSets } from '../useCases/GetSession.js';
import { RANKS } from '../entities/Rank.js';
import { PROGRAM_WEEKS } from '../entities/Program.js';

const PROGRAMS = [recruit, warrior];
const EX = new Set(exercises.map((e) => e.id));

describe.each(PROGRAMS)('$id', (program) => {
  it('runs for the length the rank ladder expects', () => {
    expect(program.weeks).toBe(PROGRAM_WEEKS[program.fromRank]);
  });

  it('climbs exactly one rung', () => {
    expect(RANKS[RANKS.indexOf(program.fromRank) + 1]).toBe(program.toRank);
  });

  it('has a block for every week', () => {
    for (let w = 1; w <= program.weeks; w++) expect(blockForWeek(program, w)).not.toBeNull();
  });

  it('never places a week in two blocks', () => {
    const seen = new Set();
    for (const b of program.blocks)
      for (const wk of b.weeks) { expect(seen.has(wk)).toBe(false); seen.add(wk); }
  });

  it('prescribes only exercises that exist', () => {
    for (const b of program.blocks)
      for (const d of b.days || [])
        for (const m of d.movements) expect(EX.has(m.movementId)).toBe(true);
  });

  it('gives every movement a positive set count and a numeric rest', () => {
    for (const b of program.blocks)
      for (const d of b.days || [])
        for (const m of d.movements) {
          expect(m.sets).toBeGreaterThan(0);
          expect(typeof m.rest).toBe('number');
          expect(['sets', 'hold', 'holdEach']).toContain(m.type);
        }
  });

  it('resolves a session for every training day of every week', () => {
    for (let w = 1; w <= program.weeks; w++) {
      const block = blockForWeek(program, w);
      if (block.test) continue;
      for (let d = 1; d <= 6; d++) expect(getSession(program, w, d)).not.toBeNull();
    }
  });

  it('ends on a test week whose final day is the rank test', () => {
    const last = blockForWeek(program, program.weeks);
    expect(last.test).toBe(true);
    const test = last.days.find((d) => d.dayName === 'TEST');
    expect(test.movements).toHaveLength(10);
  });
});

describe('soldier to warrior specifics', () => {
  it('reuses the harden block where the document says same structure', () => {
    const s = getSession(warrior, 11, 1);
    expect(s.reused).toBe(true);
    expect(s.dayName).toBe(getSession(warrior, 9, 1).dayName);
  });

  it('tapers two sets in week fifteen, not one', () => {
    const peak = getSession(warrior, 13, 1);
    const taper = getSession(warrior, 15, 1);
    taper.movements.forEach((m, i) => expect(m.sets).toBe(Math.max(1, peak.movements[i].sets - 2)));
    expect(totalSets(taper)).toBeLessThan(totalSets(peak));
  });

  it('authors all six days of weeks five and six from the source document', () => {
    for (let d = 1; d <= 6; d++) expect(getSession(warrior, 5, d).reused).toBe(false);
    expect(getSession(warrior, 5, 4).movements[0].name).toBe('Hindu Burpee');
  });

  it('rests on Wednesday and Friday of test week', () => {
    expect(getSession(warrior, 16, 3)).toBeNull();
    expect(getSession(warrior, 16, 5)).toBeNull();
    expect(getSession(warrior, 16, 4).dayName).toBe('TEST');
  });
});
