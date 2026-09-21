import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { Field } from './Input';

/** Native select, restyled. Native keeps keyboard, screen reader and mobile pickers working for free. */
export const SelectControl = forwardRef(function SelectControl({ options, size = 'md', className = '', children, ...rest }, ref) {
  return (
    <span className={`select select-${size} ${className}`}>
      <select ref={ref} {...rest}>
        {children ||
          options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
      </select>
      <ChevronDown size={14} aria-hidden="true" className="select-caret" />
    </span>
  );
});

const Select = forwardRef(function Select({ label, error, hint, optional, className, ...rest }, ref) {
  return (
    <Field label={label} error={error} hint={hint} optional={optional} className={className}>
      {(a11y) => <SelectControl ref={ref} {...a11y} {...rest} />}
    </Field>
  );
});

export default Select;
