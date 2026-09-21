import { Logo } from '../components/ui/Misc';
import { StatusIcon } from '../components/ui/Badge';
import { STATUSES } from '../utils/constants';

/** Split screen: product statement on charcoal, form on paper. Stacks on phones with the statement reduced to the logo. */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth-aside">
        <Logo onDark />
        <div className="auth-aside-body">
          <p className="auth-statement">Turn scattered work into coordinated progress.</p>
          <p className="auth-aside-copy">Plan projects, organize tasks, collaborate with your team, and keep every deadline within reach.</p>
        </div>
        <ol className="auth-rail" aria-label="How work moves through TaskCollab">
          {STATUSES.map((s) => (
            <li key={s.value}>
              <StatusIcon status={s.value} size={16} />
              {s.label}
            </li>
          ))}
        </ol>
      </aside>
      <main className="auth-main" id="main">
        <div className="auth-form-wrap">
          <span className="auth-mobile-logo"><Logo /></span>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
          <p className="auth-switch">{footer}</p>
        </div>
      </main>
    </div>
  );
}
