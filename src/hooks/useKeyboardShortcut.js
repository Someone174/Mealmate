import { useEffect } from 'react';

const isTypingTarget = (el) => {
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
};

const matchSpec = (spec, e) => {
  // spec: 'g d' (sequence) or 'mod+k' or '?'
  // For now we only support single-step keys (covers 99% of use).
  const parts = spec.toLowerCase().split('+').map((p) => p.trim());
  const key = parts[parts.length - 1];
  const wantMod = parts.includes('mod') || parts.includes('ctrl') || parts.includes('cmd');
  const wantShift = parts.includes('shift');
  const wantAlt = parts.includes('alt');
  const mod = e.metaKey || e.ctrlKey;
  const pressed = (e.key || '').toLowerCase();
  if (wantMod && !mod) return false;
  if (!wantMod && mod) return false;
  if (wantShift !== e.shiftKey) return false;
  if (wantAlt !== e.altKey) return false;
  if (key === 'space') return pressed === ' ';
  if (key === 'esc' || key === 'escape') return pressed === 'escape';
  if (key === 'enter') return pressed === 'enter';
  return pressed === key;
};

/**
 * Bind a single shortcut. Pass an array of specs to match any of them.
 *
 * useKeyboardShortcut('?', () => setShowHelp(true));
 * useKeyboardShortcut(['mod+k', 'ctrl+k'], () => openCommandPalette());
 */
export function useKeyboardShortcut(specs, handler, { allowInInputs = false, enabled = true } = {}) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    const list = Array.isArray(specs) ? specs : [specs];
    const onKey = (e) => {
      if (!allowInInputs && isTypingTarget(e.target)) return;
      if (list.some((s) => matchSpec(s, e))) {
        e.preventDefault();
        handler(e);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [specs, handler, allowInInputs, enabled]);
}
