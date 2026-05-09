import { describe, expect, it } from 'vitest';
import { scaleAmount, scaleIngredients } from './scaleIngredients';

describe('scaleAmount', () => {
  it('returns the original string when the factor is 1', () => {
    expect(scaleAmount('1 cup', 1)).toBe('1 cup');
    expect(scaleAmount('to taste', 1)).toBe('to taste');
  });

  it('passes through non-numeric amounts unchanged', () => {
    expect(scaleAmount('to taste', 2)).toBe('to taste');
    expect(scaleAmount('pinch', 4)).toBe('pinch');
    expect(scaleAmount('as needed', 0.5)).toBe('as needed');
  });

  it('scales whole-number amounts', () => {
    expect(scaleAmount('2 eggs', 2)).toBe('4 eggs');
    expect(scaleAmount('4 cups', 0.5)).toBe('2 cups');
  });

  it('scales mixed-number amounts', () => {
    expect(scaleAmount('1 1/2 cups', 2)).toBe('3 cups');
  });

  it('scales fractional amounts', () => {
    expect(scaleAmount('1/2 tsp', 2)).toBe('1 tsp');
    expect(scaleAmount('1/4 cup', 4)).toBe('1 cup');
  });

  it('scales decimal amounts', () => {
    expect(scaleAmount('1.5 lb', 2)).toBe('3 lb');
  });

  it('scales numeric ranges and keeps the dash format', () => {
    expect(scaleAmount('2-3 tbsp', 2)).toBe('4-6 tbsp');
  });

  it('falls back to the original string when it can\'t parse', () => {
    expect(scaleAmount('a handful', 2)).toBe('a handful');
    expect(scaleAmount('', 2)).toBe('');
  });

  it('snaps near-integers cleanly when a fractional factor produces noise', () => {
    expect(scaleAmount('3 cups', 1 / 3)).toBe('1 cups');
  });
});

describe('scaleIngredients', () => {
  it('scales every ingredient amount and preserves other fields', () => {
    const input = [
      { item: 'Flour', amount: '1 cup', aisle: 'Pantry' },
      { item: 'Eggs', amount: '2 large', aisle: 'Dairy' },
    ];
    const out = scaleIngredients(input, 2);
    expect(out).toEqual([
      { item: 'Flour', amount: '2 cup', aisle: 'Pantry' },
      { item: 'Eggs', amount: '4 large', aisle: 'Dairy' },
    ]);
  });

  it('returns the original list when factor is 1', () => {
    const input = [{ item: 'X', amount: '1' }];
    expect(scaleIngredients(input, 1)).toBe(input);
  });

  it('handles empty / non-array input gracefully', () => {
    expect(scaleIngredients(null, 2)).toBe(null);
    expect(scaleIngredients(undefined, 2)).toBe(undefined);
  });
});
