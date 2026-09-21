import { useCallback, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Plus, Settings, LayoutGrid, Columns3, List, Activity as ActivityIcon, ClipboardList, CalendarCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import Avatar, { AvatarStack } from '../components/ui/Avatar';
import { StatusIcon, DueLabel } from '../components/ui/Badge';
import { Panel, Progress, Tabs } from '../components/ui/Misc';
import Skeleton from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import Board from '../components/Board';
import TaskTable from '../components/TaskTable';
import TaskForm from '../components/TaskForm';
import ProjectSettings from '../components/ProjectSettings';
import ActivityFeed from '../components/ActivityFeed';
import MemberPopover from '../components/MemberCard';
import { projectPercent } from '../components/ProjectCard';
import { useProject } from '../hooks/useProjects';
import { useActivity } from '../hooks/useWorkspace';
import { useTaskPanel } from '../hooks/useTaskPanel';
import { useDocumentTitle } from '../hooks/useUtilities';
import { useToast } from '../context/ToastContext';
import { taskService } from '../services/task';
import { invalidate, setCached } from '../lib/store';
import { STATUSES, isDone, statusLabel } from '../utils/constants';
import { daysUntil } from '../utils/date';
import { sameId } from '../utils/people';

const TABS = [
  { value: 'overview', label: 'Overview', icon: LayoutGrid },
  { value: 'board', label: 'Board', icon: Columns3 },
  { value: 'list', label: 'List', icon: List },
  { value: 'activity', label: 'Activity', icon: ActivityIcon },
];

export default function ProjectDetails() {
  const { id } = useParams();
  const { project, tasks, loading, error, reload } = useProject(id);
  const [params, setParams] = useSearchParams();
  const { openTask } = useTaskPanel();
  const toast = useToast();
  const [taskForm, setTaskForm] = useState({ open: false, status: 'todo' });
  const [settingsOpen, setSettingsOpen] = useState(false);
  useDocumentTitle(project?.name || 'Project');

  const view = TABS.some((t) => t.value === params.get('view')) ? params.get('view') : 'board';
  const setView = (v) =>
    setParams((p) => {
      const next = new URLSearchParams(p);
      next.set('view', v);
      return next;
    }, { replace: true });

  const moveTask = useCallback(
    async (task, status) => {
      const key = `project:${id}`;
      // Optimistic: the card lands in its new column immediately.
      setCached(key, (d) => ({ ...d, tasks: d.tasks.map((t) => (t._id === task._id ? { ...t, status } : t)) }));
      try {
        await taskService.update(task._id, { status });
        invalidate('project', 'tasks', 'activity', `task:${task._id}`);
        toast.success(`Task status updated to ${statusLabel(status)}.`);
      } catch (err) {
        setCached(key, (d) => ({ ...d, tasks: d.tasks.map((t) => (t._id === task._id ? { ...t, status: task.status } : t)) }));
        toast.error(err.message);
      }
    },
    [id, toast]
  );

  const addTask = useCallback((status = 'todo') => setTaskForm({ open: true, status }), []);

  if (loading) return <ProjectSkeleton />;
  if (error)
    return (
      <div className="panel">
        <ErrorState error={error} onRetry={reload} title="Project not found" backTo="/projects" backLabel="Go back to projects" />
      </div>
    );

  const pct = projectPercent(project);
  const noTasks = tasks.length === 0;
  const firstTaskEmpty = <EmptyState icon={ClipboardList} title="No tasks in this project yet." body="Add the first task, assign it, and give it a due date." action={<Button variant="primary" icon={Plus} onClick={() => addTask()}>Add task</Button>} />;

  return (
    <>
      <header className="project-head">
        <Link to="/projects" className="back-link">
          <ChevronLeft size={14} aria-hidden="true" />
          Projects
        </Link>
        <div className="project-head-row">
          <div className="project-head-text">
            <h1 className="page-title">{project.name}</h1>
            {project.description && <p className="page-subtitle">{project.description}</p>}
          </div>
          <div className="page-actions">
            <Button icon={Settings} onClick={() => setSettingsOpen(true)}>
              Settings
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => addTask()}>
              Add task
            </Button>
          </div>
        </div>
        <div className="project-head-meta">
          <button type="button" className="project-members-btn" onClick={() => setSettingsOpen(true)} aria-label={`${project.members.length} members. Manage members`}>
            <AvatarStack users={project.members} max={5} size={26} />
            <span>{project.members.length} {project.members.length === 1 ? 'member' : 'members'}</span>
          </button>
          <div className="project-head-progress">
            <span className="num">{project.stats.total ? `${project.stats.done} of ${project.stats.total} done` : 'No tasks yet'}</span>
            <Progress value={pct} label="Project completion" />
            <strong className="num">{pct}%</strong>
          </div>
        </div>
      </header>

      <Tabs tabs={TABS.map((t) => (t.value === 'list' ? { ...t, count: tasks.length } : t))} value={view} onChange={setView} label="Project views" />

      <div role="tabpanel" id={`panel-${view}`} aria-labelledby={`tab-${view}`} className="project-view" key={view}>
        {view === 'overview' && <OverviewTab project={project} tasks={tasks} onOpen={openTask} onAdd={addTask} />}
        {view === 'board' && (noTasks ? <div className="panel">{firstTaskEmpty}</div> : <Board tasks={tasks} onOpen={openTask} onMove={moveTask} onAdd={addTask} />)}
        {view === 'list' && <TaskTable tasks={tasks} onOpen={openTask} emptyState={firstTaskEmpty} />}
        {view === 'activity' && <ActivityTab projectId={id} />}
      </div>

      <TaskForm open={taskForm.open} initialStatus={taskForm.status} project={project} onClose={() => setTaskForm((f) => ({ ...f, open: false }))} />
      <ProjectSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} project={project} />
    </>
  );
}

