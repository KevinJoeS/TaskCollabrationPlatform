import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Info } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';
import { Input, PasswordInput } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useUtilities';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  useDocumentTitle('Log in');
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const validate = (f = form) => {
    const e = {};
    if (!f.email.trim()) e.email = 'Enter your email.';
    else if (!EMAIL_RE.test(f.email.trim())) e.email = 'That email address looks incomplete.';
    if (!f.password) e.password = 'Enter your password.';
    return e;
  };

  const blur = (k) => () => setErrors((prev) => ({ ...prev, [k]: validate()[k] }));

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const user = await login({ email: form.email.trim(), password: form.password, remember: form.remember });
      toast.success(`Signed in as ${user.name}.`);
      navigate(location.state?.from?.pathname ? `${location.state.from.pathname}${location.state.from.search || ''}` : '/dashboard', { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Log in to TaskCollab"
      subtitle="Pick up where your team left off."
      footer={<>New to TaskCollab? <Link className="text-link" to="/register">Create an account</Link></>}
    >
      <form className="form-stack" onSubmit={submit} noValidate>
        {errors.form && (
          <p className="form-alert" role="alert">
            <AlertCircle size={15} aria-hidden="true" />
            {errors.form}
          </p>
        )}
        <Input label="Email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} onBlur={form.email ? blur('email') : undefined} error={errors.email} placeholder="you@company.com" data-autofocus autoFocus />
        <PasswordInput label="Password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
        <div className="auth-row">
          <label className="checkbox">
            <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} />
            Remember me
          </label>
          <button type="button" className="text-link auth-forgot" onClick={() => setShowReset((s) => !s)} aria-expanded={showReset}>
            Forgot password?
          </button>
        </div>
        {showReset && (
          <p className="form-alert form-alert-success" role="status">
            <Info size={15} aria-hidden="true" />
            <span>Password reset by email isn't set up on this TaskCollab server yet. If you're still signed in on another device, change your password under Settings. Otherwise, ask whoever runs this server to reset it.</span>
          </p>
        )}
        <Button type="submit" variant="primary" size="lg" full loading={busy}>
          {busy ? 'Logging in' : 'Login'}
        </Button>
      </form>
    </AuthLayout>
  );
}
