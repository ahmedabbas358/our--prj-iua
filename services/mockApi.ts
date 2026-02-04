
import { SEED_MEMBERS, MOCK_EVENTS, MOCK_TASKS, MOCK_FINANCE } from '../constants';
import { Member, Event, Task, FinanceEntry, Stats, Attendance, AttendanceStatus, Role, CommitteeType, Post, Comment, Major } from '../types';

// Simple in-memory storage simulation with added semester data and major
let members: Member[] = SEED_MEMBERS.map((m, index) => ({ 
    ...m, 
    semester: `Semester ${Math.floor(Math.random() * 8) + 1}`,
    major: index % 3 === 0 ? 'CS' : index % 3 === 1 ? 'IT' : 'IS',
    coverImage: index % 2 === 0 ? 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1080' : undefined
}));

let events = [...MOCK_EVENTS];
let tasks = [...MOCK_TASKS];
let finance = [...MOCK_FINANCE];
// Mock Attendance Storage: Map<eventId, Map<memberId, status>>
let attendanceStore: Record<string, Record<string, AttendanceStatus>> = {};

// Feed Status
let studentFeedLocked = false;

// Mock Posts Data
let posts: Post[] = [
  {
    id: '101',
    authorId: '1',
    authorName: 'Ahmed Abbas (Admin)',
    authorRole: Role.PRESIDENT,
    authorSemester: 'Semester 8',
    authorMajor: 'CS',
    content: 'Welcome to the new academic year! We have exciting events planned for this semester including the Tech Summit and Coding Bootcamp. Stay tuned!',
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    likes: 15,
    likedBy: ['2', '3'],
    comments: [
      { id: 'c1', authorId: '4', authorName: 'Fatima Hassan', content: 'Can\'t wait for the Bootcamp!', date: new Date().toISOString() }
    ],
    type: 'Announcement',
    isLocked: false,
    isReported: false
  },
  {
    id: '102',
    authorId: '5',
    authorName: 'Omar Khalid',
    authorRole: Role.COMMITTEE_LEAD,
    authorSemester: 'Semester 6',
    authorMajor: 'IT',
    content: 'The Environment Committee is looking for volunteers for next week\'s campus cleanup drive. Who is interested?',
    date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    likes: 5,
    likedBy: ['1'],
    comments: [],
    type: 'Discussion',
    isLocked: false,
    isReported: false
  }
];

