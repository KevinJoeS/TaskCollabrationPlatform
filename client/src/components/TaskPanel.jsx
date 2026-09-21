import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, X, Link2, MessageSquare, Send, FolderKanban } from 'lucide-react';
import Modal, { ConfirmDialog } from './ui/Modal';
import Button, { IconButton } from './ui/Button';
import Avatar from './ui/Avatar';
import { StatusIcon, PriorityIcon, DueLabel } from './ui/Badge';
import { SelectControl } from './ui/Select';
import Skeleton from './ui/Skeleton';
import { EmptyState, ErrorState } from './ui/States';
import { useTask, useComments } from '../hooks/useTasks';
import { useTaskPanel } from '../hooks/useTaskPanel';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { taskService } from '../services/task';
import { commentService } from '../services/comment';
import { invalidate, setCached } from '../lib/store';
import { STATUSES, PRIORITIES, isDone, statusLabel } from '../utils/constants';
import { formatDateTime, timeAgo, toInputDate, fromInputDate } from '../utils/date';
import { sameId } from '../utils/people';

/** Task detail as a side panel over whatever page is underneath (full screen on phones). */
export default function TaskPanel() {
  const { taskId, closeTask } = useTaskPanel();
  return (
    <Modal open={Boolean(taskId)} onClose={closeTask} variant="panel" hideHeader labelledBy="task-panel-title">
      {taskId && <TaskPanelContent key={taskId} taskId={taskId} onClose={closeTask} />}
    </Modal>
  );
}

