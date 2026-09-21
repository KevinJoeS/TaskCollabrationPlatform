import { useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { Input, PasswordInput } from '../components/ui/Input';
import { PageHeader, Panel } from '../components/ui/Misc';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/auth';
import { invalidate } from '../lib/store';
import { useDocumentTitle } from '../hooks/useUtilities';

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function Settings() {
  useDocumentTitle('Settings');
  const { user, setUser } = useAuth();
  const { preference, setPreference } = useTheme();
  const toast = useToast();

  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = 'Enter your name.';
    if (avatar.trim() && !/^https:\/\//i.test(avatar.trim())) errs.avatar = 'Use a link that starts with https://';
    setProfileErrors(errs);
    if (Object.keys(errs).length) return;
    setSavingProfile(true);
    try {
      setUser(await authService.updateProfile({ name: name.trim(), avatar: avatar.trim() }));
      invalidate('project', 'tasks', 'activity');
      toast.success('Changes saved.');
    } catch (err) {
      setProfileErrors({ form: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pw.currentPassword) errs.currentPassword = 'Enter your current password.';
    if (pw.newPassword.length < 6) errs.newPassword = 'Use at least 6 characters.';
    if (pw.confirm !== pw.newPassword) errs.confirm = "Passwords don't match.";
    setPwErrors(errs);
    if (Object.keys(errs).length) return;
    setSavingPw(true);
    try {
      await authService.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed.');
    } catch (err) {
      setPwErrors(err.status === 401 ? { currentPassword: err.message } : { form: err.message });
    } finally {
      setSavingPw(false);
    }
  };

  const dirty = name !== user.name || avatar !== (user.avatar || '');

  return (
    <div className="settings-page">
      <PageHeader title="Settings" subtitle="Your profile, appearance and password." />

      <Panel title="Profile">
        <form className="form-stack settings-form" onSubmit={saveProfile} noValidate>
          {profileErrors.form && <p className="form-alert" role="alert">{profileErrors.form}</p>}
          <div className="settings-avatar">
            <Avatar user={{ ...user, name: name || user.name, avatar: /^https:\/\//i.test(avatar) ? avatar : '' }} size={56} />
            <p>Teammates see this next to your tasks and comments. Without a picture, your initials are used.</p>
          </div>
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={profileErrors.name} autoComplete="name" maxLength={80} />
          <Input label="Email" value={user.email} disabled hint="Your email is your sign-in and can't be changed here." />
          <Input label="Picture link" optional type="url" value={avatar} onChange={(e) => setAvatar(e.target.value)} error={profileErrors.avatar} placeholder="https://" />
          <div className="form-actions form-actions-start">
            <Button type="submit" variant="primary" loading={savingProfile} disabled={!dirty}>Save changes</Button>
          </div>
        </form>
      </Panel>

      <Panel title="Appearance">
        <p className="settings-note">Choose a theme, or follow your device. Your choice is remembered on this browser.</p>
        <div className="segmented" role="radiogroup" aria-label="Theme">
          {THEMES.map((t) => (
            <button key={t.value} type="button" role="radio" aria-checked={preference === t.value} onClick={() => setPreference(t.value)}>
              <t.icon size={14} aria-hidden="true" />
              {t.label}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Password">
        <form className="form-stack settings-form" onSubmit={savePassword} noValidate>
          {pwErrors.form && <p className="form-alert" role="alert">{pwErrors.form}</p>}
          <PasswordInput label="Current password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} error={pwErrors.currentPassword} autoComplete="current-password" />
          <PasswordInput label="New password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} error={pwErrors.newPassword} hint="At least 6 characters." autoComplete="new-password" />
          <PasswordInput label="Confirm new password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} error={pwErrors.confirm} autoComplete="new-password" />
          <div className="form-actions form-actions-start">
            <Button type="submit" loading={savingPw} disabled={!pw.currentPassword || !pw.newPassword}>Change password</Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