// --- Simulation of University Database for Verification ---
const UNIVERSITY_DB = [
    { studentId: '1001', name: 'Ahmed Abbas' },
    { studentId: '10234', name: 'Ali Ahmed' },
    { studentId: '10555', name: 'Sarah Connor' },
    { studentId: '10999', name: 'New Student' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Members
  getMembers: async (): Promise<Member[]> => {
    await delay(300);
    return members;
  },
  addMember: async (member: Member): Promise<Member> => {
    await delay(300);
    members.push(member);
    return member;
  },
  deleteMember: async (id: string): Promise<void> => {
    await delay(300);
    members = members.filter(m => m.id !== id);
  },

  // Committees
  getCommitteeStats: async (): Promise<any[]> => {
      await delay(300);
      const committees = Object.values(CommitteeType);
      return committees.map(type => {
          const committeeMembers = members.filter(m => m.committees.includes(type));
          const lead = committeeMembers.find(m => m.role === Role.COMMITTEE_LEAD || m.role === Role.PRESIDENT || m.role === Role.VICE_PRESIDENT);
          return {
              name: type,
              memberCount: committeeMembers.length,
              leadName: lead ? lead.fullName : 'Vacant',
              leadId: lead ? lead.id : null
          };
      });
  },

  // Auth & Registration
  getCurrentUser: async (): Promise<Member> => {
    await delay(200);
    // Simulate getting the logged-in user (returning the first admin for demo)
    return members[0];
  },
  updateCurrentUser: async (id: string, updates: Partial<Member>): Promise<Member> => {
    await delay(300);
    const index = members.findIndex(m => m.id === id);
    if (index !== -1) {
      members[index] = { ...members[index], ...updates };
      return members[index];
    }
    throw new Error('User not found');
  },
  
  verifyStudent: async (studentId: string, fullName: string): Promise<boolean> => {
    await delay(600);
    // Strict Name Matching
    const record = UNIVERSITY_DB.find(s => s.studentId === studentId);
    if (!record) return false;
    return record.name.toLowerCase() === fullName.toLowerCase();
  },

  sendVerificationCode: async (email: string): Promise<string> => {
    await delay(1000);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[EMAIL MOCK] Verification Code for ${email}: ${code}`);
    return code;
  },

  signup: async (data: any): Promise<void> => {
    await delay(800);
    if (members.find(m => m.email === data.email || m.studentId === data.studentId)) {
        throw new Error("User already exists");
    }

    const newMember: Member = {
        id: Math.random().toString(36).substr(2, 9),
        fullName: data.fullName,
        studentId: data.studentId,
        email: data.email,
        phone: data.phone || '',
        semester: data.semester || 'Semester 1',
        major: data.major || 'CS',
        joinDate: new Date().toISOString().split('T')[0],
        role: Role.MEMBER, // Default role
        status: 'Active',
        committees: []
    };
    members.push(newMember);
  },

  // Events
  getEvents: async (): Promise<Event[]> => {
    await delay(300);
    // Update attendee count based on mock attendance
    return events.map(e => ({
        ...e,
        attendees: attendanceStore[e.id] 
            ? Object.values(attendanceStore[e.id]).filter(s => s === 'Present').length
            : e.attendees
    }));
  },
  addEvent: async (event: Event): Promise<Event> => {
    await delay(300);
    events.push(event);
    return event;
  },

  // Attendance
  getEventAttendance: async (eventId: string): Promise<Attendance[]> => {
    await delay(300);
    const eventAttendance = attendanceStore[eventId] || {};
    return Object.entries(eventAttendance).map(([memberId, status]) => {
        const m = members.find(mem => mem.id === memberId);
        return {
            eventId,
            memberId,
            status,
            memberName: m?.fullName,
            studentId: m?.studentId
        };
    });
  },

  markAttendance: async (eventId: string, memberId: string, status: AttendanceStatus): Promise<void> => {
      await delay(200);
      if (!attendanceStore[eventId]) {
          attendanceStore[eventId] = {};
      }
      attendanceStore[eventId][memberId] = status;
  },

  // Tasks
  getTasks: async (): Promise<Task[]> => {
    await delay(300);
    return tasks;
  },
  updateTaskStatus: async (id: string, status: Task['status']): Promise<void> => {
    await delay(200);
    tasks = tasks.map(t => t.id === id ? { ...t, status } : t);
  },
  addTask: async (task: Task): Promise<Task> => {
    await delay(300);
    tasks.push(task);
    return task;
  },

  // Finance
  getFinanceEntries: async (): Promise<FinanceEntry[]> => {
    await delay(300);
    return finance;
  },
  addFinanceEntry: async (entry: FinanceEntry): Promise<FinanceEntry> => {
    await delay(300);
    finance.push(entry);
    return entry;
  },

  // Dashboard Stats
  getStats: async (): Promise<Stats> => {
    await delay(400);
    const totalIncome = finance.filter(f => f.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = finance.filter(f => f.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
    
    return {
      totalMembers: members.length,
      activeEvents: events.length,
      pendingTasks: tasks.filter(t => t.status !== 'Done').length,
      balance: totalIncome - totalExpense
    };
  },

  // --- Community API ---
  getPosts: async (): Promise<Post[]> => {
    await delay(300);
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addPost: async (postData: Partial<Post>): Promise<Post> => {
    await delay(300);
    if (studentFeedLocked && postData.type === 'Discussion' && postData.authorRole === Role.MEMBER) {
        throw new Error("Feed is locked by admins.");
    }

    const newPost: Post = {
        id: Math.random().toString(36).substr(2, 9),
        authorId: postData.authorId!,
        authorName: postData.authorName!,
        authorRole: postData.authorRole!,
        authorSemester: postData.authorSemester || 'Semester 1',
        authorMajor: postData.authorMajor || 'CS',
        content: postData.content!,
        date: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        comments: [],
        type: postData.type as 'Announcement' | 'Discussion',
        media: postData.media || [],
        isLocked: false,
        isReported: false
    };
    posts.unshift(newPost);
    return newPost;
  },

  deletePost: async (postId: string): Promise<void> => {
    await delay(300);
    posts = posts.filter(p => p.id !== postId);
  },

  reportPost: async (postId: string): Promise<void> => {
    await delay(200);
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
        posts[index].isReported = true;
    }
  },

  toggleLockPost: async (postId: string): Promise<boolean> => {
    await delay(200);
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
        posts[index].isLocked = !posts[index].isLocked;
        return posts[index].isLocked!;
    }
    return false;
  },

  getFeedStatus: async (): Promise<{isLocked: boolean}> => {
    await delay(100);
    return { isLocked: studentFeedLocked };
  },

  setFeedStatus: async (locked: boolean): Promise<void> => {
    await delay(300);
    studentFeedLocked = locked;
  },

  toggleLike: async (postId: string, userId: string): Promise<Post> => {
    await delay(100);
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) throw new Error("Post not found");
    
    const post = posts[postIndex];
    const hasLiked = post.likedBy.includes(userId);
    
    let updatedPost;
    if (hasLiked) {
        updatedPost = { 
            ...post, 
            likes: post.likes - 1, 
            likedBy: post.likedBy.filter(id => id !== userId) 
        };
    } else {
        updatedPost = { 
            ...post, 
            likes: post.likes + 1, 
            likedBy: [...post.likedBy, userId] 
        };
    }
    posts[postIndex] = updatedPost;
    return updatedPost;
  },

  addComment: async (postId: string, comment: {authorId: string, authorName: string, content: string}): Promise<Comment> => {
    await delay(200);
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) throw new Error("Post not found");
    
    if (posts[postIndex].isLocked) {
        throw new Error("Comments are locked for this post");
    }

    const newComment: Comment = {
        id: Math.random().toString(36).substr(2, 9),
        ...comment,
        date: new Date().toISOString()
    };
    
    posts[postIndex].comments.push(newComment);
    return newComment;
  }
};
