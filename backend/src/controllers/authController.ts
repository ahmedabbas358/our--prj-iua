import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const register = async (req: Request, res: Response) => {
  // Admin only - allows setting specific roles
  const { fullName, studentId, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'MEMBER',
        member: {
          create: {
            fullName,
            studentId,
            email,
          }
        }
      }
    });

    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', details: error });
  }
};

export const signup = async (req: Request, res: Response) => {
  // Public registration - forces role to MEMBER
  const { fullName, studentId, email, password, phone } = req.body;

  try {
    // Check for existing
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const existingStudent = await prisma.member.findUnique({ where: { studentId } });
    if (existingStudent) return res.status(400).json({ error: 'Student ID already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'MEMBER',
        member: {
          create: {
            fullName,
            studentId,
            email,
            phone
          }
        }
      }
    });

    res.status(201).json({ message: 'Registration successful. Please login.', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};