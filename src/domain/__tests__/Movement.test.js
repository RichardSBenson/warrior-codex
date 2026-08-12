import { describe, it, expect } from 'vitest';
import { MOVEMENTS, getMovement, allMovements, movementIds, TRIAL_MOVEMENT } from '../entities/Movement.js';
import { CORE_TESTS } from '../entities/Trial.js';

describe('the movement registry', () => {
  it('keys every movement by its own id', () => {
    for (const [key, m] of Object.entries(MOVEMENTS)) expect(m.id).toBe(key);
  });

  it('names every movement and its tradition', () => {
    for (const m of allMovements()) {
      expect(m.name).toBeTruthy();
      expect(m.culture).toBeTruthy();
    }
  });

  it('returns null rather than throwing for an unknown id', () => {
    expect(getMovement('nonexistent')).toBeNull();
  });

  it('lists ids matching the registry keys', () => {
    expect(movementIds().sort()).toEqual(Object.keys(MOVEMENTS).sort());
  });

  it('maps every trial to a movement that exists', () => {
    for (const t of CORE_TESTS) {
      const id = TRIAL_MOVEMENT[t.id];
      if (id) expect(getMovement(id)).not.toBeNull();
    }
  });
});
