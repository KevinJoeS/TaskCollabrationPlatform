import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, FolderKanban, Search, SearchX } from 'lucide-react';
import Button from '../components/ui/Button';
import { PageHeader } from '../components/ui/Misc';
import { SkeletonCards } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import ProjectCard from '../components/ProjectCard';
import { useProjects } from '../hooks/useProjects';
import { useDocumentTitle } from '../hooks/useUtilities';

export default function Projects() {
  useDocumentTitle('Projects');
  const { openNewProject } = useOutletContext();
  const { projects, loading, error, reload } = useProjects();
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (projects || []).filter((p) => !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }, [projects, query]);

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Every project you own or have been added to."
        actions={
          <Button variant="primary" icon={Plus} onClick={openNewProject}>
            New project
          </Button>
        }
      />
      {loading ? (
        <SkeletonCards count={6} />
      ) : error ? (
        <div className="panel"><ErrorState error={error} onRetry={reload} /></div>
      ) : projects.length === 0 ? (
        <div className="panel">
          <EmptyState icon={FolderKanban} title="No projects yet." body="Create your first project and bring your team together." action={<Button variant="primary" icon={Plus} onClick={openNewProject}>New project</Button>} />
        </div>
      ) : (
        <>
          {projects.length > 6 && (
            <div className="table-toolbar">
              <label className="search-field">
                <Search size={15} aria-hidden="true" />
                <span className="sr-only">Search projects</span>
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects" />
              </label>
            </div>
          )}
          {shown.length === 0 ? (
            <div className="panel"><EmptyState compact icon={SearchX} title="No projects match that search." action={<Button size="sm" onClick={() => setQuery('')}>Clear search</Button>} /></div>
          ) : (
            <div className="project-grid">
              {shown.map((p) => (
                <ProjectCard key={p._id} project={p} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
