import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getFinanceEntries = async (req: Request, res: Response) => {
  try {
    const entries = await prisma.financeEntry.findMany({
      orderBy: { date: 'desc' }
    });
    
    const formattedEntries = entries.map(e => ({
      ...e,
      date: e.date.toISOString().split('T')[0]
    }));

    res.json(formattedEntries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch finance entries' });
  }
};

export const addFinanceEntry = async (req: Request, res: Response) => {
  const { type, amount, description, category } = req.body;
  // Use user info from auth middleware if available
  const enteredBy = (req as any).user?.email || 'System'; 

  try {
    const entry = await prisma.financeEntry.create({
      data: {
        type,
        amount,
        description,
        category,
        enteredBy,
        date: new Date()
      }
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create finance entry' });
  }
};
