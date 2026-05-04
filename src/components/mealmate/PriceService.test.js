import { describe, expect, it } from 'vitest';
import { calculateTotalByStore, getCheapestStoreForList } from './PriceService';

const sample = [
  {
    item: 'Tomato',
    priceData: {
      stores: {
        lulu: { price: 4.0 },
        carrefour: { price: 3.5 },
        megamart: { price: 4.2 },
      },
    },
  },
  {
    item: 'Olive oil',
    priceData: {
      stores: {
        lulu: { price: 12.0 },
        carrefour: { price: 13.5 },
        megamart: { price: 11.8 },
      },
    },
  },
];

describe('PriceService.calculateTotalByStore', () => {
  it('sums each store across all items', () => {
    const totals = calculateTotalByStore(sample);
    expect(totals.lulu).toBeCloseTo(16.0, 2);
    expect(totals.carrefour).toBeCloseTo(17.0, 2);
    expect(totals.megamart).toBeCloseTo(16.0, 2);
  });

  it('handles aisle-keyed objects too', () => {
    const totals = calculateTotalByStore({ Produce: [sample[0]], Pantry: [sample[1]] });
    expect(totals.lulu).toBeCloseTo(16.0, 2);
    expect(totals.carrefour).toBeCloseTo(17.0, 2);
  });

  it('returns zeroed totals for an empty list', () => {
    const totals = calculateTotalByStore([]);
    expect(totals).toEqual({ lulu: 0, carrefour: 0, megamart: 0 });
  });
});

describe('PriceService.getCheapestStoreForList', () => {
  it('picks the cheapest store and reports the savings vs the most expensive', () => {
    const cheapest = getCheapestStoreForList({ lulu: 16, carrefour: 17, megamart: 16.5 });
    expect(cheapest.storeKey).toBe('lulu');
    expect(cheapest.total).toBe(16);
    expect(cheapest.savings).toBeCloseTo(1.0, 2);
  });

  it('returns null on missing data', () => {
    expect(getCheapestStoreForList(null)).toBeNull();
  });
});
