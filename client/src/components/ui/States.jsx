import { WifiOff, ShieldAlert, SearchX, ServerCrash } from 'lucide-react';
import Button from './Button';

export function EmptyState({ icon: Icon, title, body, action, compact = false }) {
  return (
    <div className={`empty ${compact ? 'empty-compact' : ''}`}>
      {Icon && (
        <span className="empty-icon" aria-hidden="true">
          <Icon size={compact ? 18 : 22} strokeWidth={1.6} />
        </span>
      )}
      <h3 className="empty-title">{title}</h3>
      {body && <p className="empty-body">{body}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}

/** Picks wording and actions from the error itself: offline, forbidden, missing, or server trouble. */
export function ErrorState({ error, onRetry, title, compact = false, backTo, backLabel }) {
  const status = error?.status;
  const preset = error?.isNetwork
    ? { icon: WifiOff, title: "Can't reach the server", body: 'The TaskCollab API is not responding. Check your connection, then try again.' }
    : status === 404
      ? { icon: SearchX, title: title || 'Not found', body: error.message }
      : status === 403
        ? { icon: ShieldAlert, title: "You don't have access", body: error.message }
        : { icon: ServerCrash, title: title || "This didn't load", body: error?.message || 'Something went wrong on our side.' };
  const canRetry = onRetry && status !== 404 && status !== 403;
  return (
    <div className={`empty error-state ${compact ? 'empty-compact' : ''}`} role="alert">
      <span className="empty-icon" aria-hidden="true">
        <preset.icon size={compact ? 18 : 22} strokeWidth={1.6} />
      </span>
      <h3 className="empty-title">{preset.title}</h3>
      <p className="empty-body">{preset.body}</p>
      <div className="empty-action">
        {canRetry && (
          <Button variant="primary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
        {backTo && (
          <Button variant="secondary" size="sm" to={backTo}>
            {backLabel || 'Return to dashboard'}
          </Button>
        )}
      </div>
    </div>
  );
}
