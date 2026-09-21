import { useEffect, useRef, useState } from 'react';

export function useDebounce(value, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Calls handler on Ctrl/⌘ + key. */
export function useHotkey(key, handler) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === key) {
        e.preventDefault();
        ref.current(e);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [key]);
}

export function useOnClickOutside(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler(e);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [ref, handler, active]);
}

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | TaskCollab` : 'TaskCollab';
  }, [title]);
}

/** Adds "is-visible" once when the element scrolls into view. Used for the landing page only. */
export function useReveal(options = { threshold: 0.2 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-visible');
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.classList.add('is-visible');
        io.disconnect();
      }
    }, options);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}
