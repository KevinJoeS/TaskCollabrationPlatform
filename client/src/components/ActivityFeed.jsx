import { Activity as ActivityIcon } from 'lucide-react';
import ActivityItem from './ActivityItem';
import { SkeletonRows } from './ui/Skeleton';
import { EmptyState, ErrorState } from './ui/States';
import { dayHeading } from '../utils/date';

export default function ActivityFeed({ activity, loading, error, onRetry, showProject = true, grouped = false, emptyAction }) {
  if (loading) return <SkeletonRows rows={5} avatar />;
  if (error) return <ErrorState error={error} onRetry={onRetry} compact />;
  if (!activity?.length) return <EmptyState compact icon={ActivityIcon} title="No activity yet." body="Team activity will appear here." action={emptyAction} />;

  if (!grouped) {
    return (
      <ul className="activity-list">
        {activity.map((a) => (
          <ActivityItem key={a._id} item={a} showProject={showProject} />
        ))}
      </ul>
    );
  }
  const groups = [];
  for (const a of activity) {
    const heading = dayHeading(a.createdAt);
    const last = groups[groups.length - 1];
    if (last?.heading === heading) last.items.push(a);
    else groups.push({ heading, items: [a] });
  }
  return (
    <div className="activity-groups">
      {groups.map((g) => (
        <section key={g.heading}>
          <h3 className="activity-day">{g.heading}</h3>
          <ul className="activity-list">
            {g.items.map((a) => (
              <ActivityItem key={a._id} item={a} showProject={showProject} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
