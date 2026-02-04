import express from 'express';
import { getTasks, createTask, updateTaskStatus } from '../controllers/taskController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { createTaskSchema } from '../utils/validationSchemas';

const router = express.Router();

router.get('/', authenticateToken, getTasks);
router.post('/', authenticateToken, validateRequest(createTaskSchema), createTask);
router.put('/:id/status', authenticateToken, updateTaskStatus);

export default router;
