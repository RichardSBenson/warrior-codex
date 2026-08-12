import { describe, it, expect } from 'vitest';
import { emptyRecord, addSession, addOrderHeld, addTestPassed, daysSince } from '../entities/Record.js';

describe('the record', () => {
  it('starts empty', () => {
    const r = emptyRecord();
    expect(r.sessions).toBe(0);
    expect(r.orders).toBe(0);
    expect(r.tests).toBe(0);
    expect(r.lastSession).toBeNull();
  });

  it('never mutates the record it is given', () => {
    const before = emptyRecord();
    const after = addSession(before);
    expect(before.sessions).toBe(0);
    expect(after.sessions).toBe(1);
    expect(after).not.toBe(before);
  });

  it('counts sessions, orders and tests separately', () => {
    let r = emptyRecord();
    r = addSession(r); r = addOrderHeld(r); r = addTestPassed(r);
    expect([r.sessions, r.orders, r.tests]).toEqual([1, 1, 1]);
  });

  it('reads zero days since today', () => {
    expect(daysSince(new Date().toISOString())).toBe(0);
  });

  it('counts whole days elapsed', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(daysSince(threeDaysAgo)).toBe(3);
  });
});
