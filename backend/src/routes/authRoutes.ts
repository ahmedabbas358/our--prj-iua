import express from 'express';
import { login, register, signup } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { loginSchema, registerSchema } from '../utils/validationSchemas';

const router = express.Router();

router.post('/login', validateRequest(loginSchema), login);
// Public signup using the same schema as register but strict on fields in controller
router.post('/signup', validateRequest(registerSchema), signup);

router.post('/register', authenticateToken, validateRequest(registerSchema), register);

router.get('/me', authenticateToken, (req: any, res) => {
  res.json({ user: req.user });
});

export default router;