function TaskPanelContent({ taskId, onClose }) {
  const { task, loading, error, reload } = useTask(taskId);
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (loading) return <PanelSkeleton onClose={onClose} />;
  if (error)
    return (
      <div className="task-panel">
        <div className="task-panel-bar">
          <span />
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>
        <ErrorState error={error} onRetry={reload} title="Task not found" backTo="/dashboard" />
      </div>
    );

  const update = async (patch, message) => {
    const previous = task;
    // Optimistic: the panel changes at once and rolls back if the server refuses.
    setCached(`task:${taskId}`, (t) => ({ ...t, ...patch, assignedTo: 'assignedTo' in patch ? task.project.members.find((m) => sameId(m, patch.assignedTo)) || null : t.assignedTo }));
    try {
      await taskService.update(taskId, patch);
      invalidate('project', 'tasks', 'activity', `task:${taskId}`);
      toast.success(message);
    } catch (err) {
      setCached(`task:${taskId}`, previous);
      toast.error(err.message);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await taskService.remove(taskId);
      invalidate('project', 'tasks', 'activity');
      toast.success('Task deleted.');
      onClose();
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied.');
    } catch {
      toast.error("Couldn't copy the link.");
    }
  };

  return (
    <div className="task-panel">
      <div className="task-panel-bar">
        <Link to={`/projects/${task.project._id}`} className="task-panel-project" onClick={onClose}>
          <FolderKanban size={14} aria-hidden="true" />
          {task.project.name}
        </Link>
        <span className="task-panel-bar-actions">
          <IconButton icon={Link2} label="Copy link to task" onClick={copyLink} />
          <IconButton icon={Trash2} label="Delete task" onClick={() => setConfirmDelete(true)} />
          <IconButton icon={X} label="Close" onClick={onClose} />
        </span>
      </div>

      <div className="task-panel-scroll">
        <EditableTitle value={task.title} onSave={(title) => update({ title }, 'Changes saved.')} />

        <dl className="task-props">
          <Prop label="Status" icon={<StatusIcon status={task.status} />}>
            <SelectControl size="sm" aria-label="Status" value={task.status} options={STATUSES} onChange={(e) => update({ status: e.target.value }, `Task status updated to ${statusLabel(e.target.value)}.`)} />
          </Prop>
          <Prop label="Priority" icon={<PriorityIcon priority={task.priority} />}>
            <SelectControl size="sm" aria-label="Priority" value={task.priority} options={PRIORITIES} onChange={(e) => update({ priority: e.target.value }, 'Priority updated.')} />
          </Prop>
          <Prop label="Assignee" icon={<Avatar user={task.assignedTo} size={18} />}>
            <SelectControl
              size="sm"
              aria-label="Assignee"
              value={task.assignedTo?._id || ''}
              onChange={(e) => {
                const m = task.project.members.find((x) => x._id === e.target.value);
                update({ assignedTo: e.target.value || null }, m ? `Task assigned to ${m.name}.` : 'Task unassigned.');
              }}
            >
              <option value="">Unassigned</option>
              {task.project.members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </SelectControl>
          </Prop>
          <Prop label="Due date">
            <div className="task-due-edit">
              <input className="control control-sm" type="date" aria-label="Due date" value={toInputDate(task.dueDate)} onChange={(e) => update({ dueDate: fromInputDate(e.target.value) }, e.target.value ? 'Due date updated.' : 'Due date cleared.')} />
              {task.dueDate && !isDone(task) && <DueLabel date={task.dueDate} icon={false} />}
            </div>
          </Prop>
        </dl>

        <EditableDescription value={task.description} onSave={(description) => update({ description }, 'Changes saved.')} />

        <p className="task-stamps">
          Created {formatDateTime(task.createdAt)}
          {task.createdBy?.name ? ` by ${task.createdBy.name}` : ''}. Updated {timeAgo(task.updatedAt)}.
        </p>

        <Comments taskId={taskId} />
      </div>

      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={remove} loading={deleting} danger title="Delete this task?" body={`"${task.title}" and its comments will be permanently deleted.`} confirmLabel="Delete task" />
    </div>
  );
}

function Prop({ label, icon, children }) {
  return (
    <div className="task-prop">
      <dt>{label}</dt>
      <dd>
        {icon && <span className="task-prop-icon">{icon}</span>}
        {children}
      </dd>
    </div>
  );
}

function EditableTitle({ value, onSave }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => {
    const next = draft.trim();
    if (!next) return setDraft(value);
    if (next !== value) onSave(next);
  };
  return (
    <h2 id="task-panel-title" className="task-title-wrap">
      <textarea
        className="task-title-input"
        aria-label="Task title"
        rows={1}
        value={draft}
        maxLength={200}
        onChange={(e) => setDraft(e.target.value.replace(/\n/g, ''))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        ref={(el) => {
          if (el) {
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
          }
        }}
      />
    </h2>
  );
}

function EditableDescription({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  useEffect(() => setDraft(value || ''), [value]);
  if (!editing) {
    return (
      <section className="task-desc" aria-label="Description">
        <h3 className="task-section-title">Description</h3>
        <button type="button" className={`task-desc-view ${value ? '' : 'is-empty'}`} onClick={() => setEditing(true)}>
          {value || 'Add a description'}
        </button>
      </section>
    );
  }
  return (
    <section className="task-desc" aria-label="Description">
      <h3 className="task-section-title">Description</h3>
      <textarea className="control control-textarea" aria-label="Description" rows={5} autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} />
      <div className="task-desc-actions">
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            if (draft.trim() !== (value || '')) onSave(draft.trim());
            setEditing(false);
          }}
        >
          Save changes
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setDraft(value || '');
            setEditing(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </section>
  );
}

function Comments({ taskId }) {
  const { user } = useAuth();
  const toast = useToast();
  const { comments, loading, error, reload } = useComments(taskId);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const submit = async (e) => {
    e?.preventDefault();
    const text = content.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const comment = await commentService.add(taskId, text);
      setCached(`comments:${taskId}`, (list) => [...list, comment]);
      setContent('');
      invalidate('project', 'tasks', 'activity');
      toast.success('Comment added.');
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const remove = async (id) => {
    try {
      await commentService.remove(id);
      setCached(`comments:${taskId}`, (list) => list.filter((c) => c._id !== id));
      invalidate('project', 'tasks');
      toast.success('Comment deleted.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <section className="comments" aria-label="Comments">
      <h3 className="task-section-title">
        Conversation {comments?.length > 0 && <span className="num task-section-count">{comments.length}</span>}
      </h3>
      {loading ? (
        <div className="comment-skeleton">
          <Skeleton width={30} height={30} radius="50%" />
          <div>
            <Skeleton width="40%" height={11} />
            <Skeleton width="85%" height={11} style={{ marginTop: 8 }} />
          </div>
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={reload} compact />
      ) : comments.length === 0 ? (
        <EmptyState compact icon={MessageSquare} title="No comments yet." body="Ask a question or share an update. Everyone on the project can reply." />
      ) : (
        <ol className="comment-list">
          {comments.map((c) => {
            const mine = sameId(c.author, user);
            return (
              <li key={c._id} className="comment">
                <Avatar user={c.author} size={30} />
                <div className="comment-main">
                  <p className="comment-head">
                    <strong>{mine ? 'You' : c.author?.name}</strong>
                    <time dateTime={c.createdAt} title={formatDateTime(c.createdAt)}>
                      {timeAgo(c.createdAt)}
                    </time>
                    {mine && (
                      <button type="button" className="comment-delete" onClick={() => remove(c._id)}>
                        Delete
                      </button>
                    )}
                  </p>
                  <p className="comment-body">{c.content}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <span ref={endRef} />
      <form className="comment-form" onSubmit={submit}>
        <Avatar user={user} size={30} />
        <div className="comment-box">
          <textarea
            aria-label="Write a comment"
            placeholder="Write a comment"
            rows={2}
            value={content}
            maxLength={4000}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit();
            }}
          />
          <div className="comment-box-foot">
            <span>Ctrl + Enter to send</span>
            <Button type="submit" size="sm" variant="primary" icon={Send} loading={sending} disabled={!content.trim()}>
              Add comment
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}

function PanelSkeleton({ onClose }) {
  return (
    <div className="task-panel" role="status" aria-label="Loading task">
      <div className="task-panel-bar">
        <Skeleton width={120} height={12} />
        <IconButton icon={X} label="Close" onClick={onClose} />
      </div>
      <div className="task-panel-scroll">
        <Skeleton width="70%" height={24} />
        <div className="task-props" style={{ marginTop: 28 }}>
          {[0, 1, 2, 3].map((i) => (
            <div className="task-prop" key={i}>
              <Skeleton width={60} height={10} />
              <Skeleton width={140} height={28} />
            </div>
          ))}
        </div>
        <Skeleton height={10} style={{ marginTop: 32 }} />
        <Skeleton width="80%" height={10} style={{ marginTop: 10 }} />
      </div>
    </div>
  );
}
