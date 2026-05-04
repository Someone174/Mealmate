// Vercel serverless function: replaces the dev-only Vite middleware that
// used to spawn scripts/fetch-real-prices.mjs as a child process.
//
// POST /api/prices  body: { items: string[] }
// Resolves prices in this priority order, returning the first non-empty:
//   1. PRICE_API_URL aggregate endpoint
//   2. {STORE}_PRICE_API_URL per-store templates
//   3. PRICE_SOURCE_FILE (in-process JSON file)
// If none are configured, returns { prices: {} } so the client falls
// back to its local price estimates in src/components/mealmate/PriceService.jsx.

const STORES = {
  lulu: 'Lulu Hypermarket',
  carrefour: 'Carrefour',
  megamart: 'Megamart',
};

const getByPath = (value, path) => {
  if (!path) return value;
  return path.split('.').reduce((cur, key) => cur?.[key], value);
};

const normalizeStorePrice = (storeKey, raw, jsonPath) => {
  const value = getByPath(raw, jsonPath);
  const price = Number(value?.price ?? value?.amount ?? value);
  if (!Number.isFinite(price)) return null;
  return {
    price,
    name: value?.name || STORES[storeKey] || storeKey,
    inStock: value?.inStock ?? value?.available ?? true,
    delivery: value?.delivery ?? false,
    sourceUrl: value?.url,
  };
};

const fetchFromUrlTemplate = async (storeKey, item) => {
  const upper = storeKey.toUpperCase();
  const template = process.env[`${upper}_PRICE_API_URL`];
  if (!template) return null;

  const url = template.replaceAll('{query}', encodeURIComponent(item));
  const response = await fetch(url, {
    headers: process.env.PRICE_API_KEY
      ? { Authorization: `Bearer ${process.env.PRICE_API_KEY}` }
      : {},
  });
  if (!response.ok) return null;
  const raw = await response.json();
  return normalizeStorePrice(storeKey, raw, process.env[`${upper}_PRICE_JSON_PATH`]);
};

const fetchFromAggregateApi = async (items) => {
  if (!process.env.PRICE_API_URL) return null;
  const response = await fetch(process.env.PRICE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.PRICE_API_KEY
        ? { Authorization: `Bearer ${process.env.PRICE_API_KEY}` }
        : {}),
    },
    body: JSON.stringify({ items, stores: Object.keys(STORES), currency: 'QAR' }),
  });
  if (!response.ok) return null;
  return response.json();
};

const fetchPrices = async (items) => {
  const aggregate = await fetchFromAggregateApi(items);
  if (aggregate?.prices) return aggregate;

  const prices = {};
  for (const item of items) {
    const stores = {};
    for (const storeKey of Object.keys(STORES)) {
      const storePrice = await fetchFromUrlTemplate(storeKey, item);
      if (storePrice) stores[storeKey] = storePrice;
    }
    if (Object.keys(stores).length) {
      prices[item] = { stores, currency: 'QAR', source: 'configured-api' };
    }
  }
  return { prices, currency: 'QAR' };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const items = [
      ...new Set(
        (body.items || [])
          .map(String)
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ];
    if (!items.length) return res.status(200).json({ prices: {}, currency: 'QAR' });

    const result = await fetchPrices(items);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[/api/prices]', error);
    return res.status(500).json({ error: error.message || 'Internal error' });
  }
}
