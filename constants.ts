import { Member, Role, CommitteeType, Event, Task, FinanceEntry } from './types';

export const SEED_MEMBERS: Member[] = [
  {
    id: '1',
    fullName: 'Ahmed Abbas (Admin)',
    studentId: '1001',
    email: 'admin@amis.local',
    phone: '+249912345678',
    joinDate: '2023-01-01',
    role: Role.PRESIDENT,
    status: 'Active',
    committees: [CommitteeType.EXECUTIVE]
  },
  {
    id: '2',
    fullName: 'Sara Ali',
    studentId: '1002',
    email: 'sara@amis.local',
    phone: '+249912345679',
    joinDate: '2023-02-15',
    role: Role.VICE_PRESIDENT,
    status: 'Active',
    committees: [CommitteeType.EXECUTIVE]
  },
  {
    id: '3',
    fullName: 'Mohammed Osman',
    studentId: '1003',
    email: 'mohammed@amis.local',
    phone: '+249912345680',
    joinDate: '2023-02-20',
    role: Role.GENERAL_SECRETARY,
    status: 'Active',
    committees: [CommitteeType.EXECUTIVE]
  },
  {
    id: '4',
    fullName: 'Fatima Hassan',
    studentId: '1004',
    email: 'fatima.media@amis.local',
    phone: '+249912345681',
    joinDate: '2023-03-01',
    role: Role.COMMITTEE_LEAD,
    status: 'Active',
    committees: [CommitteeType.MEDIA]
  },
  {
    id: '5',
    fullName: 'Omar Khalid',
    studentId: '1005',
    email: 'omar.env@amis.local',
    phone: '+249912345682',
    joinDate: '2023-03-05',
    role: Role.COMMITTEE_LEAD,
    status: 'Active',
    committees: [CommitteeType.ENVIRONMENT]
  },
  {
    id: '6',
    fullName: 'Layla Ibrahim',
    studentId: '1006',
    email: 'layla.pr@amis.local',
    phone: '+249912345683',
    joinDate: '2023-03-10',
    role: Role.COMMITTEE_LEAD,
    status: 'Active',
    committees: [CommitteeType.PUBLIC_RELATIONS]
  },
  {
    id: '7',
    fullName: 'Yusuf Ahmed',
    studentId: '1007',
    email: 'yusuf.fin@amis.local',
    phone: '+249912345684',
    joinDate: '2023-03-12',
    role: Role.TREASURER,
    status: 'Active',
    committees: [CommitteeType.FINANCE]
  },
  {
    id: '8',
    fullName: 'Khalid Mustafa',
    studentId: '1008',
    email: 'khalid.sport@amis.local',
    phone: '+249912345685',
    joinDate: '2023-03-15',
    role: Role.COMMITTEE_LEAD,
    status: 'Active',
    committees: [CommitteeType.SPORTS]
  },
  {
    id: '9',
    fullName: 'Amina Salih',
    studentId: '1009',
    email: 'amina.acad@amis.local',
    phone: '+249912345686',
    joinDate: '2023-03-20',
    role: Role.COMMITTEE_LEAD,
    status: 'Active',
    committees: [CommitteeType.ACADEMIC]
  },
  {
    id: '10',
    fullName: 'Hassan Mahmoud',
    studentId: '1010',
    email: 'hassan.cult@amis.local',
    phone: '+249912345687',
    joinDate: '2023-03-25',
    role: Role.COMMITTEE_LEAD,
    status: 'Active',
    committees: [CommitteeType.CULTURAL]
  },
  {
    id: '11',
    fullName: 'Zainab Abdullah',
    studentId: '1011',
    email: 'zainab.soc@amis.local',
    phone: '+249912345688',
    joinDate: '2023-03-30',
    role: Role.COMMITTEE_LEAD,
    status: 'Active',
    committees: [CommitteeType.SOCIAL]
  }
];

export const MOCK_EVENTS: Event[] = [
  { id: '1', title: 'General Assembly Meeting', date: '2025-11-30', location: 'Hall A', description: 'Quarterly general meeting.', attendees: 45 },
  { id: '2', title: 'Tech Talk: AI in Africa', date: '2025-12-05', location: 'Auditorium', description: 'Guest speaker session.', attendees: 120 },
  { id: '3', title: 'Coding Bootcamp Setup', date: '2025-12-10', location: 'Lab 3', description: 'Preparing machines for the bootcamp.', attendees: 10 },
];

export const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Prepare Budget Report', assignedTo: ['7'], status: 'In Progress', dueDate: '2025-11-29', priority: 'High' },
  { id: '2', title: 'Design Event Poster', assignedTo: ['4'], status: 'Done', dueDate: '2025-11-25', priority: 'Medium' },
  { id: '3', title: 'Book Venue for Workshop', assignedTo: ['6'], status: 'New', dueDate: '2025-12-01', priority: 'High' },
  { id: '4', title: 'Update Member Registry', assignedTo: ['3'], status: 'New', dueDate: '2025-12-05', priority: 'Low' },
];

export const MOCK_FINANCE: FinanceEntry[] = [
  { id: '1', type: 'Income', amount: 500000, description: 'University Grant', date: '2025-11-01', category: 'Grant', enteredBy: 'Yusuf Ahmed' },
  { id: '2', type: 'Expense', amount: 50000, description: 'Welcome Party Refreshments', date: '2025-11-05', category: 'Events', enteredBy: 'Yusuf Ahmed' },
  { id: '3', type: 'Income', amount: 150000, description: 'Membership Fees', date: '2025-11-10', category: 'Fees', enteredBy: 'Yusuf Ahmed' },
  { id: '4', type: 'Expense', amount: 25000, description: 'Printing Posters', date: '2025-11-15', category: 'Marketing', enteredBy: 'Yusuf Ahmed' },
];
