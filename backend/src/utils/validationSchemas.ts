import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  studentId: z.string().min(3, 'Student ID is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.string().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  status: z.enum(['New', 'In Progress', 'Done']),
  priority: z.enum(['Low', 'Medium', 'High']),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  assignedTo: z.array(z.string()).min(1, 'Assign at least one member'),
});

export const createFinanceSchema = z.object({
  type: z.enum(['Income', 'Expense']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(3, 'Description is required'),
  category: z.string().optional(),
});
