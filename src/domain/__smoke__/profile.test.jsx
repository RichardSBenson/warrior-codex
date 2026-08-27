// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import ProfileScreen from '../../presentation/screens/ProfileScreen.jsx';
import OrdersScreen from '../../presentation/screens/OrdersScreen.jsx';
import { RANKS } from '../entities/Rank.js';
import { resultsAtRank } from '../useCases/SeedStanding.js';
import { emptyRecord } from '../entities/Record.js';
import { defaultOrders } from '../entities/StandingOrder.js';
import { theWall } from '../useCases/ScoreAssessment.js';

afterEach(cleanup);
const noop = () => {};

describe('the profile', () => {
  it.each(RANKS)('renders for a warrior standing at %s', (rank) => {
    const { container } = render(
      <ProfileScreen results={resultsAtRank(rank)} record={emptyRecord()}
        startDate={new Date().toISOString()} rank={rank} ground={null}
        onTrain={noop} onOrders={noop} onRetest={noop} onBack={noop} onGround={noop} />);
    expect(container.textContent.length).toBeGreaterThan(20);
  });

  it('renders with nothing recorded at all', () => {
    const { container } = render(
      <ProfileScreen results={{}} record={emptyRecord()} startDate={null} rank="Recruit"
        ground={null} onTrain={noop} onOrders={noop} onRetest={noop} onBack={noop} onGround={noop} />);
    expect(container.textContent.length).toBeGreaterThan(20);
  });
});

describe('standing orders', () => {
  it.each(RANKS)('renders real orders for a warrior at %s', (rank) => {
    const results = resultsAtRank(rank);
    const orders = defaultOrders(theWall(results), results);
    const { container } = render(
      <OrdersScreen orders={orders} held={{ date: '2026-08-13', ids: [] }} rank={rank}
        onToggle={noop} onSave={noop} onBack={noop} />);
    expect(container.textContent.length).toBeGreaterThan(10);
  });

  it('survives having no orders at all', () => {
    expect(() => render(<OrdersScreen orders={null} held={null} rank="Recruit"
      onToggle={noop} onSave={noop} onBack={noop} />)).not.toThrow();
  });
});
