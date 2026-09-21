import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { createProject, listProjects, getProject, updateProject, addMember, removeMember, deleteProject } from '../controllers/projectController.js';
import { asyncHandler as h, validateIdParam } from '../utils/http.js';

const r = Router();
r.use(auth);
r.param('id', validateIdParam('project'));
r.param('userId', validateIdParam('user'));
r.post('/', h(createProject));
r.get('/', h(listProjects));
r.get('/:id', h(getProject));
r.put('/:id', h(updateProject));
r.post('/:id/members', h(addMember));
r.delete('/:id/members/:userId', h(removeMember));
r.delete('/:id', h(deleteProject));
export default r;
