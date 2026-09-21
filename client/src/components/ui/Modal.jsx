import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './Button';
import Button from './Button';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
let openCount = 0;

/**
 * Accessible dialog. variant:
 *  - "dialog": centred; becomes a bottom sheet on phones
 *  - "panel": slides in from the right; becomes full screen on phones
 *  - "palette": top-anchored, used by the command palette
 */
export default function Modal({ open, onClose, title, description, variant = 'dialog', size = 'md', hideHeader = false, initialFocus, footer, children, labelledBy }) {
  const ref = useRef(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    openCount += 1;
    document.body.style.overflow = 'hidden';

    const node = ref.current;
    const target = (initialFocus && node.querySelector(initialFocus)) || node.querySelector('[data-autofocus]') || node.querySelector(FOCUSABLE) || node;
    target.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === 'Escape') {
        // Only the top-most dialog reacts.
        const all = document.querySelectorAll('.modal');
        if (all[all.length - 1] !== node) return;
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return e.preventDefault();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      openCount -= 1;
      if (openCount === 0) document.body.style.overflow = '';
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className={`modal-layer modal-layer-${variant}`}>
      <div className="modal-scrim" onMouseDown={onClose} aria-hidden="true" />
      <div ref={ref} className={`modal modal-${variant} modal-${size}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy || (title ? titleId : undefined)} tabIndex={-1}>
        {!hideHeader && (
          <header className="modal-head">
            <div>
              <h2 id={titleId} className="modal-title">
                {title}
              </h2>
              {description && <p className="modal-desc">{description}</p>}
            </div>
            <IconButton icon={X} label="Close" onClick={onClose} />
          </header>
        )}
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel = 'Confirm', danger = false, loading = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} data-autofocus>
            Cancel
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="confirm-body">{body}</p>
    </Modal>
  );
}
