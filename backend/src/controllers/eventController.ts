import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- Events ---

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: {
        _count: {
          select: { attendance: { where: { status: 'Present' } } }
        }
      }
    });

    const formattedEvents = events.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date.toISOString(),
      location: e.location,
      description: e.description || '',
      attendees: e._count.attendance
    }));

    res.json(formattedEvents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  const { title, date, location, description } = req.body;
  try {
    const event = await prisma.event.create({
      data: {
        title,
        date: new Date(date),
        location,
        description
      }
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
};

// --- Attendance ---

export const getEventAttendance = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const attendance = await prisma.attendance.findMany({
      where: { eventId: id },
      include: {
        member: {
          select: { id: true, fullName: true, studentId: true }
        }
      }
    });

    const formatted = attendance.map(a => ({
      eventId: a.eventId,
      memberId: a.memberId,
      status: a.status,
      memberName: a.member.fullName,
      studentId: a.member.studentId
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

export const markAttendance = async (req: Request, res: Response) => {
  const { id } = req.params; // Event ID
  const { memberId, status } = req.body; // status: Present, Absent, Excused

  try {
    const record = await prisma.attendance.upsert({
      where: {
        eventId_memberId: {
          eventId: id,
          memberId: memberId
        }
      },
      update: { status },
      create: {
        eventId: id,
        memberId,
        status
      }
    });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update attendance' });
  }
};