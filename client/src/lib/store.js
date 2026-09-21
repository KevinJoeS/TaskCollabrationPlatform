import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

/**
 * A very small request cache (stale-while-revalidate).
 * - Components that ask for the same key share one request and one result.
 * - invalidate('prefix') refetches every mounted resource whose key starts with it,
 *   which is how a change made in the task panel updates the board underneath.
 */
const entries = new Map();

function entry(key) {
  if (!entries.has(key)) entries.set(key, { data: undefined, error: null, loading: false, fetcher: null, subs: new Set(), snapshot: null, stamp: 0, fetchedAt: 0 });
  return entries.get(key);
}

function publish(e) {
  e.snapshot = null;
  e.subs.forEach((fn) => fn());
}

async function load(key) {
  const e = entry(key);
  if (!e.fetcher) return;
  const stamp = ++e.stamp;
  e.loading = true;
  publish(e);
  try {
    const data = await e.fetcher();
    if (stamp !== e.stamp) return;
    e.data = data;
    e.error = null;
    e.fetchedAt = Date.now();
  } catch (err) {
    if (stamp !== e.stamp) return;
    e.error = err;
  } finally {
    if (stamp === e.stamp) {
      e.loading = false;
      publish(e);
    }
  }
}

export function invalidate(...prefixes) {
  for (const [key, e] of entries) {
    if (!prefixes.some((p) => key === p || key.startsWith(p))) continue;
    if (e.subs.size) load(key);
    else entries.delete(key);
  }
}

export function setCached(key, updater) {
  const e = entry(key);
  if (e.data === undefined) return;
  e.data = typeof updater === 'function' ? updater(e.data) : updater;
  publish(e);
}

export function clearStore() {
  entries.clear();
}

export function useResource(key, fetcher) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const subscribe = useCallback(
    (fn) => {
      if (!key) return () => {};
      const e = entry(key);
      e.subs.add(fn);
      return () => e.subs.delete(fn);
    },
    [key]
  );

  const getSnapshot = useCallback(() => {
    if (!key) return EMPTY;
    const e = entry(key);
    if (!e.snapshot) e.snapshot = { data: e.data, error: e.error, loading: e.loading };
    return e.snapshot;
  }, [key]);

  const state = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    if (!key) return;
    const e = entry(key);
    e.fetcher = () => fetcherRef.current();
    // Cached data is shown immediately; it is refreshed unless it is only a few seconds old.
    if (!e.loading && Date.now() - e.fetchedAt > 4000) load(key);
  }, [key]);

  const reload = useCallback(() => key && load(key), [key]);

  return {
    data: state.data,
    error: state.data === undefined ? state.error : null,
    // "loading" means there is nothing to show yet; background refreshes are "refreshing".
    loading: state.data === undefined && !state.error,
    refreshing: state.loading && state.data !== undefined,
    reload,
  };
}

const EMPTY = { data: undefined, error: null, loading: false };
