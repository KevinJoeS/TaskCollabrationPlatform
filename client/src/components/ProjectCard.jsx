import { memo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { AvatarStack } from './ui/Avatar';
import { Progress } from './ui/Misc';

export const projectPercent = (p) => (p.stats?.total ? Math.round((p.stats.done / p.stats.total) * 100) : 0);

function ProjectCard({ project }) {
  const { total = 0, done = 0, overdue = 0 } = project.stats || {};
  const pct = projectPercent(project);
  return (
    <Link to={`/projects/${project._id}`} className="project-card panel">
      <h3 className="project-card-name">{project.name}</h3>
      <p className="project-card-desc">{project.description || 'No description yet.'}</p>
      <div className="project-card-progress">
        <div className="project-card-progress-row">
          <span className="num">{total ? `${done} of ${total} tasks done` : 'No tasks yet'}</span>
          {total > 0 && <strong className="num">{pct}%</strong>}
        </div>
        <Progress value={pct} label={`${project.name} completion`} />
      </div>
      <footer className="project-card-foot">
        <AvatarStack users={project.members} max={4} size={24} />
        {overdue > 0 && (
          <span className="due due-overdue num">
            <AlertTriangle size={13} aria-hidden="true" />
            {overdue} overdue
          </span>
        )}
      </footer>
    </Link>
  );
}

export default memo(ProjectCard);
