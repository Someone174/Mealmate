// Scale recipe ingredient amounts proportionally for a different serving count.
// Handles common amount strings like "1 1/2 cups", "1/2 tsp", "2-3 tbsp", "1.5 lb",
// "pinch", "to taste", "6-8". Falls back to the original string when it can't parse.

const FRACTION_MAP = {
  '½': 0.5, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 0.25, '¾': 0.75,
  '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8, '⅙': 1 / 6, '⅚': 5 / 6,
  '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
};

const parseToken = (tok) => {
  if (!tok) return null;
  if (FRACTION_MAP[tok]) return FRACTION_MAP[tok];
  if (tok.includes('/')) {
    const [n, d] = tok.split('/').map(Number);
    if (Number.isFinite(n) && Number.isFinite(d) && d !== 0) return n / d;
    return null;
  }
  const n = Number(tok);
  return Number.isFinite(n) ? n : null;
};

// Returns {value, suffix} or null if no leading number found.
const parseLeadingNumber = (str) => {
  // Try ranges first: "2-3 tbsp" or "6-8" — scale the upper bound, keep the dash format.
  const range = str.match(/^\s*(\d+(?:[./]\d+)?)\s*[-–]\s*(\d+(?:[./]\d+)?)\s*(.*)$/);
  if (range) {
    const lo = parseToken(range[1]);
    const hi = parseToken(range[2]);
    if (lo != null && hi != null) {
      return { range: true, lo, hi, suffix: range[3] };
    }
  }
  // Mixed number: "1 1/2 cups"
  const mixed = str.match(/^\s*(\d+)\s+(\d+\/\d+)\s*(.*)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const frac = parseToken(mixed[2]) || 0;
    return { value: whole + frac, suffix: mixed[3] };
  }
  // Single fraction: "1/2 tsp"
  const frac = str.match(/^\s*(\d+\/\d+)\s*(.*)$/);
  if (frac) {
    const v = parseToken(frac[1]);
    if (v != null) return { value: v, suffix: frac[2] };
  }
  // Decimal or integer
  const num = str.match(/^\s*(\d+(?:\.\d+)?)\s*(.*)$/);
  if (num) {
    const v = parseToken(num[1]);
    if (v != null) return { value: v, suffix: num[2] };
  }
  return null;
};

const formatNumber = (n) => {
  if (!Number.isFinite(n)) return '';
  // Snap near-integers, otherwise show up to 2 decimals trimmed.
  if (Math.abs(n - Math.round(n)) < 0.01) return String(Math.round(n));
  // Common kitchen fractions
  const frac = [
    [1 / 4, '1/4'], [1 / 3, '1/3'], [1 / 2, '1/2'],
    [2 / 3, '2/3'], [3 / 4, '3/4'],
  ];
  const whole = Math.floor(n);
  const rest = n - whole;
  const match = frac.find(([v]) => Math.abs(v - rest) < 0.04);
  if (match) return whole ? `${whole} ${match[1]}` : match[1];
  return n.toFixed(2).replace(/\.?0+$/, '');
};

export const scaleAmount = (amount, factor) => {
  if (!amount || factor === 1) return amount;
  if (typeof amount !== 'string') return amount;
  const trimmed = amount.trim();
  if (/^(to taste|pinch|dash|optional|as needed|—)$/i.test(trimmed)) return amount;
  const parsed = parseLeadingNumber(trimmed);
  if (!parsed) return amount;
  if (parsed.range) {
    const lo = parsed.lo * factor;
    const hi = parsed.hi * factor;
    return `${formatNumber(lo)}-${formatNumber(hi)} ${parsed.suffix}`.trim();
  }
  return `${formatNumber(parsed.value * factor)} ${parsed.suffix || ''}`.trim();
};

export const scaleIngredients = (ingredients, factor) => {
  if (!Array.isArray(ingredients) || factor === 1) return ingredients;
  return ingredients.map((ing) => ({ ...ing, amount: scaleAmount(ing.amount, factor) }));
};
