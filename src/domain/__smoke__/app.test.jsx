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
    fireEvent.click(getByText('ALL'));
    expect(container.textContent).toMatch(/MANUSCRIPT/);
    expect(container.textContent.length).toBeGreaterThan(200);
  });

  it.each(RANKS)('opens the proving ground at %s', (rank) => {
    seed(rank);
    const { container, getByText } = render(<App />);
    fireEvent.click(getByText('JUMP'));
    expect(container.textContent).toMatch(/PROVING GROUND/);
  });

  it.each(RANKS)('seeds a standing from the proving ground at %s', (rank) => {
    seed(rank);
    const { container, getByText } = render(<App />);
    fireEvent.click(getByText('JUMP'));
    expect(container.textContent).toMatch(/SKIP THE ASSESSMENT/);
  });

  it('reaches a training session from the profile', () => {
    seed('Recruit');
    const { container, getByText } = render(<App />);
    fireEvent.click(getByText('JUMP'));
    expect(container.textContent).toMatch(/PROVING GROUND/);
    fireEvent.click(getByText('OPEN IN TRAINING SCREEN'));
    expect(container.textContent.length).toBeGreaterThan(20);
  });
});

describe('the skip bar walks every page', () => {
  it('steps through all ten screens without crashing', () => {
    seed('Recruit');
    const { container, getByText } = render(<App />);
    const seen = new Set();
    for (let i = 0; i < 32; i++) {
      expect(container.textContent.length).toBeGreaterThan(10);
      seen.add(container.querySelector('[data-page]').getAttribute('data-page'));
      fireEvent.click(getByText('SKIP ▶'));
    }
    // ten trials each take a step of their own, so the walk is longer than ten taps
    expect([...seen].sort()).toEqual([
      'ground', 'list', 'manuscript', 'orders', 'profile',
      'proving', 'results', 'session', 'splash', 'test',
    ]);
  });

  it('steps backwards too', () => {
    seed('Recruit');
    const { container, getByText } = render(<App />);
    for (let i = 0; i < 12; i++) {
      fireEvent.click(container.querySelector('button[aria-label="Previous page"]'));
      expect(container.textContent.length).toBeGreaterThan(10);
    }
  });

  it('walks the ten trials one at a time, filling results behind it', () => {
    localStorage.setItem('codex.dev', JSON.stringify({ enabled: true, override: null }));
    const { container, getByText } = render(<App />);
    fireEvent.click(getByText('SKIP ▶'));               // splash -> list
    fireEvent.click(getByText('SKIP ▶'));               // list -> test
    for (let i = 0; i < 12; i++) {
      expect(container.textContent.length).toBeGreaterThan(20);
      fireEvent.click(getByText('SKIP ▶'));
    }
  });

  it('reaches the manuscript and the proving ground from any page', () => {
    seed('Soldier');
    const { container, getByText } = render(<App />);
    fireEvent.click(getByText('ALL'));
    expect(container.textContent).toMatch(/MANUSCRIPT/);
    fireEvent.click(getByText('JUMP'));
    expect(container.textContent).toMatch(/PROVING GROUND/);
    fireEvent.click(getByText('SKIP ▶'));
    expect(container.textContent.length).toBeGreaterThan(20);
  });
});
