import { describe, expect, it } from 'vitest';
import { useDebounce } from './useDebounce';

// Smoke test for the module's shape — full hook integration tests would
// require @testing-library/react which is intentionally not a dependency.
describe('useDebounce', () => {
  it('exports a hook function', () => {
    expect(typeof useDebounce).toBe('function');
  });

  it('accepts at least the value argument', () => {
    expect(useDebounce.length).toBeGreaterThanOrEqual(1);
  });
});
