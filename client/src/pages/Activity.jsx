import { useState } from 'react';
import { PageHeader } from '../components/ui/Misc';
import { SelectControl } from '../components/ui/Select';
import Button from '../components/ui/Button';
import ActivityFeed from '../components/ActivityFeed';
import { useActivity } from '../hooks/useWorkspace';
import { useProjects } from '../hooks/useProjects';
import { useDocumentTitle } from '../hooks/useUtilities';

const PAGE = 40;

export default function Activity() {
  useDocumentTitle('Activity');
  const { projects } = useProjects();
  const [projectId, setProjectId] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const { activity, loading, refreshing, error, reload } = useActivity({ projectId: projectId || undefined, limit });

  return (
    <>
      <PageHeader
        title="Activity"
        subtitle="What's changed across your projects, newest first."
        actions={
          projects?.length > 1 && (
            <SelectControl size="sm" aria-label="Filter by project" value={projectId} onChange={(e) => { setProjectId(e.target.value); setLimit(PAGE); }} className="toolbar-select">
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </SelectControl>
          )
        }
      />
      <div className="panel activity-panel">
        <ActivityFeed activity={activity} loading={loading} error={error} onRetry={reload} grouped showProject={!projectId} emptyAction={<Button size="sm" to="/projects">Go to projects</Button>} />
        {activity?.length >= limit && limit < 100 && (
          <div className="activity-more">
            <Button size="sm" loading={refreshing} onClick={() => setLimit((l) => Math.min(100, l + PAGE))}>Show older activity</Button>
          </div>
        )}
      </div>
    </>
  );
}
