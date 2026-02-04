import express from 'express';
import { getEvents, createEvent, getEventAttendance, markAttendance } from '../controllers/eventController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';

const router = express.Router();

// Events CRUD
router.get('/', authenticateToken, getEvents);
router.post('/', authenticateToken, authorizeRole(['Admin', 'President', 'General Secretary', 'Committee Lead']), createEvent);

// Attendance
router.get('/:id/attendance', authenticateToken, getEventAttendance);
router.post('/:id/attendance', authenticateToken, authorizeRole(['Admin', 'President', 'General Secretary', 'Committee Lead']), markAttendance);

export default router;