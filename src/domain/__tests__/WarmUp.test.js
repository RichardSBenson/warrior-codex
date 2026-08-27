import { describe, it, expect } from 'vitest';
import { normaliseWarmUp, stepAt, poseAt, roundsIn } from '../entities/WarmUp.js';
import surya from '../../data/sources/suryaNamaskar.json';
import recruit from '../../data/sources/recruitToSoldier.json';
import warrior from '../../data/sources/soldierToWarrior.json';

describe('normalising a warm-up', () => {
  it('reads the structured form and totals it', () => {
    const w = normaliseWarmUp({ steps: [{ name: 'A', seconds: 300 }, { name: 'B', seconds: 180 }] });
    expect(w.steps).toHaveLength(2);
    expect(w.totalSeconds).toBe(480);
  });

  it('still accepts the old sentence form as one untimed step', () => {
    const w = normaliseWarmUp('5 minutes Surya Namaskar, then stretching.');
    expect(w.steps).toHaveLength(1);
    expect(w.totalSeconds).toBe(0);
  });

  it('survives nothing at all', () => {
    expect(normaliseWarmUp(null)).toEqual({ steps: [], note: '', totalSeconds: 0 });
  });

  it('drops steps with no name and clamps bad durations', () => {
    const w = normaliseWarmUp({ steps: [{ seconds: 60 }, { name: 'A', seconds: -9 }, { name: 'B', seconds: NaN }] });
    expect(w.steps.map((s) => s.name)).toEqual(['A', 'B']);
    expect(w.totalSeconds).toBe(0);
  });
});

describe('finding the current step', () => {
  const steps = [{ name: 'A', seconds: 300 }, { name: 'B', seconds: 180 }];

  it('starts in the first step', () => {
    expect(stepAt(steps, 0)).toMatchObject({ index: 0, left: 300 });
  });

  it('counts down inside a step', () => {
    expect(stepAt(steps, 120)).toMatchObject({ index: 0, into: 120, left: 180 });
  });

  it('rolls into the next step at the boundary', () => {
    expect(stepAt(steps, 300)).toMatchObject({ index: 1, into: 0, left: 180 });
  });

  it('reports complete once every step is spent', () => {
    expect(stepAt(steps, 480).complete).toBe(true);
  });

  it('never returns a negative remainder', () => {
    expect(stepAt(steps, 99999).left).toBe(0);
    expect(stepAt(steps, -50).index).toBe(0);
  });
});

describe('the programs carry a timed warm-up', () => {
  it.each([['Recruit', recruit, 480], ['Soldier', warrior, 600]])(
    '%s opens with a warm-up of the right length', (_name, program, seconds) => {
      const w = normaliseWarmUp(program.warmUp);
      expect(w.totalSeconds).toBe(seconds);
      expect(w.steps[0].name).toBe('Surya Namaskar');
      expect(w.note).toBeTruthy();
    });

  it('gives every step a cue to follow', () => {
    for (const program of [recruit, warrior])
      for (const s of normaliseWarmUp(program.warmUp).steps) expect(s.cue).toBeTruthy();
  });

  it('carries a cool-down too', () => {
    for (const program of [recruit, warrior])
      expect(normaliseWarmUp(program.coolDown).totalSeconds).toBeGreaterThan(0);
  });
});

describe('walking the Surya Namaskar sequence', () => {
  const poses = surya.poses;
  const per = surya.secondsPerPose;

  it('has the twelve poses in the traditional order', () => {
    expect(poses).toHaveLength(12);
    expect(poses.map((p) => p.sanskrit)).toEqual([
      'Pranamasana', 'Hastauttanasana', 'Hastapadasana', 'Ashwa Sanchalanasana',
      'Dandasana', 'Ashtanga Namaskara', 'Bhujangasana', 'Adho Mukha Svanasana',
      'Ashwa Sanchalanasana', 'Hastapadasana', 'Hastauttanasana', 'Tadasana',
    ]);
  });

  it('gives every pose a breath, an English name and a cue', () => {
    for (const p of poses) {
      expect(['in', 'out', 'settle']).toContain(p.breath);
      expect(p.english).toBeTruthy();
      expect(p.cue).toBeTruthy();
    }
  });

  it('starts at the prayer pose', () => {
    expect(poseAt(poses, 0, per).pose.sanskrit).toBe('Pranamasana');
  });

  it('advances one pose per interval', () => {
    expect(poseAt(poses, per, per).index).toBe(1);
    expect(poseAt(poses, per * 7, per).index).toBe(7);
  });

  it('counts down within a pose', () => {
    expect(poseAt(poses, 0, per).left).toBe(per);
    expect(poseAt(poses, 2, per).left).toBe(per - 2);
  });

  it('leads with the right leg on the first set and the left on the second', () => {
    expect(poseAt(poses, 0, per).leadLeg).toBe('right');
    expect(poseAt(poses, 12 * per, per).leadLeg).toBe('left');
    expect(poseAt(poses, 24 * per, per).leadLeg).toBe('right');
  });

  it('counts two sets as one round', () => {
    expect(poseAt(poses, 0, per).round).toBe(1);
    expect(poseAt(poses, 12 * per, per).round).toBe(1);
    expect(poseAt(poses, 24 * per, per).round).toBe(2);
  });

  it('marks only the two equestrian poses as leg-leading', () => {
    expect(poses.filter((p) => p.leads).map((p) => p.n)).toEqual([4, 9]);
  });

  it('fits complete rounds inside the prescribed warm-up', () => {
    expect(roundsIn(300, poses.length, per)).toBe(2);
    expect(roundsIn(360, poses.length, per)).toBe(3);
  });

  it('returns nothing rather than throwing when there are no poses', () => {
    expect(poseAt([], 10, per)).toBeNull();
    expect(poseAt(null, 10, per)).toBeNull();
  });
});
