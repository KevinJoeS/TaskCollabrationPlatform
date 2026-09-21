import { Compass } from 'lucide-react';
import Button from '../components/ui/Button';
import { EmptyState } from '../components/ui/States';
import { Logo } from '../components/ui/Misc';
import { useAuth } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useUtilities';

export default function NotFound({ embedded = false }) {
  useDocumentTitle('Page not found');
  const { user } = useAuth();
  const body = (
    <EmptyState
      icon={Compass}
      title="This page doesn't exist."
      body="The link may be old, or the address may have a typo."
      action={
        <>
          <Button onClick={() => window.history.back()}>Go back</Button>
          <Button variant="primary" to={user ? '/dashboard' : '/'}>{user ? 'Return to dashboard' : 'Go to home page'}</Button>
        </>
      }
    />
  );
  if (embedded) return <div className="panel">{body}</div>;
  return (
    <div className="notfound">
      <Logo />
      {body}
    </div>
  );
}
