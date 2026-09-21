import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { createTask, listTasks, getTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { asyncHandler as h, validateIdParam } from '../utils/http.js';

const r = Router();
r.use(auth);
r.param('id', validateIdParam('task'));
r.post('/', h(createTask));
r.get('/', h(listTasks));
r.get('/:id', h(getTask));
r.put('/:id', h(updateTask));
r.delete('/:id', h(deleteTask));
export default r;
