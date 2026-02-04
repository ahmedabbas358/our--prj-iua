
export enum Role {
  ADMIN = 'Admin',
  PRESIDENT = 'President',
  VICE_PRESIDENT = 'Vice President',
  GENERAL_SECRETARY = 'General Secretary',
  TREASURER = 'Treasurer',
  COMMITTEE_LEAD = 'Committee Lead',
  MEMBER = 'Member',
}

export enum CommitteeType {
  MEDIA = 'Media',
  ENVIRONMENT = 'Environment',
  PUBLIC_RELATIONS = 'Public Relations',
  FINANCE = 'Finance',
  SPORTS = 'Sports',
  ACADEMIC = 'Academic',
  CULTURAL = 'Cultural',
  SOCIAL = 'Social',
  EXECUTIVE = 'Executive'
}

export type Major = 'CS' | 'IT' | 'IS';

export interface CommitteeStats {
    name: string;
    memberCount: number;
    leadName: string;
    leadId: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Member {
  id: string;
  userId?: string;
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  joinDate?: string;
  role: Role;
  status?: 'Active' | 'Inactive';
  committees: CommitteeType[];
  semester?: string; // e.g., "Semester 5"
  major?: Major;
  coverImage?: string; // New: Profile Cover Image
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  attendees: number;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Excused';

export interface Attendance {
  eventId: string;
  memberId: string;
  status: AttendanceStatus;
  memberName?: string; // Optional for UI convenience
  studentId?: string;
}

export interface Task {
  id: string;
  title: string;
  assignedTo: string[]; // Member IDs
  status: 'New' | 'In Progress' | 'Done';
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
}

export interface FinanceEntry {
  id: string;
  type: 'Income' | 'Expense';
  amount: number;
  description: string;
  date: string;
  category: string;
  enteredBy: string;
}

export interface Stats {
  totalMembers: number;
  activeEvents: number;
  pendingTasks: number;
  balance: number;
}

// --- Social / Community Types ---
export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  date: string;
}

export interface MediaAttachment {
  type: 'image' | 'video';
  url: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  authorSemester?: string;
  authorMajor?: Major;
  content: string;
  date: string;
  likes: number; // Count of likes
  likedBy: string[]; // IDs of users who liked
  comments: Comment[];
  type: 'Announcement' | 'Discussion';
  media?: MediaAttachment[];
  isLocked?: boolean; // New: Comments locked by admin
  isReported?: boolean; // New: Flagged by users
}

export interface FeedStatus {
  isLocked: boolean;
}
