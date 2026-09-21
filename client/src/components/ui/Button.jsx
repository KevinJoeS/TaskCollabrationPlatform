import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

/**
 * variant: primary (ink) | accent (cobalt, one per view at most) | secondary | ghost | danger
 * size: sm | md | lg
 */
const Button = forwardRef(function Button(
  { variant = 'secondary', size = 'md', icon: Icon, iconRight: IconRight, loading = false, full = false, to, className = '', children, disabled, type = 'button', ...rest },
  ref
) {
  const cls = ['btn', `btn-${variant}`, `btn-${size}`, full && 'btn-full', loading && 'is-loading', !children && 'btn-icon-only', className].filter(Boolean).join(' ');
  const iconSize = size === 'sm' ? 14 : 16;
  const content = (
    <>
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : Icon ? <Icon size={iconSize} aria-hidden="true" /> : null}
      {children && <span className="btn-label">{children}</span>}
      {IconRight && !loading && <IconRight size={iconSize} aria-hidden="true" />}
    </>
  );
  if (to) {
    return (
      <Link ref={ref} to={to} className={cls} {...rest}>
        {content}
      </Link>
    );
  }
  return (
    <button ref={ref} type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
});

export default Button;

export const IconButton = forwardRef(function IconButton({ label, icon: Icon, size = 'md', className = '', ...rest }, ref) {
  return (
    <button ref={ref} type="button" className={`icon-btn icon-btn-${size} ${className}`} aria-label={label} title={label} {...rest}>
      <Icon size={size === 'sm' ? 15 : 17} aria-hidden="true" />
    </button>
  );
});
