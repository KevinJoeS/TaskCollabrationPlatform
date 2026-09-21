import { Link } from 'react-router-dom';

export function Logo({ to = '/', compact = false, onDark = false }) {
  return (
    <Link to={to} className={`logo ${onDark ? 'logo-on-dark' : ''}`} aria-label="TaskCollab home">
      <svg className="logo-mark" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2.5" y="2.5" width="12" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <rect x="9" y="9" width="12.5" height="12.5" rx="2.5" className="logo-mark-fill" />
      </svg>
      {!compact && <span className="logo-word">TaskCollab</span>}
    </Link>
  );
}

export function Progress({ value = 0, label, size = 'md' }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={`progress progress-${size}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'Progress'}>
      <span className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Tabs({ tabs, value, onChange, label }) {
  const onKeyDown = (e) => {
    const i = tabs.findIndex((t) => t.value === value);
    if (e.key === 'ArrowRight') onChange(tabs[(i + 1) % tabs.length].value);
    else if (e.key === 'ArrowLeft') onChange(tabs[(i - 1 + tabs.length) % tabs.length].value);
    else return;
    e.preventDefault();
    requestAnimationFrame(() => e.currentTarget.querySelector('[aria-selected="true"]')?.focus());
  };
  return (
    <div className="tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {tabs.map((t) => (
        <button key={t.value} type="button" role="tab" id={`tab-${t.value}`} aria-selected={t.value === value} aria-controls={`panel-${t.value}`} tabIndex={t.value === value ? 0 : -1} className="tab" onClick={() => onChange(t.value)}>
          {t.icon && <t.icon size={15} aria-hidden="true" />}
          {t.label}
          {t.count != null && <span className="tab-count num">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Panel({ title, action, children, className = '', flush = false, as: Tag = 'section' }) {
  return (
    <Tag className={`panel ${className}`}>
      {(title || action) && (
        <header className="panel-head">
          <h2 className="panel-title">{title}</h2>
          {action}
        </header>
      )}
      <div className={flush ? 'panel-body-flush' : 'panel-body'}>{children}</div>
    </Tag>
  );
}

export function PageHeader({ title, subtitle, actions, back }) {
  return (
    <header className="page-head">
      <div className="page-head-text">
        {back}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function FullPageLoader({ label = 'Loading TaskCollab' }) {
  return (
    <div className="full-loader" role="status" aria-label={label}>
      <svg className="full-loader-mark" width="36" height="36" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2.5" y="2.5" width="12" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <rect x="9" y="9" width="12.5" height="12.5" rx="2.5" className="logo-mark-fill" />
      </svg>
    </div>
  );
}
