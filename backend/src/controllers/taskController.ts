import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        assignees: {
          select: {
            id: true,
            fullName: true,
            studentId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Map to frontend friendly format
    const formattedTasks = tasks.map(t => ({
      ...t,
      dueDate: t.dueDate.toISOString().split('T')[0],
      assignedTo: t.assignees.map(a => a.id) 
    }));

    res.json(formattedTasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  const { title, status, priority, dueDate, assignedTo } = req.body;

  try {
    const task = await prisma.task.create({
      data: {
        title,
        status,
        priority,
        dueDate: new Date(dueDate),
        assignees: {
          connect: assignedTo.map((id: string) => ({ id })),
        },
      },
      include: {
        assignees: true
      }
    });
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const task = await prisma.task.update({
      where: { id },
      data: { status },
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};
