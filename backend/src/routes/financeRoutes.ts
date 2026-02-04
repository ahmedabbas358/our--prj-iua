import express from 'express';
import { getFinanceEntries, addFinanceEntry } from '../controllers/financeController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { createFinanceSchema } from '../utils/validationSchemas';

const router = express.Router();

router.get('/', authenticateToken, authorizeRole(['Admin', 'Treasurer', 'President']), getFinanceEntries);
router.post('/', authenticateToken, authorizeRole(['Admin', 'Treasurer']), validateRequest(createFinanceSchema), addFinanceEntry);

export default router;
