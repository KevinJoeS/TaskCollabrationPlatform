import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, X } from 'lucide-react';
import Modal, { ConfirmDialog } from './ui/Modal';
import Button from './ui/Button';
import Avatar from './ui/Avatar';
import { Input, Textarea } from './ui/Input';
import { projectService } from '../services/project';
import { invalidate } from '../lib/store';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { sameId } from '../utils/people';

export default function ProjectSettings({ open, onClose, project }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const isOwner = sameId(project.createdBy, user);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState('');
  const [confirm, setConfirm] = useState(null); // {kind:'delete'} | {kind:'remove', member}

  useEffect(() => {
    if (open) {
      setName(project.name);
      setDescription(project.description);
      setEmail('');
      setErrors({});
    }
  }, [open, project]);

  const run = async (key, fn, success) => {
    setBusy(key);
    setErrors({});
    try {
      await fn();
      invalidate('project', 'projects', 'tasks', 'activity');
      toast.success(success);
      return true;
    } catch (err) {
      setErrors({ [key]: err.message });
      return false;
    } finally {
      setBusy('');
    }
  };

  const save = (e) => {
    e.preventDefault();
    if (!name.trim()) return setErrors({ details: 'Project name is required.' });
    run('details', () => projectService.update(project._id, { name: name.trim(), description: description.trim() }), 'Changes saved.');
  };

  const add = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (await run('member', () => projectService.addMember(project._id, email.trim()), 'Member added.')) setEmail('');
  };

  const confirmAction = async () => {
    if (confirm.kind === 'delete') {
      if (await run('confirm', () => projectService.remove(project._id), 'Project deleted.')) {
        setConfirm(null);
        onClose();
        navigate('/projects');
      }
    } else if (await run('confirm', () => projectService.removeMember(project._id, confirm.member._id), `${confirm.member.name} removed.`)) {
      setConfirm(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Project settings" size="md">
      <div className="settings-sections">
        <form className="form-stack" onSubmit={save} noValidate>
          <Input label="Project name" value={name} onChange={(e) => setName(e.target.value)} disabled={!isOwner} maxLength={120} error={errors.details} />
          <Textarea label="Description" optional value={description} onChange={(e) => setDescription(e.target.value)} disabled={!isOwner} rows={3} />
          {isOwner ? (
            <div className="form-actions">
              <Button type="submit" variant="primary" loading={busy === 'details'} disabled={name === project.name && description === project.description}>
                Save changes
              </Button>
            </div>
          ) : (
            <p className="field-hint">Only the project owner can edit these details.</p>
          )}
        </form>

        <section>
          <h3 className="settings-title">Members</h3>
          <ul className="member-rows">
            {project.members.map((m) => (
              <li key={m._id} className="member-row">
                <Avatar user={m} size={30} />
                <span className="member-row-id">
                  <strong className="truncate">{m.name}{sameId(m, user) ? ' (you)' : ''}</strong>
                  <span className="truncate">{m.email}</span>
                </span>
                <span className="member-row-role">{sameId(m, project.createdBy) ? 'Owner' : 'Member'}</span>
                {isOwner && !sameId(m, project.createdBy) && (
                  <button type="button" className="icon-btn icon-btn-sm" aria-label={`Remove ${m.name}`} onClick={() => setConfirm({ kind: 'remove', member: m })}>
                    <X size={15} aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {isOwner && (
            <form className="member-add" onSubmit={add} noValidate>
              <Input label="Add a member by email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@company.com" error={errors.member} hint="They need a TaskCollab account first." />
              <Button type="submit" icon={UserPlus} loading={busy === 'member'} disabled={!email.trim()}>
                Add member
              </Button>
            </form>
          )}
        </section>

        {isOwner && (
          <section className="danger-zone">
            <div>
              <h3 className="settings-title">Delete project</h3>
              <p>Removes the project with all of its tasks, comments and activity. This cannot be undone.</p>
            </div>
            <Button variant="danger" onClick={() => setConfirm({ kind: 'delete' })}>
              Delete project
            </Button>
          </section>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={confirmAction}
        loading={busy === 'confirm'}
        danger
        title={confirm?.kind === 'delete' ? `Delete "${project.name}"?` : `Remove ${confirm?.member.name}?`}
        body={errors.confirm || (confirm?.kind === 'delete' ? 'All tasks, comments and activity in this project will be permanently deleted.' : 'They will lose access to this project and their tasks here will become unassigned.')}
        confirmLabel={confirm?.kind === 'delete' ? 'Delete project' : 'Remove member'}
      />
    </Modal>
  );
}
