import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { HttpError, isValidId } from './http.js';

export const sameId = (a, b) => String(a?._id ?? a) === String(b?._id ?? b);

/** Loads a project the user belongs to. 404 when it does not exist, 403 when the user is not a member. */
export async function loadProjectForMember(projectId, userId) {
  if (!isValidId(String(projectId))) throw new HttpError(400, 'Invalid project id');
  const project = await Project.findById(projectId);
  if (!project) throw new HttpError(404, 'Project not found');
  if (!project.members.some((m) => sameId(m, userId))) throw new HttpError(403, 'You are not a member of this project');
  return project;
}

/** Loads a task plus its project, enforcing project membership. */
export async function loadTaskForMember(taskId, userId) {
  const task = await Task.findById(taskId);
  if (!task) throw new HttpError(404, 'Task not found');
  const project = await loadProjectForMember(String(task.project), userId);
  return { task, project };
}

export const projectIdsFor = (userId) => Project.find({ members: userId }).distinct('_id');
