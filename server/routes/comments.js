import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { listComments, addComment, deleteComment } from '../controllers/commentController.js';
import { asyncHandler as h, validateIdParam } from '../utils/http.js';

const r = Router();
r.use(auth);
r.param('taskId', validateIdParam('task'));
r.param('id', validateIdParam('comment'));
r.get('/task/:taskId', h(listComments));
r.post('/task/:taskId', h(addComment));
r.delete('/:id', h(deleteComment));
export default r;
