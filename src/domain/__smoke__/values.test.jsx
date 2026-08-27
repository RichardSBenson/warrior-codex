// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { TestScreen, TestListScreen, ResultsScreen } from '../../presentation/screens/AssessmentScreens.jsx';
import { CORE_TESTS } from '../entities/Trial.js';
import { displayValue } from '../../design/uiKit.js';

afterEach(cleanup);
const noop = () => {};

describe('a value entered by hand survives being displayed', () => {
  it.each(CORE_TESTS.map((t) => [t.id, t]))('%s', (_id, test) => {
    const onComplete = vi.fn();
    const { getByText, container } = render(
      <TestScreen test={test} index={0} onComplete={onComplete} onBack={noop} />);
    fireEvent.click(getByText(/START|ENTER RESULT/));
    if (test.type === 'reps') {
      fireEvent.click(getByText('+1'));
      fireEvent.click(getByText('DONE'));
    } else {
      fireEvent.change(container.querySelector('input'), { target: { value: '1.8' } });
      fireEvent.click(getByText('RECORD'));
    }
    expect(onComplete).toHaveBeenCalled();
    const [, value] = onComplete.mock.calls[0];
    expect(typeof value).toBe('number');
    expect(() => displayValue(test, value)).not.toThrow();
  });
});

describe('the list and results screens format every trial', () => {
  const mixed = Object.fromEntries(CORE_TESTS.map((t) => [t.id, t.thresholds[2]]));
  it('trial list', () => {
    expect(() => render(<TestListScreen results={mixed} onSelect={noop} onViewResults={noop} />)).not.toThrow();
  });
  it('results', () => {
    expect(() => render(<ResultsScreen results={mixed} onRestart={noop} onViewProgress={noop} />)).not.toThrow();
  });
});

describe('a stored value that is not a number cannot take a screen down', () => {
  const broken = { dand: 'thirty', broadjump: '1.8', horse: null, pullups: undefined, run: NaN };
  it('the trial list survives it', () => {
    expect(() => render(<TestListScreen results={broken} onSelect={noop} onViewResults={noop} />)).not.toThrow();
  });
  it('displayValue returns a dash rather than throwing', () => {
    for (const t of CORE_TESTS) {
      expect(() => displayValue(t, 'nonsense')).not.toThrow();
      expect(displayValue(t, 'nonsense')).toBe('—');
      expect(() => displayValue(t, null)).not.toThrow();
    }
  });
  it('records the broad jump to two decimals rather than whole metres', () => {
    const bj = CORE_TESTS.find((t) => t.type === 'dist');
    expect(displayValue(bj, 1.8)).toBe('1.80m');
  });
});
