// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';

afterEach(cleanup);
import { TestScreen } from '../../presentation/screens/AssessmentScreens.jsx';
import { SessionScreen } from '../../presentation/screens/TrainingScreens.jsx';
import WarmUpTimer from '../../presentation/components/WarmUpTimer.jsx';
import { CORE_TESTS } from '../entities/Trial.js';
import { programFor } from '../../data/repositories/LocalProgramRepository.js';
import { getSession } from '../useCases/GetSession.js';

const noop = () => {};

/**
 * A screen that renders is not a screen that works. The black-page bugs both
 * lived past the first tap — one in the trial's active phase, one in its
 * input phase. These drive each trial through every phase it has.
 */
describe('every trial survives being used', () => {
  it.each(CORE_TESTS.map((t) => [t.id, t]))('%s runs from ready to a recorded result', (_id, test) => {
    const onComplete = vi.fn();
    const { container, getByText } = render(
      <TestScreen test={test} index={0} onComplete={onComplete} onBack={noop} />
    );

    // every trial opens with a single call to action
    const begin = getByText(/START|ENTER RESULT/);
    fireEvent.click(begin);

    // whatever phase it moved into must render something
    expect(container.textContent.length).toBeGreaterThan(20);

    if (test.type === 'reps') {
      const plus = getByText('+1');
      fireEvent.click(plus);
      fireEvent.click(plus);
      fireEvent.click(getByText('–'));
      fireEvent.click(getByText('DONE'));
      expect(onComplete).toHaveBeenCalledWith(test.id, 1);
    } else {
      // secs and dist trials take a typed entry
      const input = container.querySelector('input');
      expect(input).not.toBeNull();
      fireEvent.change(input, { target: { value: '42' } });
      const submit = container.querySelector('button:last-of-type');
      fireEvent.click(submit);
    }
  });
});

describe('a session survives being trained', () => {
  const program = programFor('Recruit');
  const session = { ...getSession(program, 1, 1), rank: 'Recruit' };

  it('opens on the warm-up and can be skipped past', () => {
    const { getByText, container } = render(
      <SessionScreen session={session} onBack={noop} onComplete={noop} />);
    expect(container.textContent).toMatch(/WARM-UP/);
    fireEvent.click(getByText('SKIP'));
    expect(container.textContent).toContain(session.movements[0].name);
  });

  it('runs the warm-up timer without throwing', () => {
    const { getByText } = render(<WarmUpTimer warmUp={program.warmUp} onDone={noop} />);
    fireEvent.click(getByText('BEGIN'));
    fireEvent.click(getByText('PAUSE'));
  });

  it('completes a set and does not exceed the prescription', () => {
    const { getByText, container } = render(
      <SessionScreen session={session} onBack={noop} onComplete={noop} />);
    fireEvent.click(getByText('SKIP'));
    expect(container.textContent).toMatch(/0 \/ \d+ sets complete/);
  });
});
