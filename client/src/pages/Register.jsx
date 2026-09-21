import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Check } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';
import { Input, PasswordInput } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useUtilities';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);

  const validate = (v = f) => {
    const e = {};
    if (!v.name.trim()) e.name = 'Enter your name.';
    if (!v.email.trim()) e.email = 'Enter your email.';
    else if (!EMAIL_RE.test(v.email.trim())) e.email = 'That email address looks incomplete.';
    if (!v.password) e.password = 'Choose a password.';
    else if (v.password.length < 6) e.password = 'Use at least 6 characters.';
    if (!v.confirm) e.confirm = 'Type your password again.';
    else if (v.confirm !== v.password) e.confirm = "Passwords don't match.";
    return e;
  };

  const change = (k) => (ev) => {
    const next = { ...f, [k]: ev.target.value };
    setF(next);
    // Once a field has been visited, its message updates as the user types.
    if (touched[k] || (k === 'password' && touched.confirm)) {
      const v = validate(next);
      setErrors((prev) => ({ ...prev, [k]: v[k], ...(k === 'password' && touched.confirm ? { confirm: v.confirm } : {}) }));
    }
  };
  const blur = (k) => () => {
    if (!f[k]) return;
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((prev) => ({ ...prev, [k]: validate()[k] }));
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await register({ name: f.name.trim(), email: f.email.trim(), password: f.password });
      toast.success('Account created. Welcome to TaskCollab.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors(err.status === 409 ? { email: 'An account with this email already exists. Try logging in instead.' } : { form: err.message });
      setBusy(false);
    }
  };

  const match = f.confirm && f.confirm === f.password && f.password.length >= 6;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up your workspace, then invite your team."
      footer={<>Already have an account? <Link className="text-link" to="/login">Log in</Link></>}
    >
      <form className="form-stack" onSubmit={submit} noValidate>
        {errors.form && (
          <p className="form-alert" role="alert">
            <AlertCircle size={15} aria-hidden="true" />
            {errors.form}
          </p>
        )}
        <Input label="Name" autoComplete="name" value={f.name} onChange={change('name')} onBlur={blur('name')} error={errors.name} autoFocus maxLength={80} />
        <Input label="Email" type="email" autoComplete="email" inputMode="email" value={f.email} onChange={change('email')} onBlur={blur('email')} error={errors.email} placeholder="you@company.com" />
        <PasswordInput label="Password" autoComplete="new-password" value={f.password} onChange={change('password')} onBlur={blur('password')} error={errors.password} hint="At least 6 characters." />
        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          value={f.confirm}
          onChange={change('confirm')}
          onBlur={blur('confirm')}
          error={errors.confirm}
          hint={match ? <span className="hint-ok"><Check size={13} aria-hidden="true" /> Passwords match.</span> : undefined}
        />
        <Button type="submit" variant="primary" size="lg" full loading={busy}>
          {busy ? 'Creating account' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
