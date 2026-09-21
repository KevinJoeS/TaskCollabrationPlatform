import { useResource } from '../lib/store';
import { projectService } from '../services/project';

export const useProjects = () => {
  const r = useResource('projects', projectService.list);
  return { ...r, projects: r.data };
};

export const useProject = (id) => {
  const r = useResource(id ? `project:${id}` : null, () => projectService.get(id));
  return { ...r, project: r.data?.project, tasks: r.data?.tasks };
};
