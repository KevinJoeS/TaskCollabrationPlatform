import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useOnClickOutside } from '../../hooks/useUtilities';

/** Small anchored panel (menus, member cards). trigger and children are render props. */
export default function Popover({ trigger, children, align = 'start', side = 'bottom', className = '', role = 'menu' }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);
  useOnClickOutside(wrap, close, open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        wrap.current?.querySelector('[aria-haspopup]')?.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open]);

  return (
    <span className={`popover-wrap ${className}`} ref={wrap}>
      {trigger({ open, toggle: () => setOpen((o) => !o), props: { 'aria-haspopup': role, 'aria-expanded': open, 'aria-controls': open ? id : undefined } })}
      {open && (
        <div id={id} className={`popover popover-${side} popover-${align}`} role={role}>
          {children({ close })}
        </div>
      )}
    </span>
  );
}

export function MenuItem({ icon: Icon, children, onSelect, danger = false, selected = false, ...rest }) {
  return (
    <button type="button" role="menuitem" className={`menu-item ${danger ? 'menu-item-danger' : ''} ${selected ? 'is-selected' : ''}`} onClick={onSelect} {...rest}>
      {Icon && <Icon size={15} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
