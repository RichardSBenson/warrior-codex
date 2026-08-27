// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import App from '../../App.jsx';
import { resultsAtRank } from '../useCases/SeedStanding.js';
import { RANKS } from '../entities/Rank.js';

afterEach(cleanup);
beforeEach(() => localStorage.clear());

const seed = (rank) => {
  localStorage.setItem('codex_assessment_v1', JSON.stringify(resultsAtRank(rank)));
  localStorage.setItem('codex_start_v1', JSON.stringify(new Date(Date.now() - 14 * 86400000).toISOString()));
  localStorage.setItem('codex.dev', JSON.stringify({ enabled: true, override: null }));
};

/**
 * Component tests pass while the app is broken, because the app is the wiring.
 * These boot the real thing with real stored data and press the real buttons.
 */
describe('the whole app boots', () => {
  it('opens on the splash with nothing stored', () => {
    const { container } = render(<App />);
    expect(container.textContent.length).toBeGreaterThan(20);
  });

  it.each(RANKS)('opens for a warrior standing at %s', (rank) => {
    seed(rank);
    const { container } = render(<App />);
    expect(container.textContent.length).toBeGreaterThan(20);
  });

  it.each(RANKS)('opens the manuscript at %s', (rank) => {
    seed(rank);
    const { container, getByText } = render(<App />);
    fireEvent.click(getByText('MANUSCRIPT'));
    expect(container.textContent).toMatch(/MANUSCRIPT/);
    expect(container.textContent.length).toBeGreaterThan(200);
  });

  it.each(RANKS)('opens the proving ground at %s', (rank) => {
    seed(rank);
    const { container, getByText } = render(<App />);
    fireEvent.click(getByText('PROVING'));
    expect(container.textContent).toMatch(/PROVING GROUND/);
  });

  it.each(RANKS)('shows the trial list with a standing at %s', (rank) => {
    seed(rank);
    const { container, getByText } = render(<App />);
    fireEvent.click(getByText('SKIP TRIALS'));
    expect(container.textContent.length).toBeGreaterThan(20);
  });

  it('reaches a training session from the profile', () => {
    seed('Recruit');
    const { container, getByText } = render(<App />);
    fireEvent.click(getByText('PROVING'));
    expect(container.textContent).toMatch(/PROVING GROUND/);
    fireEvent.click(getByText('OPEN IN TRAINING SCREEN'));
    expect(container.textContent.length).toBeGreaterThan(20);
  });
});
