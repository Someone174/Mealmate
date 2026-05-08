// Price Service for Qatari Grocery Stores.
// Uses /api/prices for configured real sources, then falls back to local estimates.
// Prices are cached in memory for the browser session so the same item always
// shows the same estimated price within one visit — no flickering on re-renders.

const STORES = {
  lulu: { name: 'Lulu Hypermarket', color: 'bg-red-50 text-red-700 border-red-200' },
  carrefour: { name: 'Carrefour', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  megamart: { name: 'Megamart', color: 'bg-green-50 text-green-700 border-green-200' }
};

// Base prices in QAR - realistic Qatar pricing (per unit/package, NOT per week)
const BASE_PRICES = {
  // Produce (prices for typical package/quantity)
  'Mixed berries (frozen)': 9.0,
  'Banana': 2.5,
  'Avocado': 3.5,
  'Cherry tomatoes': 4.0,
  'Tomato': 2.0,
  'Cucumber': 1.5,
  'Carrots': 2.0,
  'Red cabbage': 3.0,
  'Lettuce': 2.5,
  'Bell pepper': 3.0,
  'Onion': 1.5,
  'Red onion': 1.5,
  'Spinach': 3.0,
  'Baby spinach': 4.0,
  'Napa cabbage': 4.0,
  'Green onions': 2.0,
  'Asparagus': 8.0,
  'Lemon': 1.0,
  'Lime': 1.0,
  'Fresh basil': 3.0,
  'Fresh dill': 3.0,
  'Garlic': 2.0,
  'Fresh ginger': 2.5,
  'Fresh parsley': 2.0,
  'Fresh cilantro': 2.0,
  'Mandarin oranges': 5.0,
  'Broccoli florets': 4.0,
  'Snap peas': 5.0,
  'Zucchini': 3.0,
  'Sweet potato': 2.5,
  'Cauliflower': 3.5,
  'Corn on the cob': 2.0,
  'Sliced almonds': 8.0,

  // Dairy
  'Greek yogurt': 5.5,
  'Almond milk': 6.0,
  'Milk': 4.0,
  'Eggs': 5.0,
  'Butter': 7.0,
  'Cheddar cheese': 10.0,
  'Feta cheese': 8.0,
  'Fresh mozzarella': 8.5,
  'Parmesan cheese': 12.0,
  'Cotija cheese': 10.0,
  'Sour cream': 5.0,
  'Heavy cream': 6.0,
  'Mayo': 4.5,

  // Proteins (per package/portion)
  'Cooked chicken breast': 12.0,
  'Chicken breast': 10.0,
  'Chicken thighs': 8.0,
  'Turkey breast slices': 9.0,
  'Bacon': 8.0,
  'Salmon fillets': 22.0,
  'Ahi tuna (sushi grade)': 25.0,
  'Large shrimp': 18.0,
  'Ground turkey': 10.0,
  'Pork tenderloin': 12.0,
  'Chickpeas (canned)': 2.0,
  'Black beans': 2.0,

  // Bakery
  'Whole grain bread': 3.5,
  'Ciabatta bread': 4.0,
  'Pita bread': 3.0,
  'Large flour tortilla': 3.5,

  // Pantry
  'Olive oil': 12.0,
  'Soy sauce': 3.5,
  'Honey': 8.0,
  'Dijon mustard': 4.0,
  'Tahini': 6.0,
  'Rice vinegar': 3.0,
  'Sesame oil': 5.0,
  'Coconut milk': 4.0,
  'Vegetable broth': 3.0,
  'Pasta': 3.5,
  'Couscous': 4.0,
  'Quinoa': 8.0,
  'Brown rice': 5.0,
  'Panko breadcrumbs': 4.0,
  'Kalamata olives': 6.0,
  'Pickled jalapeños': 3.5,
  'Salsa': 4.0,
  'Sesame seeds': 4.0,
  'Coleslaw mix': 3.0,

  // Seafood
  'Edamame': 5.5,

  // Frozen
  'Fresh berries': 7.0,
  'Corn': 3.5
};

// Session-scoped price cache: item name → store prices object.
// Populated lazily on first lookup; cleared when the page is reloaded.
const _sessionPriceCache = new Map();

// Deterministic-ish hash so the same item name always seeds the same variation.
const _simpleHash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

// Generate realistic price variations per store, stable for the session.
const generateStorePrices = (basePrice, itemName = '') => {
  const cached = _sessionPriceCache.get(itemName);
  if (cached) return cached;

  const seed = _simpleHash(itemName || String(basePrice));
  // Use the hash to produce consistent pseudo-random offsets per store
  const r = (offset) => ((seed * (offset + 1)) % 1000) / 1000;

  const prices = {
    lulu:      { price: basePrice * (0.92 + r(1) * 0.16), inStock: r(4) > 0.05, delivery: r(7) > 0.3 },
    carrefour: { price: basePrice * (0.90 + r(2) * 0.20), inStock: r(5) > 0.08, delivery: r(8) > 0.4 },
    megamart:  { price: basePrice * (0.95 + r(3) * 0.10), inStock: r(6) > 0.10, delivery: r(9) > 0.5 },
  };

  _sessionPriceCache.set(itemName, prices);
  return prices;
};

const buildPriceData = (item, realPriceData = null) => {
  if (realPriceData?.stores) {
    const stores = {};
    Object.entries(realPriceData.stores).forEach(([key, data]) => {
      stores[key] = {
        ...data,
        name: data.name || STORES[key]?.name || key,
        inStock: data.inStock ?? true,
        delivery: data.delivery ?? false
      };
    });
    const sorted = Object.entries(stores).sort(([, a], [, b]) => a.price - b.price);
    const [cheapestKey, cheapestData] = sorted[0];
    const mostExpensivePrice = sorted[sorted.length - 1][1].price;
    return {
      stores,
      cheapestStore: cheapestKey,
      cheapestPrice: cheapestData.price,
      savings: mostExpensivePrice - cheapestData.price,
      currency: realPriceData.currency || 'QAR',
      source: realPriceData.source || 'real'
    };
  }

  const base = BASE_PRICES[item.item] || BASE_PRICES[item.item?.toLowerCase()] || 5.0;
  const rawPrices = generateStorePrices(base, item.item || '');
  const stores = {};
  Object.entries(rawPrices).forEach(([key, data]) => {
    stores[key] = { ...data, name: STORES[key].name };
  });
  const sorted = Object.entries(stores).sort(([, a], [, b]) => a.price - b.price);
  const [cheapestKey, cheapestData] = sorted[0];
  const mostExpensivePrice = sorted[sorted.length - 1][1].price;
  return {
    stores,
    cheapestStore: cheapestKey,
    cheapestPrice: cheapestData.price,
    savings: mostExpensivePrice - cheapestData.price,
    currency: 'QAR',
    source: 'estimate'
  };
};

const flattenGroceryList = (groceryList) => (
  Array.isArray(groceryList) ? groceryList : Object.values(groceryList || {}).flat()
);

const fetchRealPriceMap = async (groceryList) => {
  const items = flattenGroceryList(groceryList).map(item => item.item).filter(Boolean);
  if (!items.length) return {};

  const response = await fetch('/api/prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) throw new Error(`Price endpoint failed: ${response.status}`);
  const data = await response.json();
  return data.prices || {};
};

export const fetchPricesForGroceryList = async (groceryList) => {
  if (!groceryList) return {};
  let realPriceMap = {};
  try {
    realPriceMap = await fetchRealPriceMap(groceryList);
  } catch (error) {
    console.warn('Real price lookup unavailable; using local estimates.', error);
  }

  // Handle aisle-keyed object format (new format)
  if (!Array.isArray(groceryList)) {
    const result = {};
    for (const [aisle, items] of Object.entries(groceryList)) {
      result[aisle] = items.map(item => ({ ...item, priceData: buildPriceData(item, realPriceMap[item.item]) }));
    }
    return result;
  }
  // Legacy flat array
  return groceryList.map(item => ({ ...item, priceData: buildPriceData(item, realPriceMap[item.item]) }));
};

export const calculateTotalByStore = (pricedList) => {
  if (!pricedList) return { lulu: 0, carrefour: 0, megamart: 0 };
  const items = Array.isArray(pricedList) ? pricedList : Object.values(pricedList).flat();
  const totals = { lulu: 0, carrefour: 0, megamart: 0 };
  items.forEach(item => {
    if (item.priceData?.stores) {
      Object.keys(totals).forEach(store => {
        if (item.priceData.stores[store]) {
          totals[store] += item.priceData.stores[store].price;
        }
      });
    }
  });
  return Object.fromEntries(
    Object.entries(totals).map(([k, v]) => [k, Math.round(v * 100) / 100])
  );
};

export const getCheapestStoreForList = (storeTotals) => {
  if (!storeTotals) return null;
  const entries = Object.entries(storeTotals).sort(([, a], [, b]) => a - b);
  if (!entries.length) return null;
  const [cheapestKey, cheapestTotal] = entries[0];
  const mostExpensiveTotal = entries[entries.length - 1][1];
  const store = STORES[cheapestKey];
  return {
    storeKey: cheapestKey,
    storeName: store?.name || cheapestKey,
    total: cheapestTotal,
    savings: Math.round((mostExpensiveTotal - cheapestTotal) * 100) / 100,
    color: store?.color || 'bg-gray-50 border-gray-200 text-gray-700'
  };
};

export { STORES };
