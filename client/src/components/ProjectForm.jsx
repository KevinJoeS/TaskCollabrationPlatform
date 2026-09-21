import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { Field, Input, Textarea } from './ui/Input';
import { projectService } from '../services/project';
import { invalidate } from '../lib/store';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProjectForm({ open, onClose }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emails, setEmails] = useState([]);
  const [draft, setDraft] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setEmails([]);
      setDraft('');
      setErrors({});
    }
  }, [open]);

  /** Returns the updated list, or null when the draft is invalid. */
  const commitDraft = () => {
    const parts = draft.split(/[\s,;]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (!parts.length) return emails;
    const bad = parts.find((p) => !EMAIL_RE.test(p));
    if (bad) {
      setErrors((e) => ({ ...e, members: `"${bad}" is not a valid email address.` }));
      return null;
    }
    if (parts.includes(user.email)) {
      setErrors((e) => ({ ...e, members: "You're added automatically as the project owner." }));
      return null;
    }
    const next = [...new Set([...emails, ...parts])];
    setEmails(next);
    setDraft('');
    setErrors((e) => ({ ...e, members: undefined }));
    return next;
  };

  const onMemberKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitDraft();
    } else if (e.key === 'Backspace' && !draft && emails.length) {
      setEmails(emails.slice(0, -1));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setErrors({ name: 'Give the project a name.' });
    const memberEmails = commitDraft();
    if (!memberEmails) return;
    setSaving(true);
    setErrors({});
    try {
      const { project, notFound } = await projectService.create({ name: name.trim(), description: description.trim(), memberEmails });
      invalidate('projects', 'activity');
      toast.success('Project created.');
      if (notFound?.length) toast.info(`No TaskCollab account for ${notFound.join(', ')}. Add them once they register.`, { duration: 7000 });
      onClose();
      navigate(`/projects/${project._id}`);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New project" description="A project holds the tasks, people and conversation for one piece of work.">
      <form className="form-stack" onSubmit={submit} noValidate>
        {errors.form && (
          <p className="form-alert" role="alert">
            {errors.form}
          </p>
        )}
        <Input label="Project name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder="Website relaunch" maxLength={120} data-autofocus />
        <Textarea label="Description" optional value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What is this project for?" />
        <Field label="Members" optional error={errors.members} hint="Type an email and press Enter. People need a TaskCollab account to be added.">
          {(a11y) => (
            <div className="chip-input">
              {emails.map((em) => (
                <span className="chip" key={em}>
                  {em}
                  <button type="button" onClick={() => setEmails(emails.filter((x) => x !== em))} aria-label={`Remove ${em}`}>
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              ))}
              <input {...a11y} type="email" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onMemberKey} onBlur={() => draft && commitDraft()} placeholder={emails.length ? '' : 'teammate@company.com'} />
            </div>
          )}
        </Field>
        <div className="form-actions">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            Create project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
