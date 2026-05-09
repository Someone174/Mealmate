import { describe, expect, it } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  it('exports a hook function', () => {
    expect(typeof useLocalStorage).toBe('function');
  });

  it('accepts a key and an initial value', () => {
    expect(useLocalStorage.length).toBeGreaterThanOrEqual(2);
  });
});
