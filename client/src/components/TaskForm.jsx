import { useEffect, useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { Input, Textarea } from './ui/Input';
import Select from './ui/Select';
import { STATUSES, PRIORITIES } from '../utils/constants';
import { fromInputDate } from '../utils/date';
import { taskService } from '../services/task';
import { invalidate } from '../lib/store';
import { useToast } from '../context/ToastContext';

const blank = (status) => ({ title: '', description: '', assignedTo: '', priority: 'medium', status: status || 'todo', dueDate: '' });

export default function TaskForm({ open, onClose, project, initialStatus }) {
  const toast = useToast();
  const [form, setForm] = useState(blank(initialStatus));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(blank(initialStatus));
      setErrors({});
    }
  }, [open, initialStatus]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setErrors({ title: 'Give the task a name.' });
    setSaving(true);
    setErrors({});
    try {
      const task = await taskService.create({
        project: project._id,
        title: form.title.trim(),
        description: form.description.trim(),
        assignedTo: form.assignedTo || null,
        priority: form.priority,
        status: form.status,
        dueDate: fromInputDate(form.dueDate),
      });
      invalidate('project', 'tasks', 'activity');
      toast.success(task.assignedTo ? `Task assigned to ${task.assignedTo.name}.` : 'Task created.');
      onClose();
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New task" description={project ? `In ${project.name}` : undefined}>
      <form className="form-stack" onSubmit={submit} noValidate>
        {errors.form && (
          <p className="form-alert" role="alert">
            {errors.form}
          </p>
        )}
        <Input label="Task name" value={form.title} onChange={set('title')} error={errors.title} placeholder="What needs to be done?" maxLength={200} data-autofocus />
        <Textarea label="Description" optional value={form.description} onChange={set('description')} rows={3} placeholder="Context, links, acceptance criteria" />
        <div className="form-row">
          <Select label="Assignee" value={form.assignedTo} onChange={set('assignedTo')}>
            <option value="">Unassigned</option>
            {project?.members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </Select>
          <Select label="Status" value={form.status} onChange={set('status')} options={STATUSES} />
        </div>
        <div className="form-row">
          <Select label="Priority" value={form.priority} onChange={set('priority')} options={PRIORITIES} />
          <Input label="Due date" optional type="date" value={form.dueDate} onChange={set('dueDate')} />
        </div>
        <div className="form-actions">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            Create task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
