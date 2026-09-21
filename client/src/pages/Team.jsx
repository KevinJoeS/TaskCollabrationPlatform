import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { StatusIcon, DueLabel } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/Misc';
import { SkeletonRows } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import { MemberSummary } from '../components/MemberCard';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useActivity } from '../hooks/useWorkspace';
import { useAuth } from '../hooks/useAuth';
import { useTaskPanel } from '../hooks/useTaskPanel';
import { useDocumentTitle } from '../hooks/useUtilities';
import { isDone } from '../utils/constants';
import { timeAgo } from '../utils/date';
import { sameId } from '../utils/people';

export default function Team() {
  useDocumentTitle('Team');
  const { user } = useAuth();
  const projects = useProjects();
  const tasks = useTasks('all');
  const activity = useActivity({ limit: 100 });
  const [params, setParams] = useSearchParams();
  const { openTask } = useTaskPanel();

  const people = useMemo(() => {
    if (!projects.projects) return [];
    const map = new Map();
    for (const p of projects.projects) {
      for (const m of p.members) {
        if (!map.has(m._id)) map.set(m._id, { member: m, projects: [], owns: 0, open: [], done: 0, lastActive: null });
        const row = map.get(m._id);
        row.projects.push(p);
        if (sameId(p.createdBy, m)) row.owns += 1;
      }
    }
    for (const t of tasks.tasks || []) {
      const row = t.assignedTo && map.get(t.assignedTo._id);
      if (!row) continue;
      if (isDone(t)) row.done += 1;
      else row.open.push(t);
    }
    for (const a of activity.activity || []) {
      const row = a.actor && map.get(a.actor._id);
      if (row && !row.lastActive) row.lastActive = a.createdAt; // feed is newest first
    }
    return [...map.values()].sort((a, b) => (sameId(a.member, user) ? -1 : sameId(b.member, user) ? 1 : a.member.name.localeCompare(b.member.name)));
  }, [projects.projects, tasks.tasks, activity.activity, user]);

  const roleOf = (row) => (row.owns ? `Owner of ${row.owns} ${row.owns === 1 ? 'project' : 'projects'}` : 'Member');
  const selected = people.find((r) => r.member._id === params.get('member'));
  const select = (id) =>
    setParams((p) => {
      const next = new URLSearchParams(p);
      if (id) next.set('member', id);
      else next.delete('member');
      return next;
    }, { replace: true });

  const loading = projects.loading || tasks.loading;
  const error = projects.error || tasks.error;

  return (
    <>
      <PageHeader title="Team" subtitle="Everyone you share a project with, and what they're carrying." />
      <div className="panel">
        {loading ? (
          <SkeletonRows rows={5} avatar />
        ) : error ? (
          <ErrorState error={error} onRetry={() => { projects.reload(); tasks.reload(); }} />
        ) : people.length <= 1 ? (
          <EmptyState icon={Users} title="It's just you so far." body="Add teammates to a project and they'll appear here with their workload." action={<Button to="/projects" variant="primary">Go to projects</Button>} />
        ) : (
          <ul className="team-list">
            <li className="team-row team-row-head" aria-hidden="true">
              <span>Person</span>
              <span>Role</span>
              <span>Projects</span>
              <span>Open tasks</span>
              <span>Last active</span>
            </li>
            {people.map((row) => (
              <li key={row.member._id}>
                <button type="button" className="team-row" onClick={() => select(row.member._id)} aria-label={`${row.member.name}, ${roleOf(row)}, ${row.open.length} open tasks. View profile summary`}>
                  <span className="team-person">
                    <Avatar user={row.member} size={34} />
                    <span className="team-person-id">
                      <strong className="truncate">{row.member.name}{sameId(row.member, user) ? ' (you)' : ''}</strong>
                      <span className="truncate">{row.member.email}</span>
                    </span>
                  </span>
                  <span data-label="Role">{roleOf(row)}</span>
                  <span data-label="Projects" className="num">{row.projects.length}</span>
                  <span data-label="Open tasks" className="num">{row.open.length}</span>
                  <span data-label="Last active" className="cell-muted">{row.lastActive ? timeAgo(row.lastActive) : 'No recent activity'}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={Boolean(selected)} onClose={() => select(null)} title="Profile summary" size="sm">
        {selected && (
          <div className="member-modal">
            <MemberSummary member={selected.member} role={roleOf(selected)} openTasks={selected.open.length} doneTasks={selected.done} lastActive={selected.lastActive ? timeAgo(selected.lastActive) : null} />
            <h3 className="settings-title">Shared projects</h3>
            <ul className="member-projects">
              {selected.projects.map((p) => (
                <li key={p._id}>
                  <Link to={`/projects/${p._id}`} className="text-link">{p.name}</Link>
                </li>
              ))}
            </ul>
            {selected.open.length > 0 && (
              <>
                <h3 className="settings-title">Open tasks</h3>
                <ul className="work-list work-list-inset">
                  {selected.open.slice(0, 6).map((t) => (
                    <li key={t._id} className="work-row">
                      <StatusIcon status={t.status} size={15} />
                      <div className="work-main">
                        <button type="button" className="row-title" onClick={() => { select(null); setTimeout(() => openTask(t._id), 0); }}>
                          {t.title}
                        </button>
                      </div>
                      <DueLabel date={t.dueDate} icon={false} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
