import { describe, it, expect } from 'vitest';
import { isoDay, ordersHeldToday, toggleOrder } from '../entities/StandingOrder.js';

const TODAY = new Date('2026-08-12T09:00:00Z');

describe('standing orders', () => {
  it('renders a date as a plain day key', () => expect(isoDay(TODAY)).toBe('2026-08-12'));

  it('holds nothing before anything is marked', () => {
    expect(ordersHeldToday({}, TODAY)).toEqual({ date: '2026-08-12', ids: [] });
  });

  it('marks an order held, then releases it', () => {
    const once = toggleOrder({}, 'water', TODAY);
    expect(ordersHeldToday(once, TODAY).ids).toContain('water');
    const twice = toggleOrder(once, 'water', TODAY);
    expect(ordersHeldToday(twice, TODAY).ids).not.toContain('water');
  });

  it('does not carry yesterday into today', () => {
    const yesterday = new Date('2026-08-11T09:00:00Z');
    const held = toggleOrder({}, 'water', yesterday);
    expect(ordersHeldToday(held, TODAY).ids).toEqual([]);
  });

  it('never mutates the map it is given', () => {
    const before = {};
    toggleOrder(before, 'water', TODAY);
    expect(before).toEqual({});
  });
});
