import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Define enums locally since we can't import from client in seed easily without build
const Role = {
  ADMIN: 'Admin',
  PRESIDENT: 'President',
  VICE_PRESIDENT: 'Vice President',
  GENERAL_SECRETARY: 'General Secretary',
  TREASURER: 'Treasurer',
  COMMITTEE_LEAD: 'Committee Lead',
  MEMBER: 'Member',
};

const CommitteeType = {
  MEDIA: 'Media',
  ENVIRONMENT: 'Environment',
  PUBLIC_RELATIONS: 'Public Relations',
  FINANCE: 'Finance',
  SPORTS: 'Sports',
  ACADEMIC: 'Academic',
  CULTURAL: 'Cultural',
  SOCIAL: 'Social',
  EXECUTIVE: 'Executive'
};

const prisma = new PrismaClient();

const SEED_MEMBERS = [
  { fullName: 'Ahmed Abbas (Admin)', studentId: '1001', email: 'admin@amis.local', phone: '+249912345678', role: Role.PRESIDENT, committee: CommitteeType.EXECUTIVE },
  { fullName: 'Sara Ali', studentId: '1002', email: 'sara@amis.local', phone: '+249912345679', role: Role.VICE_PRESIDENT, committee: CommitteeType.EXECUTIVE },
  { fullName: 'Mohammed Osman', studentId: '1003', email: 'mohammed@amis.local', phone: '+249912345680', role: Role.GENERAL_SECRETARY, committee: CommitteeType.EXECUTIVE },
  { fullName: 'Fatima Hassan', studentId: '1004', email: 'fatima.media@amis.local', phone: '+249912345681', role: Role.COMMITTEE_LEAD, committee: CommitteeType.MEDIA },
  { fullName: 'Omar Khalid', studentId: '1005', email: 'omar.env@amis.local', phone: '+249912345682', role: Role.COMMITTEE_LEAD, committee: CommitteeType.ENVIRONMENT },
  { fullName: 'Yusuf Ahmed', studentId: '1007', email: 'yusuf.fin@amis.local', phone: '+249912345684', role: Role.TREASURER, committee: CommitteeType.FINANCE },
];

async function main() {
  console.log('🌱 Starting Seed...');

  // 1. Create Committees
  for (const type of Object.values(CommitteeType)) {
    await prisma.committee.upsert({
      where: { name: type },
      update: {},
      create: { name: type },
    });
  }

  const createdMembers = [];

  // 2. Create Users & Members
  for (const member of SEED_MEMBERS) {
    const hashedPassword = await bcrypt.hash(member.email === 'admin@amis.local' ? 'Admin@123' : 'password123', 10);
    
    // Create User Login
    const user = await prisma.user.upsert({
      where: { email: member.email },
      update: {},
      create: {
        email: member.email,
        password: hashedPassword,
        role: member.role,
      },
    });

    // Create Member Profile
    const createdMember = await prisma.member.upsert({
      where: { email: member.email },
      update: {},
      create: {
        userId: user.id,
        fullName: member.fullName,
        studentId: member.studentId,
        email: member.email,
        phone: member.phone,
      },
    });
    createdMembers.push(createdMember);

    // Assign to Committee
    const committee = await prisma.committee.findUnique({ where: { name: member.committee } });
    if (committee) {
      await prisma.memberCommittee.create({
        data: {
          memberId: createdMember.id,
          committeeId: committee.id,
        },
      });
    }
  }

  // 3. Mock Events
  await prisma.event.create({
    data: {
      title: 'General Assembly Meeting',
      date: new Date('2025-11-30'),
      location: 'Hall A',
      description: 'Quarterly general meeting for all members.',
    }
  });

  // 4. Mock Finance
  await prisma.financeEntry.create({
    data: {
      type: 'Income',
      amount: 500000,
      description: 'University Grant',
      category: 'Grant',
      enteredBy: 'Yusuf Ahmed'
    }
  });

  // 5. Mock Tasks
  if (createdMembers.length > 0) {
    const yusuf = createdMembers.find(m => m.fullName.includes('Yusuf'));
    const fatima = createdMembers.find(m => m.fullName.includes('Fatima'));

    await prisma.task.create({
      data: {
        title: 'Prepare Budget Report',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date('2025-11-29'),
        assignees: {
          connect: yusuf ? [{ id: yusuf.id }] : []
        }
      }
    });

    await prisma.task.create({
      data: {
        title: 'Design Event Poster',
        status: 'New',
        priority: 'Medium',
        dueDate: new Date('2025-12-05'),
        assignees: {
           connect: fatima ? [{ id: fatima.id }] : []
        }
      }
    });
  }

  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    (process as any).exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
