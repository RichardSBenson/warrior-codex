import { describe, it, expect } from 'vitest';
import { validateResults, validateStart, validateRecord, validateDev, validateHeld } from '../validate.js';
import { emptyRecord } from '../../../domain/entities/Record.js';

describe('assessment results', () => {
  it('keeps a known trial with a sane score', () => {
    expect(validateResults({ dand: 30 })).toEqual({ dand: 30 });
  });
  it('drops trials that do not exist', () => {
    expect(validateResults({ notATrial: 99, dand: 10 })).toEqual({ dand: 10 });
  });
  it('drops scores that are not finite numbers', () => {
    expect(validateResults({ dand: '30', baithak: NaN, horse: Infinity })).toEqual({});
  });
  it('drops negative scores', () => expect(validateResults({ dand: -5 })).toEqual({}));
  it('survives a non-object', () => expect(validateResults('nonsense')).toEqual({}));
  it('never carries a prototype key through', () => {
    const out = validateResults(JSON.parse('{"__proto__":{"polluted":true},"dand":5}'));
    expect(out).toEqual({ dand: 5 });
    expect({}.polluted).toBeUndefined();
  });
});

describe('the start date', () => {
  it('accepts a real past date', () => {
    expect(validateStart('2026-01-01T00:00:00.000Z')).toBe('2026-01-01T00:00:00.000Z');
  });
  it('rejects a future date, which would place you before week one', () => {
    expect(validateStart(new Date(Date.now() + 86400000).toISOString())).toBeNull();
  });
  it('rejects garbage', () => {
    expect(validateStart('not a date')).toBeNull();
    expect(validateStart(12345)).toBeNull();
  });
});

describe('the record', () => {
  it('clamps counters to whole non-negative numbers', () => {
    const r = validateRecord({ sessions: -4, orders: 2.7, tests: 'x' }, emptyRecord());
    expect(r).toMatchObject({ sessions: 0, orders: 2, tests: 0 });
  });
  it('falls back entirely for a non-object', () => {
    expect(validateRecord(null, emptyRecord())).toEqual(emptyRecord());
  });
});

describe('the proving ground override', () => {
  it('accepts a real rank inside real bounds', () => {
    expect(validateDev({ enabled: true, override: { rank: 'Soldier', week: 9, day: 3 } }))
      .toEqual({ enabled: true, override: { rank: 'Soldier', week: 9, day: 3 } });
  });
  it('refuses a rank that does not exist', () => {
    expect(validateDev({ enabled: true, override: { rank: 'Elite', week: 1, day: 1 } }).override).toBeNull();
  });
  it('refuses a week or day out of bounds', () => {
    for (const o of [{ week: 0, day: 1 }, { week: 999, day: 1 }, { week: 1, day: 9 }, { week: 1.5, day: 1 }])
      expect(validateDev({ enabled: true, override: { rank: 'Recruit', ...o } }).override).toBeNull();
  });
  it('stays off unless explicitly enabled', () => {
    expect(validateDev({ enabled: 'yes' })).toBeNull();
    expect(validateDev(null)).toBeNull();
  });
});

describe('orders held today', () => {
  it('keeps a valid day key and clean ids', () => {
    expect(validateHeld({ date: '2026-08-12', ids: ['water', 'sleep'] }))
      .toEqual({ date: '2026-08-12', ids: ['water', 'sleep'] });
  });
  it('drops ids that are not plain identifiers', () => {
    expect(validateHeld({ date: '2026-08-12', ids: ['ok', '<img onerror=1>', 42] }).ids).toEqual(['ok']);
  });
  it('rejects a malformed date key', () => {
    expect(validateHeld({ date: '12/08/2026', ids: [] })).toBeNull();
  });
});
