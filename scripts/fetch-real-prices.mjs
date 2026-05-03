#!/usr/bin/env node
import fs from 'fs/promises';

const STORES = {
  lulu: 'Lulu Hypermarket',
  carrefour: 'Carrefour',
  megamart: 'Megamart'
};

const readStdin = async () => {
  let body = '';
  for await (const chunk of process.stdin) body += chunk;
  return body ? JSON.parse(body) : {};
};

const getByPath = (value, path) => {
  if (!path) return value;
  return path.split('.').reduce((current, key) => current?.[key], value);
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
    sourceUrl: value?.url
  };
};

const fetchFromUrlTemplate = async (storeKey, item) => {
  const upper = storeKey.toUpperCase();
  const template = process.env[`${upper}_PRICE_API_URL`];
  if (!template) return null;

  const url = template.replaceAll('{query}', encodeURIComponent(item));
  const response = await fetch(url, {
    headers: process.env.PRICE_API_KEY ? { Authorization: `Bearer ${process.env.PRICE_API_KEY}` } : {}
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
      ...(process.env.PRICE_API_KEY ? { Authorization: `Bearer ${process.env.PRICE_API_KEY}` } : {})
    },
    body: JSON.stringify({ items, stores: Object.keys(STORES), currency: 'QAR' })
  });
  if (!response.ok) return null;
  return response.json();
};

const fetchFromFile = async (items) => {
  if (!process.env.PRICE_SOURCE_FILE) return null;
  const raw = JSON.parse(await fs.readFile(process.env.PRICE_SOURCE_FILE, 'utf8'));
  const prices = {};
  items.forEach(item => {
    if (raw[item]) prices[item] = raw[item];
  });
  return { prices };
};

const fetchPrices = async (items) => {
  const aggregate = await fetchFromAggregateApi(items);
  if (aggregate?.prices) return aggregate;

  const fileData = await fetchFromFile(items);
  if (fileData?.prices) return fileData;

  const prices = {};
  for (const item of items) {
    const stores = {};
    for (const storeKey of Object.keys(STORES)) {
      const storePrice = await fetchFromUrlTemplate(storeKey, item);
      if (storePrice) stores[storeKey] = storePrice;
    }
    if (Object.keys(stores).length) prices[item] = { stores, currency: 'QAR', source: 'configured-api' };
  }

  return { prices, currency: 'QAR' };
};

const main = async () => {
  const args = process.argv.slice(2);
  const payload = args.includes('--json') ? await readStdin() : { items: args };
  const items = [...new Set((payload.items || []).map(String).map(s => s.trim()).filter(Boolean))];
  const result = await fetchPrices(items);
  process.stdout.write(JSON.stringify(result, null, 2));
};

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
