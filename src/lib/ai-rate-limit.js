// Lightweight client-side rate-limit helper. Per-tier daily caps for the AI
// Planner chat. Counter stored in localStorage keyed by user-id + UTC date,
// so it survives reloads but resets cleanly at midnight UTC.

const LIMITS = {
  free: 3,
  monthly: 100,
  yearly: 200,
  lifetime: 200,
};

const todayKey = () => {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
};

const storageKey = (userId) => `mealmate_ai_uses_${userId || 'anon'}_${todayKey()}`;

export const getAILimit = (plan = 'free') => LIMITS[plan] ?? LIMITS.free;

export const getAIUsage = (userId) => {
  const raw = localStorage.getItem(storageKey(userId));
  return raw ? Number(raw) || 0 : 0;
};

export const incrementAIUsage = (userId) => {
  const next = getAIUsage(userId) + 1;
  localStorage.setItem(storageKey(userId), String(next));
  return next;
};

export const checkAILimit = (userId, plan = 'free') => {
  const limit = getAILimit(plan);
  const used = getAIUsage(userId);
  return { allowed: used < limit, used, limit, remaining: Math.max(0, limit - used) };
};
