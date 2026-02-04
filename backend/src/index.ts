import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import financeRoutes from './routes/financeRoutes';
import eventRoutes from './routes/eventRoutes';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/events', eventRoutes);

// Generic Routes for Members (Stubbed for now, normally would be imported)
app.get('/api/members', async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      include: { committees: { include: { committee: true } } }
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Health Check
app.get('/', (req, res) => {
  res.send('AMIS API is running...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});