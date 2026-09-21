import { useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Plus, ListChecks, FolderKanban, CalendarCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import Avatar, { AvatarStack } from '../components/ui/Avatar';
import { StatusIcon, StatusBadge, PriorityBadge, DueLabel } from '../components/ui/Badge';
import { Panel, Progress } from '../components/ui/Misc';
import Skeleton, { SkeletonRows } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import ActivityFeed from '../components/ActivityFeed';
import { projectPercent } from '../components/ProjectCard';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useActivity } from '../hooks/useWorkspace';
import { useTaskPanel } from '../hooks/useTaskPanel';
import { useDocumentTitle } from '../hooks/useUtilities';
import { STATUSES, isDone, priorityRank } from '../utils/constants';
import { daysUntil, greeting, startOfDay } from '../utils/date';
import { firstName } from '../utils/people';

const OPEN_STATUSES = STATUSES.filter((s) => s.value !== 'done');

/** Overdue first, then nearest deadline, then priority. Undated work goes last. */
const byUrgency = (a, b) => {
  if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate) || priorityRank(b.priority) - priorityRank(a.priority);
  if (a.dueDate) return -1;
  if (b.dueDate) return 1;
  return priorityRank(b.priority) - priorityRank(a.priority);
};

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { openNewProject } = useOutletContext();
  const { openTask } = useTaskPanel();
  const projects = useProjects();
  const mine = useTasks('mine');
  const all = useTasks('all');
  const activity = useActivity({ limit: 8 });

  const summary = useMemo(() => {
    const tasks = mine.tasks || [];
    const open = tasks.filter((t) => !isDone(t));
    const byStatus = Object.fromEntries(OPEN_STATUSES.map((s) => [s.value, open.filter((t) => t.status === s.value).length]));
    const overdue = open.filter((t) => t.dueDate && daysUntil(t.dueDate) < 0).length;
    const dueThisWeek = open.filter((t) => t.dueDate && daysUntil(t.dueDate) >= 0 && daysUntil(t.dueDate) <= 7).length;
    const today = startOfDay(new Date());
    const days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(today.getTime() + i * 86400000);
      return { date, count: open.filter((t) => t.dueDate && daysUntil(t.dueDate) === i).length };
    });
    return { total: tasks.length, open, done: tasks.length - open.length, byStatus, overdue, dueThisWeek, days };
  }, [mine.tasks]);

  const deadlines = useMemo(
    () =>
      (all.tasks || [])
        .filter((t) => !isDone(t) && t.dueDate && daysUntil(t.dueDate) <= 14)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 6),
    [all.tasks]
  );

  const activeProjects = (projects.projects || []).filter((p) => !p.stats?.total || p.stats.done < p.stats.total);

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="page-title">
            {greeting()}, {firstName(user?.name)}
          </h1>
          <p className="page-subtitle">Here's what needs your attention today.</p>
        </div>
        <div className="page-actions">
          <Button variant="primary" icon={Plus} onClick={openNewProject}>
            New project
          </Button>
        </div>
      </header>

      <Overview loading={mine.loading || projects.loading} error={mine.error || projects.error} onRetry={() => { mine.reload(); projects.reload(); }} summary={summary} activeProjects={activeProjects.length} totalProjects={projects.projects?.length || 0} />

      <div className="dash-grid">
        <div className="dash-col">
          <Panel title="My work" flush action={<Link className="panel-link" to="/tasks">View all</Link>}>
            {mine.loading ? (
              <SkeletonRows rows={5} />
            ) : mine.error ? (
              <ErrorState error={mine.error} onRetry={mine.reload} compact />
            ) : summary.open.length === 0 ? (
              <EmptyState compact icon={ListChecks} title="No tasks assigned." body="Your workload is clear for now." action={<Button size="sm" to="/projects">Browse projects</Button>} />
            ) : (
              <ul className="work-list">
                {[...summary.open].sort(byUrgency).slice(0, 7).map((t) => (
                  <li key={t._id} className="work-row">
                    <StatusIcon status={t.status} size={16} />
                    <div className="work-main">
                      <button type="button" className="row-title" onClick={() => openTask(t._id)}>
                        {t.title}
                      </button>
                      <span className="work-project truncate">{t.project?.name}</span>
                    </div>
                    <span className="work-cell work-priority"><PriorityBadge priority={t.priority} /></span>
                    <span className="work-cell work-status"><StatusBadge status={t.status} plain /></span>
                    <span className="work-cell work-due"><DueLabel date={t.dueDate} icon={false} /></span>
                    <Avatar user={t.assignedTo} size={22} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent activity" flush action={<Link className="panel-link" to="/activity">View all</Link>}>
            <ActivityFeed activity={activity.activity} loading={activity.loading} error={activity.error} onRetry={activity.reload} />
          </Panel>
        </div>

        <div className="dash-col">
          <Panel title="Upcoming deadlines" flush>
            {all.loading ? (
              <SkeletonRows rows={4} />
            ) : all.error ? (
              <ErrorState error={all.error} onRetry={all.reload} compact />
            ) : deadlines.length === 0 ? (
              <EmptyState compact icon={CalendarCheck} title="No deadlines in the next two weeks." body="Tasks with a due date will line up here." />
            ) : (
              <ol className="deadline-list">
                {deadlines.map((t) => {
                  const n = daysUntil(t.dueDate);
                  const d = new Date(t.dueDate);
                  const level = n < 0 ? 'overdue' : n <= 1 ? 'soon' : 'later';
                  return (
                    <li key={t._id} className={`deadline deadline-${level}`}>
                      <span className="deadline-date num" aria-hidden="true">
                        <strong>{d.getDate()}</strong>
                        {d.toLocaleString(undefined, { month: 'short' })}
                      </span>
                      <div className="deadline-main">
                        <button type="button" className="row-title" onClick={() => openTask(t._id)}>
                          {t.title}
                        </button>
                        <span className="deadline-meta">
                          <DueLabel date={t.dueDate} icon={false} />
                          <span className="truncate">{t.project?.name}</span>
                        </span>
                      </div>
                      <Avatar user={t.assignedTo} size={22} />
                    </li>
                  );
                })}
              </ol>
            )}
          </Panel>

          <Panel title="Project progress" flush action={<Link className="panel-link" to="/projects">All projects</Link>}>
            {projects.loading ? (
              <SkeletonRows rows={3} />
            ) : projects.error ? (
              <ErrorState error={projects.error} onRetry={projects.reload} compact />
            ) : projects.projects.length === 0 ? (
              <EmptyState compact icon={FolderKanban} title="No projects yet." body="Create your first project and bring your team together." action={<Button size="sm" variant="primary" icon={Plus} onClick={openNewProject}>New project</Button>} />
            ) : (
              <ul className="progress-list">
                {activeProjects.concat(projects.projects.filter((p) => !activeProjects.includes(p))).slice(0, 5).map((p) => {
                  const pct = projectPercent(p);
                  return (
                    <li key={p._id}>
                      <Link to={`/projects/${p._id}`} className="progress-row">
                        <span className="progress-row-top">
                          <strong className="truncate">{p.name}</strong>
                          <span className="num progress-row-pct">{pct}%</span>
                        </span>
                        <Progress value={pct} size="sm" label={`${p.name} completion`} />
                        <span className="progress-row-foot">
                          <span className="num">{p.stats.total ? `${p.stats.done} of ${p.stats.total} tasks` : 'No tasks yet'}</span>
                          <AvatarStack users={p.members} max={3} size={20} />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

/** The overview band: one lead figure with its breakdown, three supporting figures, and a two-week due-date strip. */
function Overview({ loading, error, onRetry, summary, activeProjects, totalProjects }) {
  if (error) return <div className="panel overview overview-error"><ErrorState error={error} onRetry={onRetry} compact /></div>;
  if (loading) {
    return (
      <section className="panel overview" role="status" aria-label="Loading overview">
        <div className="overview-lead">
          <Skeleton width={110} height={11} />
          <Skeleton width={90} height={44} style={{ margin: '14px 0 18px' }} />
          <Skeleton height={8} />
        </div>
        <div className="overview-side">
          <div className="overview-stats">
            {[0, 1, 2].map((i) => (
              <div className="overview-stat" key={i}>
                <Skeleton width={90} height={11} />
                <Skeleton width={48} height={24} style={{ marginTop: 10 }} />
              </div>
            ))}
          </div>
          <Skeleton height={44} style={{ margin: '0 24px 20px' }} />
        </div>
      </section>
    );
  }

  const openCount = summary.open.length;
  const max = Math.max(1, ...summary.days.map((d) => d.count));
  return (
    <section className="panel overview" aria-label="Overview">
      <div className="overview-lead">
        <h2 className="overview-label">Tasks assigned to you</h2>
        <p className="overview-figure num">
          {openCount}
          <span>open</span>
        </p>
        {openCount > 0 ? (
          <>
            <div className="segbar" role="img" aria-label={OPEN_STATUSES.map((s) => `${summary.byStatus[s.value]} ${s.label}`).join(', ')}>
              {OPEN_STATUSES.map((s) => summary.byStatus[s.value] > 0 && <span key={s.value} className={`segbar-part segbar-${s.value}`} style={{ flexGrow: summary.byStatus[s.value] }} />)}
            </div>
            <ul className="segbar-legend">
              {OPEN_STATUSES.map((s) => (
                <li key={s.value}>
                  <span className={`segbar-key segbar-${s.value}`} aria-hidden="true" />
                  {s.label}
                  <strong className="num">{summary.byStatus[s.value]}</strong>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="overview-clear">Nothing is waiting on you. New assignments will appear here.</p>
        )}
      </div>

      <div className="overview-side">
        <dl className="overview-stats">
          <div className="overview-stat">
            <dt>Active projects</dt>
            <dd className="num">{activeProjects}<span>of {totalProjects}</span></dd>
          </div>
          <div className="overview-stat">
            <dt>Tasks completed</dt>
            <dd className="num">{summary.done}<span>of {summary.total} assigned</span></dd>
          </div>
          <div className="overview-stat">
            <dt>Upcoming deadlines</dt>
            <dd className="num">
              {summary.dueThisWeek}
              <span>in 7 days</span>
              {summary.overdue > 0 && <em className="overview-overdue">{summary.overdue} overdue</em>}
            </dd>
          </div>
        </dl>
        <div className="duestrip" role="img" aria-label={`Your due dates over the next 14 days: ${summary.days.filter((d) => d.count).map((d) => `${d.count} on ${d.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`).join(', ') || 'none'}`}>
          <span className="duestrip-title">Your next 14 days</span>
          <div className="duestrip-days" aria-hidden="true">
            {summary.days.map((d, i) => (
              <span key={i} className={`duestrip-day ${i === 0 ? 'is-today' : ''} ${d.date.getDay() === 0 || d.date.getDay() === 6 ? 'is-weekend' : ''}`} title={`${d.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}: ${d.count} due`}>
                <span className="duestrip-bar-slot">
                  {d.count > 0 && <span className={`duestrip-bar ${i <= 1 ? 'is-soon' : ''}`} style={{ height: `${Math.max(22, (d.count / max) * 100)}%` }} />}
                </span>
                <span className="duestrip-num num">{d.date.getDate()}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
