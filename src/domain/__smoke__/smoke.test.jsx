// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

afterEach(cleanup);
import { SplashScreen, TestListScreen, TestScreen, ResultsScreen } from '../../presentation/screens/AssessmentScreens.jsx';
import { SessionScreen } from '../../presentation/screens/TrainingScreens.jsx';
import ProvingGround from '../../presentation/screens/ProvingGround.jsx';
import Manuscript from '../../presentation/screens/Manuscript.jsx';
import WarmUpTimer from '../../presentation/components/WarmUpTimer.jsx';
import { CORE_TESTS } from '../entities/Trial.js';
import { RANKS } from '../entities/Rank.js';
import { resultsAtRank } from '../useCases/SeedStanding.js';
import { programFor } from '../../data/repositories/LocalProgramRepository.js';
import { getSession } from '../useCases/GetSession.js';

const noop = () => {};
const text = (c) => c.container.textContent;

describe('the assessment', () => {
  it('opens on the splash', () => {
    expect(text(render(<SplashScreen onStart={noop} />)).length).toBeGreaterThan(20);
  });

  it('lists the trials before any are done', () => {
    expect(text(render(<TestListScreen results={{}} onSelect={noop} onViewResults={noop} />))).toMatch(/ROOM|Room/i);
  });

  it.each(CORE_TESTS.map((t) => [t.id, t]))('opens trial %s', (_id, test) => {
    const c = render(<TestScreen test={test} index={0} onComplete={noop} onBack={noop} />);
    expect(text(c)).toContain(test.name);
  });

  it.each(CORE_TESTS.map((t) => [t.id, t]))('opens trial %s as a rank test', (_id, test) => {
    const c = render(<TestScreen test={test} index={0} onComplete={noop} onBack={noop}
      mode="ranktest" targetRankIndex={1} />);
    expect(text(c).length).toBeGreaterThan(20);
  });

  it.each(RANKS)('shows results for a warrior standing at %s', (rank) => {
    const c = render(<ResultsScreen results={resultsAtRank(rank)} onRestart={noop} onViewProgress={noop} />);
    expect(text(c).length).toBeGreaterThan(20);
  });
});

describe('training', () => {
  const program = programFor('Recruit');

  it('renders the warm-up', () => {
    expect(text(render(<WarmUpTimer warmUp={program.warmUp} onDone={noop} />))).toMatch(/WARM-UP/);
  });

  it('renders every session of every program without crashing', () => {
    for (const rank of ['Recruit', 'Soldier']) {
      const p = programFor(rank);
      for (let w = 1; w <= p.weeks; w++)
        for (let d = 1; d <= 7; d++) {
          const s = getSession(p, w, d);
          if (!s) continue;
          const c = render(<SessionScreen session={{ ...s, rank }} onBack={noop} onComplete={noop} />);
          expect(text(c)).toContain(s.dayName);
        }
    }
  });
});

describe('the admin screens', () => {
  it('renders the proving ground', () => {
    expect(text(render(<ProvingGround override={null} setOverride={noop} onOpenSession={noop}
      onReview={noop} onSeed={noop} onWipe={noop} onBack={noop} onDisable={noop} />)))
      .toMatch(/PROVING GROUND/);
  });

  it('renders the manuscript', () => {
    expect(text(render(<Manuscript onBack={noop} />))).toMatch(/MANUSCRIPT/);
  });
});
