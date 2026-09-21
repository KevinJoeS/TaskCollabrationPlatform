import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

/** Label + control + hint/error, wired together for screen readers. */
export function Field({ label, error, hint, optional, children, className = '' }) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field ${error ? 'has-error' : ''} ${className}`}>
      <label className="field-label" htmlFor={id}>
        {label}
        {optional && <span className="field-optional">Optional</span>}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {hint && !error && (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={errorId} role="alert">
          <AlertCircle size={13} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, error, hint, optional, className, ...rest }, ref) {
  return (
    <Field label={label} error={error} hint={hint} optional={optional} className={className}>
      {(a11y) => <input ref={ref} className="control" {...a11y} {...rest} />}
    </Field>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, hint, optional, className, rows = 4, ...rest }, ref) {
  return (
    <Field label={label} error={error} hint={hint} optional={optional} className={className}>
      {(a11y) => <textarea ref={ref} className="control control-textarea" rows={rows} {...a11y} {...rest} />}
    </Field>
  );
});

export const PasswordInput = forwardRef(function PasswordInput({ label, error, hint, className, ...rest }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {(a11y) => (
        <div className="control-wrap">
          <input ref={ref} className="control control-with-action" type={visible ? 'text' : 'password'} {...a11y} {...rest} />
          <button type="button" className="control-action" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>
            {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        </div>
      )}
    </Field>
  );
});