function OverviewTab({ project, tasks, onOpen, onAdd }) {
  const counts = useMemo(() => Object.fromEntries(STATUSES.map((s) => [s.value, tasks.filter((t) => t.status === s.value).length])), [tasks]);
  const upcoming = useMemo(() => tasks.filter((t) => !isDone(t) && t.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5), [tasks]);
  const load = useMemo(
    () =>
      project.members
        .map((m) => {
          const theirs = tasks.filter((t) => sameId(t.assignedTo, m));
          return { member: m, open: theirs.filter((t) => !isDone(t)).length, done: theirs.filter(isDone).length };
        })
        .sort((a, b) => b.open - a.open),
    [project.members, tasks]
  );
  const maxOpen = Math.max(1, ...load.map((l) => l.open));
  const unassigned = tasks.filter((t) => !t.assignedTo && !isDone(t)).length;

  return (
    <div className="overview-grid">
      <Panel title="Status breakdown">
        {tasks.length === 0 ? (
          <EmptyState compact icon={ClipboardList} title="No tasks yet." body="Status counts appear once the project has tasks." action={<Button size="sm" variant="primary" icon={Plus} onClick={() => onAdd()}>Add task</Button>} />
        ) : (
          <ul className="breakdown">
            {STATUSES.map((s) => (
              <li key={s.value}>
                <span className="breakdown-label">
                  <StatusIcon status={s.value} />
                  {s.label}
                </span>
                <span className="breakdown-track" aria-hidden="true">
                  <span className={`breakdown-fill segbar-${s.value}`} style={{ width: `${(counts[s.value] / tasks.length) * 100}%` }} />
                </span>
                <strong className="num">{counts[s.value]}</strong>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Next deadlines" flush>
        {upcoming.length === 0 ? (
          <EmptyState compact icon={CalendarCheck} title="No open deadlines." body="Tasks with a due date will be listed here in order." />
        ) : (
          <ul className="work-list">
            {upcoming.map((t) => (
              <li key={t._id} className="work-row">
                <StatusIcon status={t.status} size={16} />
                <div className="work-main">
                  <button type="button" className="row-title" onClick={() => onOpen(t._id)}>
                    {t.title}
                  </button>
                </div>
                <DueLabel date={t.dueDate} icon={daysUntil(t.dueDate) < 0} />
                <Avatar user={t.assignedTo} size={22} />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Team workload" className="overview-grid-wide" flush>
        <ul className="workload">
          {load.map(({ member, open, done }) => (
            <li key={member._id} className="workload-row">
              <MemberPopover member={member} role={sameId(member, project.createdBy) ? 'Project owner' : 'Member'} openTasks={open} doneTasks={done}>
                <Avatar user={member} size={30} />
                <span className="workload-id">
                  <strong className="truncate">{member.name}</strong>
                  <span>{sameId(member, project.createdBy) ? 'Owner' : 'Member'}</span>
                </span>
              </MemberPopover>
              <span className="workload-track" aria-hidden="true">
                <span className="workload-fill" style={{ width: `${(open / maxOpen) * 100}%` }} />
              </span>
              <span className="workload-nums num">
                <strong>{open}</strong> open<span className="workload-done">{done} done</span>
              </span>
            </li>
          ))}
        </ul>
        {unassigned > 0 && <p className="workload-note num">{unassigned} open {unassigned === 1 ? 'task has' : 'tasks have'} no assignee.</p>}
      </Panel>
    </div>
  );
}

function ActivityTab({ projectId }) {
  const { activity, loading, error, reload } = useActivity({ projectId, limit: 60 });
  return (
    <div className="panel activity-panel">
      <ActivityFeed activity={activity} loading={loading} error={error} onRetry={reload} showProject={false} grouped />
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div role="status" aria-label="Loading project">
      <Skeleton width={70} height={11} />
      <Skeleton width={280} height={28} style={{ marginTop: 14 }} />
      <Skeleton width={420} height={12} style={{ marginTop: 12 }} />
      <Skeleton width={260} height={26} style={{ margin: '22px 0 28px' }} />
      <div className="board">
        {[3, 2, 3, 1, 2].map((n, i) => (
          <div className="board-col" key={i}>
            <div className="board-col-head"><Skeleton width={90} height={12} /></div>
            <div className="board-col-body">
              {Array.from({ length: n }, (_, j) => (
                <div className="task-card" key={j}>
                  <Skeleton width={50} height={10} />
                  <Skeleton width="85%" height={12} style={{ margin: '12px 0 18px' }} />
                  <Skeleton width="45%" height={10} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
