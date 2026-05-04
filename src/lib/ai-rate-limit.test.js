import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  checkAILimit,
  getAILimit,
  getAIUsage,
  incrementAIUsage,
} from './ai-rate-limit';

describe('ai-rate-limit', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns the right per-tier daily cap', () => {
    expect(getAILimit('free')).toBe(3);
    expect(getAILimit('monthly')).toBe(100);
    expect(getAILimit('yearly')).toBe(200);
    expect(getAILimit('lifetime')).toBe(200);
    // Unknown tiers fall back to free.
    expect(getAILimit('mystery')).toBe(3);
    expect(getAILimit()).toBe(3);
  });

  it('tracks usage per user, starting at zero', () => {
    expect(getAIUsage('alice')).toBe(0);
    incrementAIUsage('alice');
    incrementAIUsage('alice');
    expect(getAIUsage('alice')).toBe(2);
    expect(getAIUsage('bob')).toBe(0);
  });

  it('blocks once the daily cap is hit on the free tier', () => {
    const userId = 'free-user';
    expect(checkAILimit(userId, 'free').allowed).toBe(true);
    incrementAIUsage(userId);
    incrementAIUsage(userId);
    incrementAIUsage(userId);
    const status = checkAILimit(userId, 'free');
    expect(status.allowed).toBe(false);
    expect(status.used).toBe(3);
    expect(status.remaining).toBe(0);
  });

  it('still allows the monthly tier once the free cap would have been hit', () => {
    const userId = 'paid-user';
    for (let i = 0; i < 5; i++) incrementAIUsage(userId);
    expect(checkAILimit(userId, 'free').allowed).toBe(false);
    expect(checkAILimit(userId, 'monthly').allowed).toBe(true);
  });
});
