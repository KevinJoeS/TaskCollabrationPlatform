export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || '?';

export const firstName = (name = '') => name.trim().split(/\s+/)[0] || '';

/** Stable 0..5 index from an id, used to pick one of six quiet avatar tints. */
export function tintIndex(seed = '') {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 6;
}

export const sameId = (a, b) => String(a?._id ?? a ?? '') === String(b?._id ?? b ?? '');
